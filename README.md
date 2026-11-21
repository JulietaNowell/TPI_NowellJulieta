# Food Store - Sistema de pedidos de comida

Trabajo Práctico Integrador de Programación IV.

**Autora:** Julieta Nowell  
**Carrera:** Tecnicatura Universitaria en Programación a Distancia  
**Institución:** Universidad Tecnológica Nacional (UTN)  
**Año:** 2026

## 1. Descripción del proyecto

Food Store es una aplicación web full stack destinada a la gestión
de pedidos de un negocio de comidas.

El sistema permite a los clientes registrarse, consultar el catálogo,
gestionar un carrito, confirmar pedidos y consultar o cancelar
sus propios pedidos.

Los administradores pueden gestionar categorías, productos, stock,
pedidos y usuarios, además de consultar un resumen del negocio.

El proyecto implementa una API REST con persistencia en PostgreSQL
y una interfaz web desarrollada en React y TypeScript.

## 2. Funcionalidades

### Cliente

- Registro e inicio de sesión.
- Catálogo de productos con búsqueda, filtros y paginación.
- Carrito persistido en el navegador.
- Confirmación de pedidos con dirección de entrega y forma de pago.
- Consulta del listado y detalle de pedidos propios.
- Cancelación de pedidos pendientes.

### Administrador

- Resumen de pedidos e ingresos.
- Alta, modificación y baja lógica de categorías.
- Alta, modificación y baja lógica de productos.
- Gestión de stock y disponibilidad.
- Consulta de pedidos y modificación de su estado.
- Activación y desactivación de usuarios.

### Sistema

- Autenticación JWT mediante cookie HttpOnly.
- Autorización por roles.
- Validaciones de negocio en el backend.
- Descuento transaccional de stock al crear pedidos.
- Restitución de stock al cancelar pedidos.
- Conservación histórica del nombre y precio de los productos.
- Manejo centralizado de errores HTTP.

## 3. Tecnologías utilizadas

### Backend

| Tecnología | Versión utilizada |
|---|---|
| Python | 3.13.14 |
| FastAPI | 0.115.12 |
| SQLModel | 0.0.24 |
| PostgreSQL | 18 |
| psycopg2-binary | 2.9.10 |
| python-jose | 3.5.0 |
| Passlib | 1.7.4 |
| bcrypt | 4.0.1 |
| pydantic-settings | 2.9.1 |
| python-multipart | 0.0.20 |

### Frontend

| Tecnología | Versión utilizada |
|---|---|
| Node.js | 24.15.0 |
| pnpm | 10.33.0 |
| React | 19.3.1 |
| TypeScript | 5.9.3 |
| Vite | 7.3.8 |
| Tailwind CSS | 4.3.5 |
| TanStack Query | 5.108.0 |
| TanStack Form | 1.33.5 |
| TanStack Table | 8.21.3 |
| React Router | 7.18.6 |
| Zustand | 5.1.0 |
| Axios | 1.21.1 |

Las dependencias se encuentran fijadas en
`backend/requirements.txt` y `frontend/package.json`.

El frontend incluye `pnpm-lock.yaml` para reproducir la instalación.

## 4. Requisitos previos

- Python 3.11 a 3.13.
- PostgreSQL 15 o superior.
- Node.js compatible con Vite 7: 20.19+ o 22.12+ dentro
  de las ramas compatibles.
- pnpm 10.33.0 (versión utilizada en el desarrollo).
- Git, en caso de obtener el código desde el repositorio.

El proyecto fue desarrollado y validado en Windows utilizando
PowerShell.

Para reproducir el entorno de desarrollo se recomienda utilizar
las versiones indicadas en la sección anterior.

Si no se dispone de pnpm, puede instalarse mediante:

```powershell
npm install -g pnpm@10.33.0
```

Verificar las herramientas instaladas:

```powershell
python --version
node --version
pnpm --version
psql --version
```

Si PostgreSQL no está agregado al PATH, puede utilizarse pgAdmin
para crear la base de datos.

## 5. Obtener el proyecto

El proyecto puede obtenerse descomprimiendo el archivo ZIP
entregado o clonando el repositorio público de GitHub.

