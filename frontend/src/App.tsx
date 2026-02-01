import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import RootLayout from "layouts/RootLayout";
import AuthenticationLayout from "layouts/AuthenticationLayout";
import ClienteLayout from "pages/cliente_petsi/clienteLayout";
import PrivateRoute from "./routes/PrivateRoute";

import HomeCliente from "pages/cliente_petsi/homeCliente";

import Dashboard from "pages/dashboard/Index";
import Citas from "pages/dashboard/pages/Citas";
import Documentos from "pages/dashboard/pages/Documentos";
import Inventario from "pages/dashboard/pages/Inventario";
import NotFound from "pages/dashboard/pages/NotFound";

import LoginPage from "pages/auth/LoginPage";
import SignUp from "pages/auth/SignUp";

import { NotificationProvider } from "context/NotificationContext";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/cliente" replace />,
  },

  {
    path: "/cliente",
    Component: ClienteLayout,
    children: [
      { index: true, Component: HomeCliente },
    ],
  },

  {
    path: "/auth",
    Component: AuthenticationLayout,
    children: [
      { path: "sign-in", Component: LoginPage }
    ],
  },

  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/dashboard",
        Component: RootLayout,
        errorElement: <NotFound />,
        children: [
          { index: true, Component: Dashboard },
          { path: "inventario", Component: Inventario },
          { path: "documentos", Component: Documentos },
          { path: "citas", Component: Citas },
          { path: "sign-up", Component: SignUp },
        ],
      },
    ],
  },

  {
    path: "*",
    Component: NotFound,
  },
]);

export default function App() {
  return (
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  );
}
