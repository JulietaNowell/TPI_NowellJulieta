from typing import Annotated

from pydantic import (
    ConfigDict,
    StringConstraints,
    model_validator,
)
from sqlmodel import SQLModel


NombreCategoria = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=2,
        max_length=100,
    ),
]


class CategoriaCreate(SQLModel):
    nombre: NombreCategoria
    descripcion: str | None = None


class CategoriaUpdate(SQLModel):
    nombre: NombreCategoria | None = None
    descripcion: str | None = None

    @model_validator(mode="after")
    def validar_nombre(self):
        if "nombre" in self.model_fields_set:
            if self.nombre is None:
                raise ValueError(
                    "El nombre no puede ser nulo"
                )

        return self


class CategoriaRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    descripcion: str | None
    activo: bool
