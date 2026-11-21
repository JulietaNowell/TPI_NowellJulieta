# Food Store - Backend

API REST del Trabajo Practico Integrador de Programacion IV.

## Tecnologias

- Python 3.13
- FastAPI
- SQLModel
- PostgreSQL
- JWT, Passlib y bcrypt

## Arquitectura

Organizacion modular con capas Router, Service, Repository, Model y Schema.

Modulos: auth, usuarios, categorias, productos y pedidos.

## Instalacion

Crear un entorno virtual e instalar requirements.txt.

## Configuracion

Crear la base de datos foodstore_tpi en PostgreSQL.
Configurar DATABASE_URL, SECRET_KEY y FRONTEND_ORIGIN en .env.
No incluir .env en la entrega.

## Datos iniciales

Ejecutar: python -m app.db.seed
El Seed crea un administrador, tres categorias y ocho productos.
El Seed es idempotente.

## Ejecucion

Ejecutar: python -m uvicorn app.main:app --reload
Swagger: http://127.0.0.1:8000/docs
Health: http://127.0.0.1:8000/api/v1/health

## API

Prefijo: /api/v1
Modulos: /auth, /usuarios, /categorias, /productos y /pedidos.

## Seguridad

Autenticacion JWT mediante cookies HttpOnly.
Roles: user y admin.
La configuracion actual esta destinada al desarrollo local.

## Pruebas

python -m compileall -q app
python -m pip check
python -m app.db.seed

## Autor

Julieta Nowell
