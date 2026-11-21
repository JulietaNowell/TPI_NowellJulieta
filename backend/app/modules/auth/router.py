from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import (
    get_auth_service,
    get_current_active_user,
)
from app.modules.auth.service import AuthService
from app.modules.usuarios.schemas import UserCreate, UserPublic


router = APIRouter(
    prefix="/auth",
    tags=["Autenticacion"],
)


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
)
def register(
    datos: UserCreate,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> UserPublic:
    return service.register(datos)


@router.post("/token")
def login(
    response: Response,
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict[str, str]:

    token = service.login(form.username, form.password)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    return {"message": "Login exitoso"}


@router.post("/logout")
def logout(response: Response) -> dict[str, str]:

    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        secure=False,
        samesite="lax",
    )

    return {"message": "Logout exitoso"}


@router.get("/me", response_model=UserPublic)
def me(
    usuario: Annotated[
        UserPublic,
        Depends(get_current_active_user),
    ],
) -> UserPublic:
    return usuario
