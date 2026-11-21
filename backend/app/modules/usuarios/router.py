from typing import Annotated

from fastapi import APIRouter, Depends, Path

from app.core.deps import (
    get_usuario_service,
    require_role,
)
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService


router = APIRouter(
    prefix="/admin/usuarios",
    tags=["Administracion de usuarios"],
)

AdminUser = Annotated[
    UserPublic,
    Depends(require_role(["admin"])),
]

Service = Annotated[
    UsuarioService,
    Depends(get_usuario_service),
]

UsuarioId = Annotated[int, Path(gt=0)]


@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    administrador: AdminUser,
    service: Service,
) -> list[UserPublic]:
    return service.get_all()


@router.post(
    "/{usuario_id}/activar",
    response_model=UserPublic,
)
def activar_usuario(
    usuario_id: UsuarioId,
    administrador: AdminUser,
    service: Service,
) -> UserPublic:
    return service.activar(usuario_id)


@router.post(
    "/{usuario_id}/desactivar",
    response_model=UserPublic,
)
def desactivar_usuario(
    usuario_id: UsuarioId,
    administrador: AdminUser,
    service: Service,
) -> UserPublic:
    return service.desactivar(
        usuario_id,
        administrador.id,
    )
