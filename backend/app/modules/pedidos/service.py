from datetime import datetime, timezone
from decimal import Decimal

from app.modules.pedidos.models import Pedido, DetallePedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    EstadoPedido,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.models import Producto
from app.modules.usuarios.schemas import UserPublic


class PedidoNoEncontrado(Exception):
    pass


class ProductoNoEncontrado(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductosRepetidos(Exception):
    pass


class TransicionInvalida(Exception):
    pass


class AccesoDenegado(Exception):
    pass


TRANSICIONES_PERMITIDAS = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:

    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def create(
        self,
        datos: PedidoCreate,
        usuario: UserPublic,
    ) -> PedidoRead:

        ids = [item.producto_id for item in datos.items]

        if len(ids) != len(set(ids)):
            raise ProductosRepetidos(
                "El pedido contiene productos repetidos"
            )

        with self.uow as uow:

            productos: dict[int, Producto] = {}

            # Bloquear siempre en orden ascendente de ID.
            for producto_id in sorted(ids):

                producto = uow.productos.get_by_id_for_update(
                    producto_id
                )

                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"Producto {producto_id} no encontrado"
                    )

                productos[producto_id] = producto

            total = Decimal("0")
            detalles: list[DetallePedido] = []

            for item in datos.items:

                producto = productos[item.producto_id]

                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"Producto {producto.nombre} no disponible"
                    )

                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para {producto.nombre}"
                    )

                precio = Decimal(str(producto.precio_base))
                subtotal = precio * item.cantidad

                producto.stock -= item.cantidad
                total += subtotal

                detalle = DetallePedido(
                    producto_id=item.producto_id,
                    nombre_producto=producto.nombre,
                    precio_unitario=float(precio),
                    cantidad=item.cantidad,
                    subtotal=float(subtotal),
                )

                detalles.append(detalle)

            pedido = Pedido(
                usuario_id=usuario.id,
                estado="PENDIENTE",
                forma_pago=datos.forma_pago,
                direccion_entrega=datos.direccion_entrega,
                notas=datos.notas,
                total=float(total),
            )

            pedido.items = detalles

            pedido = uow.pedidos.add(pedido)

            return PedidoRead.model_validate(pedido)

    def get_all(
        self,
        usuario: UserPublic,
        estado: EstadoPedido | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> PedidosPaginados:

        with self.uow as uow:

            usuario_id = (
                None if usuario.role == "admin"
                else usuario.id
            )

            total, pedidos = uow.pedidos.list_by_usuario(
                usuario_id=usuario_id,
                estado=estado,
                skip=skip,
                limit=limit,
            )

            return PedidosPaginados(
                total=total,
                items=[
                    PedidoRead.model_validate(pedido)
                    for pedido in pedidos
                ],
            )

    def get_by_id(
        self,
        pedido_id: int,
        usuario: UserPublic,
    ) -> PedidoRead:

        with self.uow as uow:

            pedido = uow.pedidos.get_by_id(pedido_id)

            if pedido is None:
                raise PedidoNoEncontrado(
                    "Pedido no encontrado"
                )

            self._validar_acceso(pedido, usuario)

            return PedidoRead.model_validate(pedido)

    def cambiar_estado(
        self,
        pedido_id: int,
        estado: EstadoPedido,
        usuario: UserPublic,
    ) -> PedidoRead:

        if usuario.role != "admin":
            raise AccesoDenegado(
                "Permisos insuficientes"
            )

        with self.uow as uow:

            pedido = uow.pedidos.get_by_id_for_update(
                pedido_id
            )

            if pedido is None:
                raise PedidoNoEncontrado(
                    "Pedido no encontrado"
                )

            self._aplicar_transicion(
                uow, pedido, estado
            )

            return PedidoRead.model_validate(pedido)

    def cancelar(
        self,
        pedido_id: int,
        usuario: UserPublic,
    ) -> PedidoRead:

        with self.uow as uow:

            pedido = uow.pedidos.get_by_id_for_update(
                pedido_id
            )

            if pedido is None:
                raise PedidoNoEncontrado(
                    "Pedido no encontrado"
                )

            self._validar_acceso(pedido, usuario)

            if (
                usuario.role != "admin"
                and pedido.estado != "PENDIENTE"
            ):
                raise TransicionInvalida(
                    "Solo se pueden cancelar pedidos pendientes"
                )

            self._aplicar_transicion(
                uow, pedido, "CANCELADO"
            )

            return PedidoRead.model_validate(pedido)

    def resumen(
        self,
        usuario: UserPublic,
    ) -> ResumenPedidos:

        if usuario.role != "admin":
            raise AccesoDenegado(
                "Permisos insuficientes"
            )

        with self.uow as uow:

            hoy = datetime.now(timezone.utc).replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0,
                tzinfo=None,
            )

            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado(
                    "PENDIENTE"
                ),
                en_preparacion=uow.pedidos.count_by_estado(
                    "EN_PREPARACION"
                ),
                entregados=uow.pedidos.count_by_estado(
                    "ENTREGADO"
                ),
                cancelados=uow.pedidos.count_by_estado(
                    "CANCELADO"
                ),
                pedidos_hoy=uow.pedidos.count_by_fecha(
                    hoy
                ),
                ingresos_entregados=(
                    uow.pedidos.sum_ingresos_entregados()
                ),
            )

    @staticmethod
    def _validar_acceso(
        pedido: Pedido,
        usuario: UserPublic,
    ) -> None:

        if (
            usuario.role != "admin"
            and pedido.usuario_id != usuario.id
        ):
            raise AccesoDenegado(
                "No tiene acceso a este pedido"
            )

    def _aplicar_transicion(
        self,
        uow: PedidoUnitOfWork,
        pedido: Pedido,
        estado: EstadoPedido,
    ) -> None:

        permitidos = TRANSICIONES_PERMITIDAS.get(
            pedido.estado, set()
        )

        if estado not in permitidos:
            raise TransicionInvalida(
                f"No se permite pasar de "
                f"{pedido.estado} a {estado}"
            )

        if estado == "CANCELADO":
            self._restituir_stock(uow, pedido)

        pedido.estado = estado

        pedido.updated_at = datetime.now(
            timezone.utc
        ).replace(tzinfo=None)

    @staticmethod
    def _restituir_stock(
        uow: PedidoUnitOfWork,
        pedido: Pedido,
    ) -> None:

        for item in sorted(
            pedido.items,
            key=lambda detalle: detalle.producto_id,
        ):

            producto = uow.productos.get_by_id_for_update(
                item.producto_id
            )

            if producto is None:
                raise ProductoNoEncontrado(
                    f"Producto {item.producto_id} no encontrado"
                )

            producto.stock += item.cantidad
