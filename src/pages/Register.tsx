
import { Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

export default function Register() {
  return (
    <AuthLayout>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h1 className="mb-2 text-xl font-semibold">Crear cuenta</h1>
        <p className="mb-6 text-sm text-slate-400">
          Aquí irá tu formulario de registro. (Placeholder)
        </p>
        <Link to="/login" className="text-sm text-[#29E3A6] hover:underline">Volver al login</Link>
      </div>
    </AuthLayout>
  );
}
