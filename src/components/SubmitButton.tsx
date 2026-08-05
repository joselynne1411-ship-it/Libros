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
      className={`rounded-full bg-pink-300 px-5 py-2 text-sm font-medium text-white shadow-sm shadow-pink-100 transition hover:bg-pink-400 hover:shadow-pink-200 disabled:opacity-50 ${className}`}
    >
      {pending ? "Guardando…" : children}
    </button>
  );
}
