from sqlalchemy.orm import selectinload
from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):

    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_active_by_id(
        self,
        producto_id: int,
    ) -> Producto | None:

        statement = (
            select(Producto)
            .where(
                Producto.id == producto_id,
                Producto.activo == True,
            )
            .options(selectinload(Producto.categoria))
        )

        return self.session.exec(statement).first()

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:

        filtros = [Producto.activo == True]

        if search is not None and search.strip():
            filtros.append(
                Producto.nombre.ilike(
                    f"%{search.strip()}%"
                )
            )

        if categoria_id is not None:
            filtros.append(
                Producto.categoria_id == categoria_id
            )

        if disponible is not None:
            filtros.append(
                Producto.disponible == disponible
            )

        count_statement = (
            select(func.count())
            .select_from(Producto)
            .where(*filtros)
        )

        total = self.session.exec(
            count_statement
        ).one()

        statement = (
            select(Producto)
            .where(*filtros)
            .options(selectinload(Producto.categoria))
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )

        productos = list(
            self.session.exec(statement).all()
        )

        return total, productos

    def get_by_id_for_update(
        self,
        producto_id: int,
    ) -> Producto | None:

        statement = (
            select(Producto)
            .where(Producto.id == producto_id)
            .with_for_update()
            .execution_options(populate_existing=True)
        )

        return self.session.exec(statement).first()
