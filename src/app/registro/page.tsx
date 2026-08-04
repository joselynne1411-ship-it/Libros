"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type FormState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

const initialState: FormState = { error: null };

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-semibold">Crea tu cuenta</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            name="name"
            type="text"
            required
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Contraseña
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
          />
        </label>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <SubmitButton>Crear cuenta</SubmitButton>
      </form>
      <p className="mt-4 text-sm text-black/60 dark:text-white/60">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-indigo-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}
