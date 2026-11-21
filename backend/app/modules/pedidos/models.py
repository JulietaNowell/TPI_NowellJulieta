from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.usuarios.models import Usuario
    from app.modules.productos.models import Producto


class Pedido(SQLModel, table=True):
    __tablename__ = "pedidos"

    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(
        foreign_key="usuarios.id",
        index=True,
    )
    estado: str = Field(default="PENDIENTE", index=True)
    forma_pago: str
    direccion_entrega: str = Field(max_length=200)
    notas: str | None = Field(default=None)
    total: float
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )

    usuario: "Usuario" = Relationship(
        back_populates="pedidos"
    )

    items: list["DetallePedido"] = Relationship(
        back_populates="pedido"
    )


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalle_pedidos"

    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(
        foreign_key="pedidos.id",
        index=True,
    )
    producto_id: int = Field(
        foreign_key="productos.id",
        index=True,
    )
    cantidad: int
    nombre_producto: str
    precio_unitario: float
    subtotal: float

    pedido: "Pedido" = Relationship(
        back_populates="items"
    )

    producto: "Producto" = Relationship(
        back_populates="detalles"
    )
