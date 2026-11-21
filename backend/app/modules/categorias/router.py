from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Path,
    Response,
    status,
)

from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaRead,
)
from app.modules.categorias.service import (
    CategoriaService,
    CategoriaNoEncontrada,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import (
    CategoriaUnitOfWork,
)


router = APIRouter(
    prefix="/categorias",
    tags=["Categorias"],
)


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


Service = Annotated[
    CategoriaService,
    Depends(get_categoria_service),
]

AdminUser = Annotated[
    UserPublic,
    Depends(require_role(["admin"])),
]

CategoriaId = Annotated[int, Path(gt=0)]


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(
    service: Service,
) -> list[CategoriaRead]:

    return service.get_all()


@router.get(
    "/{categoria_id}",
    response_model=CategoriaRead,
)
def obtener_categoria(
    categoria_id: CategoriaId,
    service: Service,
) -> CategoriaRead:

    try:
        return service.get_by_id(categoria_id)

    except CategoriaNoEncontrada as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_categoria(
    datos: CategoriaCreate,
    administrador: AdminUser,
    service: Service,
) -> CategoriaRead:

    try:
        return service.create(datos)

    except NombreDuplicado as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
)
def actualizar_categoria(
    categoria_id: CategoriaId,
    datos: CategoriaUpdate,
    administrador: AdminUser,
    service: Service,
) -> CategoriaRead:

    try:
        return service.update(categoria_id, datos)

    except CategoriaNoEncontrada as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    except NombreDuplicado as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def eliminar_categoria(
    categoria_id: CategoriaId,
    administrador: AdminUser,
    service: Service,
) -> Response:

    try:
        service.delete(categoria_id)

    except CategoriaNoEncontrada as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )
