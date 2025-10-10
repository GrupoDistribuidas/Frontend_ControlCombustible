import { Link } from "react-router-dom";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { authService } from "../services/auth.service";
import AuthLayout from "../layouts/AuthLayout";
import FuelWiseLogo from "../components/FuelWiseLogo";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { ForgotPasswordRequestSchema, type ForgotPasswordRequest } from "../validation/auth";

export default function ForgotPassword() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<ForgotPasswordRequest>({
      resolver: zodResolver(ForgotPasswordRequestSchema),
      defaultValues: { identifier: "" },
      mode: "onTouched",
    });

  const onSubmit = async (v: ForgotPasswordRequest) => {
    setServerError(null);
    try {
      await authService.forgotPassword(v);
      setSent(true);
      reset();
    } catch (e: any) {
      setServerError(e.message ?? "Error inesperado");
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8 flex justify-center">
        <FuelWiseLogo />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Recuperar contraseña</h1>
          <p className="mt-1 text-sm text-slate-400">
            Escribe tu <span className="text-slate-200">usuario</span> o <span className="text-slate-200">correo</span>.
          </p>
        </div>

        <div>
          <TextField placeholder="Username o correo" {...register("identifier")} />
          {errors.identifier && (
            <p className="mt-1 text-sm text-red-400">{errors.identifier.message}</p>
          )}
        </div>

        {sent && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            Si la cuenta existe, te enviamos un enlace de recuperación.
          </div>
        )}

        {serverError && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {serverError}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar enlace"}
        </Button>

        <div className="flex items-center justify-between text-sm text-slate-400">
          <Link to="/login" className="hover:text-white transition">Volver al login</Link>
          <Link to="/register" className="hover:text-white transition">Register</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
