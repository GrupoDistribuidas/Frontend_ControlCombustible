import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { LoginRequestSchema, type LoginRequest } from "../validation/auth";
import { authService } from "../services/auth.service";
import AuthLayout from "../layouts/AuthLayout";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

// FuelWiseLogo Component
function FuelWiseLogo({ size = 80 }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Logo SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Círculo exterior con gradiente */}
        <defs>
          <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="needleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id="dropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Círculo base de la brújula */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="url(#circleGrad)"
          opacity="0.2"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#circleGrad)"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Marcas de dirección (N, S, E, W) */}
        <g stroke="#60a5fa" strokeWidth="2" strokeLinecap="round">
          {/* Norte */}
          <line x1="50" y1="8" x2="50" y2="18" />
          {/* Sur */}
          <line x1="50" y1="82" x2="50" y2="92" />
          {/* Este */}
          <line x1="92" y1="50" x2="82" y2="50" />
          {/* Oeste */}
          <line x1="8" y1="50" x2="18" y2="50" />
        </g>

        {/* Marcas secundarias */}
        <g stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
          <line x1="73" y1="15" x2="68" y2="20" />
          <line x1="85" y1="27" x2="80" y2="32" />
          <line x1="85" y1="73" x2="80" y2="68" />
          <line x1="73" y1="85" x2="68" y2="80" />
          <line x1="27" y1="85" x2="32" y2="80" />
          <line x1="15" y1="73" x2="20" y2="68" />
          <line x1="15" y1="27" x2="20" y2="32" />
          <line x1="27" y1="15" x2="32" y2="20" />
        </g>

        {/* Gota de combustible en el centro */}
        <path
          d="M50 32 C45 38, 42 42, 42 48 C42 54, 46 58, 50 58 C54 58, 58 54, 58 48 C58 42, 55 38, 50 32 Z"
          fill="url(#dropGrad)"
          opacity="0.9"
        />

        {/* Aguja/indicador de la brújula */}
        <g transform="rotate(-45 50 50)">
          <path
            d="M50 20 L54 50 L50 48 L46 50 Z"
            fill="url(#needleGrad)"
            stroke="#991b1b"
            strokeWidth="0.5"
          />
          <path
            d="M50 80 L54 50 L50 52 L46 50 Z"
            fill="#1e293b"
            opacity="0.6"
          />
        </g>

        {/* Centro de la brújula */}
        <circle cx="50" cy="50" r="4" fill="#1e40af" />
        <circle cx="50" cy="50" r="2.5" fill="#60a5fa" />

        {/* Anillo interior decorativo */}
        <circle
          cx="50"
          cy="50"
          r="35"
          stroke="#3b82f6"
          strokeWidth="1"
          fill="none"
          opacity="0.3"
          strokeDasharray="3 3"
        />
      </svg>

      {/* Texto del logo */}
      <div className="text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          FuelWise
        </h1>
        <p className="text-xs text-slate-400 tracking-wider">CONTROL DE COMBUSTIBLE</p>
      </div>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth(); // ✅ acceso al contexto global
  const nav = useNavigate();
  const location = useLocation(); // para saber desde dónde venía
  const [serverError, setServerError] = useState<string | null>(null);

  // Formulario validado con Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: { username: "", password: "" },
    mode: "onTouched",
  });

  // ✅ Manejo de login y guardado de sesión
  const onSubmit = async (values: LoginRequest) => {
    setServerError(null);
    try {
      const res = await authService.login(values);

      login(res.token, res.user);

      // Redirige a la ruta protegida o al dashboard por defecto
      const from = (location.state as { from?: Location })?.from?.pathname || "/dashboard";
      nav(from, { replace: true });
    } catch (err: any) {
      setServerError(err.message ?? "Error inesperado");
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8 flex justify-center">
        <FuelWiseLogo />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <TextField
            type="text"
            placeholder="Username"
            {...register("username")}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-400">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <TextField
            type="password"
            placeholder="Password"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {serverError}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Login"}
        </Button>

        <div className="flex items-center justify-between text-sm text-slate-400">
          <Link to="/forgot-password" className="hover:text-white transition">
            Forgot password?
          </Link>
          <Link to="/register" className="hover:text-white transition">
            Register
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}