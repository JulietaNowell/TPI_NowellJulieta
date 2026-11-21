"""Datos iniciales de Food Store.

Ejecucion:
    python -m app.db.seed

El Seed es idempotente: conserva los registros existentes.
"""

from sqlmodel import Session, select

import app.modules  # Registra los modelos SQLModel.

from app.core.database import engine, create_all_tables
from app.core.security import hash_password

from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto


ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Admin1234!"
ADMIN_EMAIL = "admin@foodstore.example.com"


CATEGORIAS = [
    {
        "nombre": "Pizzas",
        "descripcion": "Pizzas artesanales",
    },
    {
        "nombre": "Hamburguesas",
        "descripcion": "Hamburguesas y acompañamientos",
    },
    {
        "nombre": "Bebidas",
        "descripcion": "Bebidas sin alcohol",
    },
]


PRODUCTOS = [
    {
        "nombre": "Pizza Muzzarella",
        "categoria": "Pizzas",
        "descripcion": "Salsa de tomate y muzzarella",
        "precio_base": 8500.50,
        "stock": 20,
    },
    {
        "nombre": "Pizza Napolitana",
        "categoria": "Pizzas",
        "descripcion": "Muzzarella, tomate y ajo",
        "precio_base": 9500.00,
        "stock": 15,
    },
    {
        "nombre": "Pizza Especial",
        "categoria": "Pizzas",
        "descripcion": "Muzzarella, jamon y morrones",
        "precio_base": 11000.00,
        "stock": 12,
    },
    {
        "nombre": "Hamburguesa Clasica",
        "categoria": "Hamburguesas",
        "descripcion": "Carne, lechuga y tomate",
        "precio_base": 7200.00,
        "stock": 25,
    },
    {
        "nombre": "Hamburguesa Completa",
        "categoria": "Hamburguesas",
        "descripcion": "Carne, queso, panceta y huevo",
        "precio_base": 8900.00,
        "stock": 18,
    },
    {
        "nombre": "Agua Mineral",
        "categoria": "Bebidas",
        "descripcion": "Botella de 500 ml",
        "precio_base": 1800.00,
        "stock": 40,
    },
    {
        "nombre": "Gaseosa Cola",
        "categoria": "Bebidas",
        "descripcion": "Botella de 500 ml",
        "precio_base": 2500.00,
        "stock": 35,
    },
    {
        "nombre": "Limonada",
        "categoria": "Bebidas",
        "descripcion": "Limonada natural",
        "precio_base": 3200.00,
        "stock": 20,
    },
]


def crear_administrador(session: Session) -> int:
    existente = session.exec(
        select(Usuario).where(
            Usuario.username == ADMIN_USERNAME
        )
    ).first()

    if existente is not None:
        if existente.role != "admin":
            raise RuntimeError(
                "El usuario 'admin' ya existe, "
                "pero no tiene rol administrador."
            )

        print("Administrador: existente")
        return 0

    email_existente = session.exec(
        select(Usuario).where(
            Usuario.email == ADMIN_EMAIL
        )
    ).first()

    if email_existente is not None:
        raise RuntimeError(
            "El correo del administrador ya pertenece "
            "a otro usuario."
        )

    administrador = Usuario(
        username=ADMIN_USERNAME,
        full_name="Administrador Food Store",
        email=ADMIN_EMAIL,
        hashed_password=hash_password(ADMIN_PASSWORD),
        role="admin",
        disabled=False,
    )

    session.add(administrador)
    session.flush()

    print("Administrador: creado")
    return 1


def crear_categorias(
    session: Session,
) -> tuple[dict[str, int], int]:
    ids = {}
    creadas = 0

    for datos in CATEGORIAS:
        categoria = session.exec(
            select(Categoria).where(
                Categoria.nombre == datos["nombre"]
            )
        ).first()

        if categoria is None:
            categoria = Categoria(
                nombre=datos["nombre"],
                descripcion=datos["descripcion"],
                activo=True,
            )

            session.add(categoria)
            session.flush()
            creadas += 1

            print(f"Categoria creada: {categoria.nombre}")
        else:
            print(f"Categoria existente: {categoria.nombre}")

        ids[datos["nombre"]] = categoria.id

    return ids, creadas


def crear_productos(
    session: Session,
    categorias: dict[str, int],
) -> int:
    creados = 0

    for datos in PRODUCTOS:
        categoria_id = categorias[datos["categoria"]]

        existente = session.exec(
            select(Producto).where(
                Producto.nombre == datos["nombre"],
                Producto.categoria_id == categoria_id,
            )
        ).first()

        if existente is not None:
            print(f"Producto existente: {datos['nombre']}")
            continue

        producto = Producto(
            nombre=datos["nombre"],
            descripcion=datos["descripcion"],
            categoria_id=categoria_id,
            precio_base=datos["precio_base"],
            stock=datos["stock"],
            disponible=True,
            activo=True,
        )

        session.add(producto)
        session.flush()

        creados += 1
        print(f"Producto creado: {producto.nombre}")

    return creados


def main() -> None:
    print("=== SEED FOOD STORE ===")

    create_all_tables()

    with Session(engine) as session:
        try:
            administrador = crear_administrador(session)

            categorias, categorias_creadas = crear_categorias(
                session
            )

            productos_creados = crear_productos(
                session,
                categorias,
            )

            session.commit()

        except Exception:
            session.rollback()
            print("Error: se revirtio la transaccion.")
            raise

    print("\n=== RESULTADO ===")
    print(f"Administradores creados: {administrador}")
    print(f"Categorias creadas: {categorias_creadas}")
    print(f"Productos creados: {productos_creados}")
    print("Seed finalizado correctamente.")


if __name__ == "__main__":
    main()

