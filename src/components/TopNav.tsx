import Link from "next/link";
import { signOutAction } from "@/lib/actions/signout";

export function TopNav({ userName }: { userName: string }) {
  return (
    <header className="flex items-center justify-between border-b border-black/10 px-6 py-3 dark:border-white/10">
      <Link href="/libros" className="font-semibold">
        📚 Libros
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-black/60 dark:text-white/60">{userName}</span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-indigo-600 hover:underline"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </header>
  );
}
