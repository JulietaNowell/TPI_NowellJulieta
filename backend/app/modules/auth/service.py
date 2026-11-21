from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def register(self, datos: UserCreate) -> UserPublic:
        try:
            with self.uow as uow:

                if uow.usuarios.get_by_username(datos.username):
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="El username ya existe",
                    )

                if uow.usuarios.get_by_email(str(datos.email)):
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="El email ya existe",
                    )

                usuario = Usuario(
                    username=datos.username,
                    full_name=datos.full_name,
                    email=str(datos.email),
                    hashed_password=hash_password(datos.password),
                    role="user",
                    disabled=False,
                )

                usuario = uow.usuarios.add(usuario)

                return UserPublic.model_validate(usuario)

        except IntegrityError as error:
            if getattr(error.orig, "pgcode", None) == "23505":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El username o email ya existe",
                ) from error

            raise

    def login(self, username: str, password: str) -> str:

        error_credenciales = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )

        if len(password.encode("utf-8")) > 72:
            raise error_credenciales

        with self.uow as uow:

            usuario = uow.usuarios.get_by_username(username)

            if usuario is None:
                raise error_credenciales

            if not verify_password(
                password,
                usuario.hashed_password,
            ):
                raise error_credenciales

            if usuario.disabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cuenta de usuario desactivada",
                )

            return create_access_token(str(usuario.id))
