from collections.abc import Callable
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status

from app.core.security import decode_access_token
from app.modules.auth.service import AuthService
from app.modules.pedidos.service import PedidoService
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


def get_current_user(
    access_token: Annotated[str | None, Cookie()] = None,
) -> UserPublic:

    error_autenticacion = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado",
    )

    if not access_token:
        raise error_autenticacion

    subject = decode_access_token(access_token)

    if subject is None:
        raise error_autenticacion

    try:
        usuario_id = int(subject)

    except ValueError:
        raise error_autenticacion

    if usuario_id <= 0:
        raise error_autenticacion

    with UsuarioUnitOfWork() as uow:

        usuario = uow.usuarios.get_by_id(usuario_id)

        if usuario is None:
            raise error_autenticacion

        return UserPublic.model_validate(usuario)


def get_current_active_user(
    usuario: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:

    if usuario.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )

    return usuario


def require_role(
    roles: list[str],
) -> Callable[..., UserPublic]:

    def validar_rol(
        usuario: Annotated[
            UserPublic,
            Depends(get_current_active_user),
        ],
    ) -> UserPublic:

        if usuario.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permisos insuficientes",
            )

        return usuario

    return validar_rol


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())



def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())
