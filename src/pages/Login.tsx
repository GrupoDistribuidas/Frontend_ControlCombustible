import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { LoginRequestSchema, type LoginRequest } from "../validation/auth";
import { authService } from "../services/auth.service";
import AuthLayout from "../layouts/AuthLayout";
import FuelWiseLogo from "../components/FuelWiseLogo";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

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
