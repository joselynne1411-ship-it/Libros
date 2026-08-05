"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type FormState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

const initialState: FormState = { error: null };

const inputClass =
  "rounded-xl border border-pink-100 bg-white px-3 py-2 text-rose-950 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4">
      <div className="mb-6 text-center">
        <div className="text-4xl">🌷</div>
        <h1 className="mt-2 text-2xl font-bold text-rose-950">
          Crea tu cuenta
        </h1>
        <p className="text-sm text-rose-900/50">
          Empieza a construir tu universo narrativo
        </p>
      </div>
      <form
        action={formAction}
        className="flex flex-col gap-4 rounded-2xl border border-pink-100 bg-white/80 p-6 shadow-sm shadow-pink-100 backdrop-blur-sm"
      >
        <label className="flex flex-col gap-1 text-sm text-rose-900/70">
          Nombre
          <input name="name" type="text" required className={inputClass} />
        </label>
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
            minLength={8}
            className={inputClass}
          />
        </label>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <SubmitButton className="mt-1 w-full">Crear cuenta</SubmitButton>
      </form>
      <p className="mt-4 text-center text-sm text-rose-900/50">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-pink-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}
