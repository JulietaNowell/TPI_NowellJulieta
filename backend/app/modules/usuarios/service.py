from fastapi import HTTPException, status

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def get_all(self) -> list[UserPublic]:
        with self.uow as uow:
            usuarios = uow.usuarios.get_all()

            return [
                UserPublic.model_validate(usuario)
                for usuario in usuarios
            ]

    def activar(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)

            if usuario is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario no encontrado",
                )

            usuario.disabled = False

            return UserPublic.model_validate(usuario)

    def desactivar(
        self,
        usuario_id: int,
        administrador_id: int,
    ) -> UserPublic:

        if usuario_id == administrador_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puede desactivarse a si mismo",
            )

        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)

            if usuario is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario no encontrado",
                )

            usuario.disabled = True

            return UserPublic.model_validate(usuario)
