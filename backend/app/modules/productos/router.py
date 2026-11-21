from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Path,
    Query,
    Response,
    status,
)

from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoRead,
    ProductoStockUpdate,
    ProductosPaginados,
)
from app.modules.productos.service import (
    ProductoService,
    ProductoNoEncontrado,
    CategoriaNoEncontrada,
)
from app.modules.productos.unit_of_work import (
    ProductoUnitOfWork,
)


router = APIRouter(
    prefix="/productos",
    tags=["Productos"],
)


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


Service = Annotated[
    ProductoService,
    Depends(get_producto_service),
]

AdminUser = Annotated[
    UserPublic,
    Depends(require_role(["admin"])),
]

ProductoId = Annotated[int, Path(gt=0)]


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: Service,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query()] = None,
    categoria_id: Annotated[int | None, Query(gt=0)] = None,
    disponible: Annotated[bool | None, Query()] = None,
) -> ProductosPaginados:

    return service.get_all(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get(
    "/{producto_id}",
    response_model=ProductoRead,
)
def obtener_producto(
    producto_id: ProductoId,
    service: Service,
) -> ProductoRead:

    try:
        return service.get_by_id(producto_id)

    except ProductoNoEncontrado as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.post(
    "",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_producto(
    datos: ProductoCreate,
    administrador: AdminUser,
    service: Service,
) -> ProductoRead:

    try:
        return service.create(datos)

    except CategoriaNoEncontrada as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.put(
    "/{producto_id}",
    response_model=ProductoRead,
)
def actualizar_producto(
    producto_id: ProductoId,
    datos: ProductoUpdate,
    administrador: AdminUser,
    service: Service,
) -> ProductoRead:

    try:
        return service.update(producto_id, datos)

    except (
        ProductoNoEncontrado,
        CategoriaNoEncontrada,
    ) as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoRead,
)
def actualizar_stock(
    producto_id: ProductoId,
    datos: ProductoStockUpdate,
    administrador: AdminUser,
    service: Service,
) -> ProductoRead:

    try:
        return service.update_stock(producto_id, datos)

    except ProductoNoEncontrado as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def eliminar_producto(
    producto_id: ProductoId,
    administrador: AdminUser,
    service: Service,
) -> Response:

    try:
        service.delete(producto_id)

    except ProductoNoEncontrado as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )
