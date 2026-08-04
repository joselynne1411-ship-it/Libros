"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "", label: "Resumen" },
  { href: "/personajes", label: "Personajes" },
  { href: "/arbol-genealogico", label: "Árbol genealógico" },
  { href: "/ubicaciones", label: "Ubicaciones" },
  { href: "/linea-de-tiempo", label: "Línea de tiempo" },
  { href: "/objetos", label: "Objetos" },
  { href: "/capitulos", label: "Capítulos" },
];

export function BookNav({ bookId }: { bookId: string }) {
  const pathname = usePathname();
  const base = `/libros/${bookId}`;

  return (
    <nav className="flex flex-wrap gap-1 border-b border-black/10 px-4 dark:border-white/10">
      {tabs.map((tab) => {
        const href = `${base}${tab.href}`;
        const active =
          tab.href === "" ? pathname === base : pathname.startsWith(href);
        return (
          <Link
            key={tab.href}
            href={href}
            className={`rounded-t-md px-3 py-2 text-sm ${
              active
                ? "border-b-2 border-indigo-600 font-medium text-indigo-600"
                : "text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
