import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../layouts/AppLayout";
import Dashboard from "../pages/Dashboard";
import Vehicles from "../pages/Vehicles";
import Choferes from "../pages/Choferes";
import Rutas from "../pages/Rutas";
import Puntos from "../pages/Puntos";

export const router = createBrowserRouter([
  // 👉 redirige raíz a /login
  { path: "/", element: <Navigate to="/login" replace /> },

  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
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
        ],
      },
    ],
  },

  {
    path: "*",
    element: <div style={{ padding: 24 }}>404: Página no encontrada</div>,
  },
]);