Repositorio: https://github.com/JulietaNowell/TPI_NowellJulieta

Los comandos de instalación de las siguientes secciones deben
ejecutarse inicialmente desde la raíz del proyecto.

## 6. Configuración de PostgreSQL

Verificar que el servicio de PostgreSQL esté iniciado.

Crear una base de datos denominada `foodstore_tpi`.

Desde una terminal:

```powershell
psql -U postgres -h localhost -p 5432
```

Ejecutar la siguiente sentencia SQL:

```sql
CREATE DATABASE foodstore_tpi;
```

Salir de PostgreSQL:

```text
\q
```

También puede crearse la base de datos mediante pgAdmin.

No es necesario crear las tablas manualmente. La aplicación
se encarga de inicializar la estructura requerida.

## 7. Instalación y configuración del backend

### 7.1. Crear el entorno virtual

Desde la raíz del proyecto:

```powershell
cd backend
python -m venv .venv
```

### 7.2. Instalar las dependencias

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Se utiliza directamente el intérprete del entorno virtual para
evitar inconvenientes con las políticas de ejecución de PowerShell.

### 7.3. Configurar las variables de entorno

Crear el archivo `.env` a partir del archivo de ejemplo:

```powershell
Copy-Item .env.example .env
```

Editar `backend/.env` con los valores correspondientes al
entorno local.

```dotenv
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/foodstore_tpi
SECRET_KEY=cambiar-esta-clave-de-al-menos-32-caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173
```

| Variable | Descripción |
|---|---|
| DATABASE_URL | Cadena de conexión a PostgreSQL. |
| SECRET_KEY | Clave de firma JWT de al menos 32 caracteres. |
| ALGORITHM | Algoritmo de firma JWT. |
| ACCESS_TOKEN_EXPIRE_MINUTES | Vigencia del token en minutos. |
| FRONTEND_ORIGIN | Origen autorizado mediante CORS. |

Reemplazar `TU_PASSWORD` por la contraseña del usuario de
PostgreSQL correspondiente.

Si la contraseña contiene caracteres especiales reservados en
una URL, deben codificarse correctamente en DATABASE_URL.

Se recomienda generar una clave SECRET_KEY propia mediante:

```powershell
.\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_hex(32))"
```

Copiar el valor generado en la variable SECRET_KEY.

Guardar el archivo `.env` como UTF-8 sin BOM.

El archivo `.env` contiene información local sensible y no se
incluye en el repositorio ni en el archivo ZIP.

### 7.4. Cargar los datos iniciales

Desde la carpeta `backend`:

```powershell
.\.venv\Scripts\python.exe -m app.db.seed
```

El seed crea las tablas necesarias y carga:

- Un usuario administrador.
- Tres categorías: Pizzas, Hamburguesas y Bebidas.
- Ocho productos iniciales.

El proceso es idempotente: puede ejecutarse nuevamente sin
duplicar los registros iniciales existentes.

