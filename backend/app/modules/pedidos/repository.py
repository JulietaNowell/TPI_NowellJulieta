from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido, DetallePedido
from app.modules.pedidos.schemas import EstadoPedido


class PedidoRepository(BaseRepository[Pedido]):

    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def get_by_id(
        self,
        entity_id: int,
    ) -> Pedido | None:

        statement = (
            select(Pedido)
            .where(Pedido.id == entity_id)
            .options(selectinload(Pedido.items))
        )

        return self.session.exec(statement).first()

    def get_by_id_for_update(
        self,
        pedido_id: int,
    ) -> Pedido | None:

        statement = (
            select(Pedido)
            .where(Pedido.id == pedido_id)
            .options(selectinload(Pedido.items))
            .with_for_update()
            .execution_options(populate_existing=True)
        )

        return self.session.exec(statement).first()

    def list_by_usuario(
        self,
        usuario_id: int | None = None,
        estado: EstadoPedido | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[int, list[Pedido]]:

        statement = select(Pedido)
        count_statement = select(func.count(Pedido.id))

        if usuario_id is not None:
            statement = statement.where(
                Pedido.usuario_id == usuario_id
            )
            count_statement = count_statement.where(
                Pedido.usuario_id == usuario_id
            )

        if estado is not None:
            statement = statement.where(
                Pedido.estado == estado
            )
            count_statement = count_statement.where(
                Pedido.estado == estado
            )

        total = self.session.exec(count_statement).one()

        statement = (
            statement
            .options(selectinload(Pedido.items))
            .order_by(
                Pedido.created_at.desc(),
                Pedido.id.desc(),
            )
            .offset(skip)
            .limit(limit)
        )

        pedidos = list(
            self.session.exec(statement).all()
        )

        return total, pedidos

    def add_item(
        self,
        item: DetallePedido,
    ) -> DetallePedido:

        self.session.add(item)
        self.session.flush()
        self.session.refresh(item)

        return item

    def count_by_estado(
        self,
        estado: EstadoPedido,
    ) -> int:

        statement = select(
            func.count(Pedido.id)
        ).where(
            Pedido.estado == estado
        )

        return self.session.exec(statement).one()

    def count_by_fecha(
        self,
        inicio: datetime,
    ) -> int:

        fin = inicio + timedelta(days=1)

        statement = select(
            func.count(Pedido.id)
        ).where(
            Pedido.created_at >= inicio,
            Pedido.created_at < fin,
        )

        return self.session.exec(statement).one()

    def sum_ingresos_entregados(self) -> float:

        statement = select(
            func.coalesce(func.sum(Pedido.total), 0)
        ).where(
            Pedido.estado == "ENTREGADO"
        )

        return float(
            self.session.exec(statement).one()
        )
