"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type FormState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

const initialState: FormState = { error: null };

const inputClass =
  "rounded-xl border border-pink-100 bg-white px-3 py-2 text-rose-900 outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-50";

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4">
      <div className="mb-6 text-center">
        <div className="text-4xl">🌸</div>
        <h1 className="mt-2 text-2xl font-bold text-rose-700">
          Bienvenida de vuelta
        </h1>
        <p className="text-sm text-rose-900/50">Inicia sesión en Libros</p>
      </div>
      <form
        action={formAction}
        className="flex flex-col gap-4 rounded-2xl border border-pink-100 bg-white/80 p-6 shadow-sm shadow-pink-100 backdrop-blur-sm"
      >
        <label className="flex flex-col gap-1 text-sm text-rose-900/70">
          Email
          <input name="email" type="email" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-rose-900/70">
          Contraseña
          <input
            name="password"
            type="password"
            required
            className={inputClass}
          />
        </label>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <SubmitButton className="mt-1 w-full">Entrar</SubmitButton>
      </form>
      <p className="mt-4 text-center text-sm text-rose-900/50">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-pink-400 hover:underline">
          Regístrate
        </Link>
      </p>
    </main>
  );
}
