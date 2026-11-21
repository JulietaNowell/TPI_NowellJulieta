from datetime import datetime
from typing import Annotated, Literal

from pydantic import ConfigDict, Field, StringConstraints
from sqlmodel import SQLModel


EstadoPedido = Literal[
    "PENDIENTE",
    "EN_PREPARACION",
    "ENTREGADO",
    "CANCELADO",
]

FormaPago = Literal[
    "EFECTIVO",
    "TRANSFERENCIA",
]

ProductoId = Annotated[
    int,
    Field(gt=0),
]

CantidadPedido = Annotated[
    int,
    Field(ge=1),
]

DireccionEntrega = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=5,
        max_length=200,
    ),
]


class ItemPedidoCreate(SQLModel):
    producto_id: ProductoId
    cantidad: CantidadPedido


class PedidoCreate(SQLModel):
    items: Annotated[
        list[ItemPedidoCreate],
        Field(min_length=1),
    ]
    forma_pago: FormaPago
    direccion_entrega: DireccionEntrega
    notas: str | None = None


class DetallePedidoRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class CambioEstado(SQLModel):
    estado: EstadoPedido


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
