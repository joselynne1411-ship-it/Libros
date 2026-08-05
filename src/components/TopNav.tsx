import Link from "next/link";
import { signOutAction } from "@/lib/actions/signout";

export function TopNav({ userName }: { userName: string }) {
  return (
    <header className="flex items-center justify-between border-b border-pink-100 bg-white/70 px-6 py-3 backdrop-blur-sm">
      <Link
        href="/libros"
        className="flex items-center gap-2 text-lg font-bold text-black"
      >
        <span aria-hidden>🌸</span> Libros
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-black/60">
          <span aria-hidden>👋</span> {userName}
        </span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-full px-3 py-1.5 font-medium text-pink-400 transition hover:bg-pink-50"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </header>
  );
}
