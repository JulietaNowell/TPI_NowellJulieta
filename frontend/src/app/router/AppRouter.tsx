import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom'

import { MainLayout } from '../../shared/layout/MainLayout'
import { PlaceholderPage } from '../../shared/components/PlaceholderPage'

import { CatalogoPage } from '../../pages/public/CatalogoPage'
import { LoginPage } from '../../pages/public/LoginPage'
import { UnauthorizedPage } from '../../pages/public/UnauthorizedPage'
import { RegisterPage } from '../../pages/public/RegisterPage'
import { CarritoPage } from '../../pages/public/CarritoPage'
import { CheckoutPage } from '../../pages/public/CheckoutPage'
import { MisPedidosPage } from '../../pages/public/MisPedidosPage'

import { AdminDashboardPage } from '../../pages/admin/AdminDashboardPage'
import { AdminCategoriasPage } from '../../pages/admin/AdminCategoriasPage'
import { AdminProductosPage } from '../../pages/admin/AdminProductosPage'
import { AdminPedidosPage } from '../../pages/admin/AdminPedidosPage'
import { AdminUsuariosPage } from '../../pages/admin/AdminUsuariosPage'

import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<CatalogoPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />

          <Route path="/carrito" element={<CarritoPage />} />

          <Route
            path="/unauthorized"
            element={<UnauthorizedPage />}
          />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/checkout"
              element={<CheckoutPage />}
            />

            <Route
              path="/mis-pedidos"
              element={<MisPedidosPage />}
            />
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route
              path="/admin"
              element={<AdminDashboardPage />}
            />

            <Route
              path="/admin/resumen"
              element={<AdminDashboardPage />}
            />

            <Route
              path="/admin/categorias"
              element={<AdminCategoriasPage />}
            />

            <Route
              path="/admin/productos"
              element={<AdminProductosPage />}
            />

            <Route
              path="/admin/pedidos"
              element={<AdminPedidosPage />}
            />

            <Route
              path="/admin/usuarios"
              element={<AdminUsuariosPage />}
            />
          </Route>

          <Route
            path="*"
            element={
              <PlaceholderPage
                title="Página no encontrada"
                description="La ruta solicitada no existe."
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