### 7.5. Iniciar el backend

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host localhost --port 8000
```

Mantener esta terminal abierta mientras se utiliza el sistema.

| Recurso | URL |
|---|---|
| API REST | http://localhost:8000/api/v1 |
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| Health check | http://localhost:8000/api/v1/health |

Swagger permite consultar la documentación de los endpoints,
sus parámetros, schemas y códigos de respuesta.

## 8. Instalación y configuración del frontend

Abrir una segunda terminal desde la raíz del proyecto.

### 8.1. Instalar las dependencias

```powershell
cd frontend
pnpm install --frozen-lockfile
```

### 8.2. Configurar las variables de entorno

```powershell
Copy-Item .env.example .env
```

Verificar que `frontend/.env` contenga:

```dotenv
VITE_API_URL=http://localhost:8000/api/v1
```

Esta variable define la URL base de la API consumida mediante Axios.

### 8.3. Verificar la compilación

```powershell
pnpm build
```

### 8.4. Iniciar el frontend

```powershell
pnpm dev
```

Abrir la aplicación en:

http://localhost:5173

Mantener el backend y el frontend ejecutándose simultáneamente.

**Importante:** utilizar localhost tanto para acceder al frontend
como para consumir el backend, evitando alternar entre localhost
y 127.0.0.1 durante la demostración. Esto permite conservar una
configuración coherente de cookies y CORS.

## 9. Credenciales de demostración

El seed proporciona el siguiente usuario administrador:

| Campo | Valor |
|---|---|
| Usuario | admin |
| Contraseña | Admin1234! |
| Rol | admin |

Para utilizar las funcionalidades de cliente, registrar un
nuevo usuario desde la pantalla de registro.

Los usuarios registrados mediante la aplicación reciben
automáticamente el rol `user`.

Las credenciales del administrador inicial están destinadas
exclusivamente a la demostración académica en un entorno local.

## 10. Arquitectura del proyecto

```text
TPI_NowellJulieta/
|-- backend/
|   |-- app/
|   |   |-- core/
|   |   |-- db/
|   |   |-- modules/
|   |   |   |-- auth/
|   |   |   |-- usuarios/
|   |   |   |-- categorias/
|   |   |   |-- productos/
|   |   |   |-- pedidos/
|   |   |-- main.py
|   |-- .env.example
|   |-- requirements.txt
|
|-- frontend/
|   |-- src/
|   |   |-- app/
|   |   |-- features/
|   |   |-- pages/
|   |   |-- shared/
|   |   |-- App.tsx
|   |   |-- main.tsx
|   |-- .env.example
|   |-- package.json
|   |-- pnpm-lock.yaml
|
|-- .gitignore
|-- README.md
```

### 10.1. Backend

El backend utiliza una arquitectura modular organizada por
dominio, con separación de responsabilidades.

| Componente | Responsabilidad |
|---|---|
| Router | Exposición de endpoints HTTP. |
| Service | Validaciones y reglas de negocio. |
| Repository | Acceso y consultas a la base de datos. |
| Unit of Work | Gestión de transacciones y sesiones. |
| Model | Representación de entidades persistentes. |
| Schema | Validación y representación de datos de la API. |

El Unit of Work centraliza las operaciones de commit,
rollback y cierre de sesión.

Los repositorios reutilizan un BaseRepository genérico.

### 10.2. Frontend

El frontend separa los componentes por funcionalidad,
pantallas e infraestructura compartida.

| Tecnología | Responsabilidad |
|---|---|
| TanStack Query | Consultas, mutaciones e invalidación de datos del servidor. |
| TanStack Form | Formularios y validaciones. |
| TanStack Table | Tablas y paginación de los paneles administrativos. |
| Zustand | Estado global de autenticación y carrito. |
| Axios | Comunicación HTTP y tratamiento de errores de autenticación. |
| React Router | Navegación y protección de rutas. |
| Tailwind CSS | Diseño de la interfaz. |

El proyecto utiliza TypeScript en modo estricto.

## 11. Modelo de datos

El sistema implementa cinco entidades principales:

- Usuario.
- Categoria.
- Producto.
- Pedido.
- DetallePedido.

Las relaciones principales son:

- Una categoría puede tener muchos productos.
- Un usuario puede tener muchos pedidos.
- Un pedido contiene uno o más detalles.
- Un producto puede estar asociado a múltiples detalles.

Los detalles del pedido conservan el nombre y el precio
unitario del producto al momento de realizar la compra.

## 12. Reglas de negocio

### Creación de pedidos

- Cada pedido debe contener al menos un producto.
- No se permiten productos repetidos dentro del mismo pedido.
- Los productos deben estar activos y disponibles.
- La cantidad solicitada no puede superar el stock existente.
- Los importes se calculan en el backend.
- El pedido, sus detalles y el descuento de stock se
  registran dentro de una misma transacción.

### Estados de los pedidos

```mermaid
stateDiagram-v2
    [*] --> PENDIENTE
    PENDIENTE --> EN_PREPARACION
    PENDIENTE --> CANCELADO
    EN_PREPARACION --> ENTREGADO
    EN_PREPARACION --> CANCELADO
    ENTREGADO --> [*]
    CANCELADO --> [*]
