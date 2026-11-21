from sqlalchemy.exc import IntegrityError

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaRead,
)
from app.modules.categorias.unit_of_work import (
    CategoriaUnitOfWork,
)


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:

    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def get_all(self) -> list[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.get_all_active()

            return [
                CategoriaRead.model_validate(categoria)
                for categoria in categorias
            ]

    def get_by_id(
        self,
        categoria_id: int,
    ) -> CategoriaRead:

        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(
                categoria_id
            )

            if categoria is None:
                raise CategoriaNoEncontrada(
                    "Categoria no encontrada"
                )

            return CategoriaRead.model_validate(categoria)

    def create(
        self,
        datos: CategoriaCreate,
    ) -> CategoriaRead:

        try:
            with self.uow as uow:

                if uow.categorias.get_by_nombre(datos.nombre):
                    raise NombreDuplicado(
                        "Ya existe una categoria con ese nombre"
                    )

                categoria = Categoria(
                    **datos.model_dump(),
                    activo=True,
                )

                categoria = uow.categorias.add(categoria)

                return CategoriaRead.model_validate(categoria)

        except IntegrityError as error:
            if getattr(error.orig, "pgcode", None) == "23505":
                raise NombreDuplicado(
                    "Ya existe una categoria con ese nombre"
                ) from error

            raise

    def update(
        self,
        categoria_id: int,
        datos: CategoriaUpdate,
    ) -> CategoriaRead:

        try:
            with self.uow as uow:
                categoria = uow.categorias.get_active_by_id(
                    categoria_id
                )

                if categoria is None:
                    raise CategoriaNoEncontrada(
                        "Categoria no encontrada"
                    )

                cambios = datos.model_dump(exclude_unset=True)

                if "nombre" in cambios:
                    existente = uow.categorias.get_by_nombre(
                        cambios["nombre"]
                    )

                    if (
                        existente is not None
                        and existente.id != categoria_id
                    ):
                        raise NombreDuplicado(
                            "Ya existe una categoria con ese nombre"
                        )

                for campo, valor in cambios.items():
                    setattr(categoria, campo, valor)

                return CategoriaRead.model_validate(categoria)

        except IntegrityError as error:
            if getattr(error.orig, "pgcode", None) == "23505":
                raise NombreDuplicado(
                    "Ya existe una categoria con ese nombre"
                ) from error

            raise

    def delete(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(
                categoria_id
            )

            if categoria is None:
                raise CategoriaNoEncontrada(
                    "Categoria no encontrada"
                )

            categoria.activo = False
