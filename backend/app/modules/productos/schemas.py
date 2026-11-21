from typing import Annotated, Self

from pydantic import (
    ConfigDict,
    Field,
    StringConstraints,
    model_validator,
)
from sqlmodel import SQLModel

from app.modules.categorias.schemas import CategoriaRead


NombreProducto = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=1,
    ),
]

PrecioProducto = Annotated[
    float,
    Field(ge=0, allow_inf_nan=False),
]

StockProducto = Annotated[
    int,
    Field(ge=0),
]

CategoriaId = Annotated[
    int,
    Field(gt=0),
]


class ProductoCreate(SQLModel):
    nombre: NombreProducto
    descripcion: str | None = None
    precio_base: PrecioProducto
    imagen_url: str | None = None
    stock: StockProducto = 0
    disponible: bool = True
    categoria_id: CategoriaId


class ProductoUpdate(SQLModel):
    nombre: NombreProducto | None = None
    descripcion: str | None = None
    precio_base: PrecioProducto | None = None
    imagen_url: str | None = None
    stock: StockProducto | None = None
    disponible: bool | None = None
    categoria_id: CategoriaId | None = None

    @model_validator(mode="after")
    def validar_campos(self) -> Self:
        no_nulables = {
            "nombre",
            "precio_base",
            "stock",
            "disponible",
            "categoria_id",
        }

        for campo in no_nulables & self.model_fields_set:
            if getattr(self, campo) is None:
                raise ValueError(
                    f"El campo {campo} no puede ser nulo"
                )

        return self


class ProductoStockUpdate(SQLModel):
    stock: StockProducto
    disponible: bool


class ProductoRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
