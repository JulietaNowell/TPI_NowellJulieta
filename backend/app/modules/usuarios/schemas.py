from datetime import datetime
from typing import Annotated, Literal

from pydantic import ConfigDict, EmailStr, StringConstraints, field_validator
from sqlmodel import SQLModel, Field


class UserCreate(SQLModel):
    username: Annotated[
        str,
        StringConstraints(strip_whitespace=True, min_length=1),
    ]

    full_name: Annotated[
        str,
        StringConstraints(strip_whitespace=True, min_length=1),
    ]

    email: EmailStr

    password: Annotated[str, Field(min_length=8)]

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError(
                "La password no puede superar los 72 bytes"
            )
        return value


class UserPublic(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    full_name: str
    email: EmailStr
    role: Literal["user", "admin"]
    disabled: bool
    created_at: datetime