```

Los estados ENTREGADO y CANCELADO son terminales.

El cliente puede cancelar únicamente sus propios pedidos
en estado PENDIENTE.

El administrador puede avanzar o cancelar pedidos según
las transiciones permitidas.

La cancelación restituye el stock en la misma transacción.

### Autenticación y autorización

- El backend genera un JWT almacenado en una cookie HttpOnly.
- El frontend no necesita leer ni almacenar el token.
- Las solicitudes HTTP utilizan withCredentials.
- Las operaciones privadas requieren autenticación.
- Las operaciones administrativas requieren el rol admin.
- Un usuario desactivado no puede acceder a recursos privados.
- ProtectedRoute controla el acceso a las pantallas.
- El interceptor Axios invalida la sesión local ante
  respuestas 401 correspondientes a una sesión autenticada.

## 13. Principales endpoints de la API

Todos los endpoints se encuentran bajo el prefijo `/api/v1`.

| Módulo | Ruta base | Funcionalidad |
|---|---|---|
| Autenticación | /auth | Registro, login, logout y sesión. |
| Usuarios | /usuarios | Listado, activación y desactivación. |
| Categorías | /categorias | Consultas y ABM. |
| Productos | /productos | Consultas, ABM y stock. |
| Pedidos | /pedidos | Creación, consultas, estados, cancelación y resumen. |

La especificación completa está disponible en Swagger:

http://localhost:8000/docs

## 14. Rutas principales del frontend

| Ruta | Pantalla | Acceso |
|---|---|---|
| / | Catálogo | Público |
| /login | Inicio de sesión | Público |
| /register | Registro | Público |
| /carrito | Carrito | Público |
| /checkout | Confirmación de pedido | Autenticado |
| /mis-pedidos | Pedidos propios | Autenticado |
| /admin/resumen | Resumen administrativo | Administrador |
| /admin/categorias | Gestión de categorías | Administrador |
| /admin/productos | Gestión de productos | Administrador |
| /admin/pedidos | Gestión de pedidos | Administrador |
| /admin/usuarios | Gestión de usuarios | Administrador |
| /unauthorized | Acceso no autorizado | Público |

## 15. Validaciones técnicas

### Backend

Desde la carpeta backend:

```powershell
.\.venv\Scripts\python.exe -m pip check
.\.venv\Scripts\python.exe -m compileall -q app
```

### Frontend

Desde la carpeta frontend:

```powershell
pnpm build
pnpm lint
```

Durante el desarrollo se realizaron pruebas manuales de:

- Endpoints y códigos HTTP.
- Validaciones de negocio.
- Transacciones y consistencia de stock.
- Autenticación, autorización y propiedad de pedidos.
- Persistencia del carrito y recuperación de sesión.
- Formularios y tablas administrativas.
- Integración entre el frontend y el backend.
- Navegación y protección de rutas.

## 16. Resolución de inconvenientes

### No se puede conectar con PostgreSQL

Verificar que el servicio esté iniciado, que la base de datos
exista y que DATABASE_URL tenga las credenciales correctas.

### Error de conexión entre frontend y backend

Verificar que ambos servidores estén iniciados y que
VITE_API_URL y FRONTEND_ORIGIN coincidan con las URLs
indicadas en este documento.

### El puerto se encuentra ocupado

Liberar los puertos 8000 y 5173 antes de iniciar los servidores.

### No es posible iniciar sesión como administrador

Verificar que se haya ejecutado el seed sobre la base de
datos configurada en DATABASE_URL.

### Error durante la instalación

Verificar las versiones de Python, Node.js y pnpm, y realizar
la instalación desde las carpetas correspondientes.

## 17. Alcance académico

El sistema fue desarrollado conforme a la consigna del Trabajo
Práctico Integrador de Programación IV.

No incorpora pasarela de pago, direcciones guardadas, múltiples
categorías por producto, historial de estados, gráficos ni
notificaciones, por encontrarse fuera del alcance solicitado.

La configuración de seguridad y ejecución corresponde a un
entorno local de desarrollo y demostración académica.

## 18. Enlaces de entrega

- Repositorio GitHub: https://github.com/JulietaNowell/TPI_NowellJulieta
- Video demostrativo: PENDIENTE_URL_VIDEO

## Autora

Julieta Nowell  
Tecnicatura Universitaria en Programación a Distancia  
Universidad Tecnológica Nacional  
Programación IV - 2026