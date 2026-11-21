from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoRead,
    ProductoStockUpdate,
    ProductosPaginados,
)
from app.modules.productos.unit_of_work import (
    ProductoUnitOfWork,
)


class ProductoNoEncontrado(Exception):
    pass


class CategoriaNoEncontrada(Exception):
    pass


class ProductoService:

    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def get_all(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:

        with self.uow as uow:
            total, productos = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )

            return ProductosPaginados(
                total=total,
                items=[
                    ProductoRead.model_validate(producto)
                    for producto in productos
                ],
            )

    def get_by_id(
        self,
        producto_id: int,
    ) -> ProductoRead:

        with self.uow as uow:
            producto = uow.productos.get_active_by_id(
                producto_id
            )

            if producto is None:
                raise ProductoNoEncontrado(
                    "Producto no encontrado"
                )

            return ProductoRead.model_validate(producto)

    def create(
        self,
        datos: ProductoCreate,
    ) -> ProductoRead:

        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(
                datos.categoria_id
            )

            if categoria is None:
                raise CategoriaNoEncontrada(
                    "Categoria no encontrada o inactiva"
                )

            producto = Producto(
                **datos.model_dump(),
                activo=True,
            )

            producto = uow.productos.add(producto)

            return ProductoRead.model_validate(producto)

    def update(
        self,
        producto_id: int,
        datos: ProductoUpdate,
    ) -> ProductoRead:

        with self.uow as uow:
            producto = uow.productos.get_by_id_for_update(
                producto_id
            )

            if producto is None or not producto.activo:
                raise ProductoNoEncontrado(
                    "Producto no encontrado"
                )

            cambios = datos.model_dump(exclude_unset=True)

            if (
                "categoria_id" in cambios
                and cambios["categoria_id"] != producto.categoria_id
            ):
                categoria = uow.categorias.get_active_by_id(
                    cambios["categoria_id"]
                )

                if categoria is None:
                    raise CategoriaNoEncontrada(
                        "Categoria no encontrada o inactiva"
                    )

                producto.categoria = categoria

            for campo, valor in cambios.items():
                setattr(producto, campo, valor)

            uow.session.flush()

            return ProductoRead.model_validate(producto)

    def update_stock(
        self,
        producto_id: int,
        datos: ProductoStockUpdate,
    ) -> ProductoRead:

        with self.uow as uow:
            producto = uow.productos.get_by_id_for_update(
                producto_id
            )

            if producto is None or not producto.activo:
                raise ProductoNoEncontrado(
                    "Producto no encontrado"
                )

            producto.stock = datos.stock
            producto.disponible = datos.disponible

            return ProductoRead.model_validate(producto)

    def delete(self, producto_id: int) -> None:

        with self.uow as uow:
            producto = uow.productos.get_by_id_for_update(
                producto_id
            )

            if producto is None or not producto.activo:
                raise ProductoNoEncontrado(
                    "Producto no encontrado"
                )

            producto.activo = False


