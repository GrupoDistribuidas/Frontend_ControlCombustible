import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../layouts/AppLayout";
import Dashboard from "../pages/Dashboard";
import Vehicles from "../pages/Vehicles";
import Choferes from "../pages/Choferes";
import Rutas from "../pages/Rutas";
import Puntos from "../pages/Puntos";
import Asignaciones from "../pages/Asignaciones";
import RegistroConsumo from "../pages/RegistroConsumo";
import Usuarios from "../pages/Usuarios";

export const router = createBrowserRouter([
  // 👉 redirige raíz a /login
  { path: "/", element: <Navigate to="/login" replace /> },

  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },

  // 👉 bloque protegido
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/vehicles", element: <Vehicles /> },
          { path: "/choferes", element: <Choferes /> },
          { path: "/rutas", element: <Rutas /> },
          { path: "/puntos", element: <Puntos /> },
          { path: "/asignaciones", element: <Asignaciones /> },
          { path: "/registro-consumo", element: <RegistroConsumo /> },
          { path: "/usuarios", element: <Usuarios /> },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <div style={{ padding: 24 }}>404: Página no encontrada</div>,
  },
]);
