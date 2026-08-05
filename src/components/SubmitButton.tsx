"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-full bg-pink-500 px-5 py-2 text-sm font-medium text-white shadow-sm shadow-pink-300 transition hover:bg-pink-600 hover:shadow-pink-400 disabled:opacity-50 ${className}`}
    >
      {pending ? "Guardando…" : children}
    </button>
  );
}
