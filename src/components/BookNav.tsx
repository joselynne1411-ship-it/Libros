"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "", label: "Resumen", icon: "🏠" },
  { href: "/personajes", label: "Personajes", icon: "👤" },
  { href: "/arbol-genealogico", label: "Árbol genealógico", icon: "🌳" },
  { href: "/ubicaciones", label: "Ubicaciones", icon: "🗺️" },
  { href: "/linea-de-tiempo", label: "Línea de tiempo", icon: "⏳" },
  { href: "/objetos", label: "Objetos", icon: "🗝️" },
  { href: "/capitulos", label: "Capítulos", icon: "📖" },
];

export function BookNav({ bookId }: { bookId: string }) {
  const pathname = usePathname();
  const base = `/libros/${bookId}`;

  return (
    <nav className="flex flex-wrap gap-1 border-b border-pink-100 px-4">
      {tabs.map((tab) => {
        const href = `${base}${tab.href}`;
        const active =
          tab.href === "" ? pathname === base : pathname.startsWith(href);
        return (
          <Link
            key={tab.href}
            href={href}
            className={`flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-sm transition ${
              active
                ? "border-b-2 border-pink-300 font-medium text-pink-400"
                : "text-black/50 hover:text-black"
            }`}
          >
            <span aria-hidden>{tab.icon}</span> {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
