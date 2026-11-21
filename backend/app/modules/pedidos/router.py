from collections.abc import Callable
from functools import wraps
from typing import Annotated, ParamSpec, TypeVar

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Path,
    Query,
    status,
)

from app.core.deps import (
    get_current_active_user,
    get_pedido_service,
    require_role,
)

from app.modules.usuarios.schemas import UserPublic

from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    CambioEstado,
    EstadoPedido,
    ResumenPedidos,
)

from app.modules.pedidos.service import (
    PedidoService,
    PedidoNoEncontrado,
    ProductoNoEncontrado,
    ProductoNoDisponible,
    StockInsuficiente,
    ProductosRepetidos,
    TransicionInvalida,
    AccesoDenegado,
)


router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"],
)


CurrentUser = Annotated[
    UserPublic,
    Depends(get_current_active_user),
]

AdminUser = Annotated[
    UserPublic,
    Depends(require_role(["admin"])),
]

Service = Annotated[
    PedidoService,
    Depends(get_pedido_service),
]

PedidoId = Annotated[int, Path(gt=0)]

Skip = Annotated[int, Query(ge=0)]

Limit = Annotated[int, Query(ge=1, le=100)]


P = ParamSpec("P")
R = TypeVar("R")


def ejecutar(
    operacion: Callable[P, R],
) -> Callable[P, R]:

    @wraps(operacion)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:

        try:
            return operacion(*args, **kwargs)

        except (
            PedidoNoEncontrado,
            ProductoNoEncontrado,
        ) as error:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(error),
            ) from error

        except (
            ProductoNoDisponible,
            StockInsuficiente,
            ProductosRepetidos,
            TransicionInvalida,
        ) as error:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(error),
            ) from error

        except AccesoDenegado as error:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(error),
            ) from error

    return wrapper


@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
)
@ejecutar
def crear_pedido(
    datos: PedidoCreate,
    usuario: CurrentUser,
    service: Service,
) -> PedidoRead:

    return service.create(datos, usuario)


@router.get(
    "",
    response_model=PedidosPaginados,
)
@ejecutar
def listar_pedidos(
    usuario: CurrentUser,
    service: Service,
    skip: Skip = 0,
    limit: Limit = 20,
    estado: EstadoPedido | None = None,
) -> PedidosPaginados:

    return service.get_all(
        usuario=usuario,
        estado=estado,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/resumen",
    response_model=ResumenPedidos,
)
@ejecutar
def obtener_resumen(
    administrador: AdminUser,
    service: Service,
) -> ResumenPedidos:

    return service.resumen(administrador)


@router.get(
    "/{pedido_id}",
    response_model=PedidoRead,
)
@ejecutar
def obtener_pedido(
    pedido_id: PedidoId,
    usuario: CurrentUser,
    service: Service,
) -> PedidoRead:

    return service.get_by_id(
        pedido_id,
        usuario,
    )


@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoRead,
)
@ejecutar
def cambiar_estado(
    pedido_id: PedidoId,
    datos: CambioEstado,
    administrador: AdminUser,
    service: Service,
) -> PedidoRead:

    return service.cambiar_estado(
        pedido_id,
        datos.estado,
        administrador,
    )


@router.patch(
    "/{pedido_id}/cancelar",
    response_model=PedidoRead,
)
@ejecutar
def cancelar_pedido(
    pedido_id: PedidoId,
    usuario: CurrentUser,
    service: Service,
) -> PedidoRead:

    return service.cancelar(
        pedido_id,
        usuario,
    )
