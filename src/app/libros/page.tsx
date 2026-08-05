import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { createBookAction } from "@/lib/actions/books";
import { SubmitButton } from "@/components/SubmitButton";
import { card, cardHover, input, muted, heading } from "@/lib/ui";

export default async function LibrosPage() {
  const userId = await requireUserId();
  const books = await prisma.book.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { characters: true, locations: true, chapters: true },
      },
    },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className={`mb-6 flex items-center gap-2 ${heading}`}>
        <span aria-hidden>📚</span> Tus libros
      </h1>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {books.map((book) => (
          <Link key={book.id} href={`/libros/${book.id}`} className={cardHover}>
            <h2 className="flex items-center gap-2 font-semibold text-black">
              <span aria-hidden>📖</span> {book.title}
            </h2>
            {book.description && (
              <p className={`mt-1 line-clamp-2 text-sm ${muted}`}>
                {book.description}
              </p>
            )}
            <p className={`mt-3 text-xs ${muted}`}>
              👤 {book._count.characters} · 🗺️ {book._count.locations} · 📖{" "}
              {book._count.chapters}
            </p>
          </Link>
        ))}
        {books.length === 0 && (
          <p className={`text-sm ${muted}`}>
            Todavía no tienes libros. Crea el primero abajo.
          </p>
        )}
      </div>

      <div className={`max-w-md ${card}`}>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-black">
          <span aria-hidden>✨</span> Nuevo libro
        </h2>
        <form action={createBookAction} className="flex flex-col gap-3">
          <input name="title" placeholder="Título" required className={input} />
          <textarea
            name="description"
            placeholder="Descripción (opcional)"
            rows={2}
            className={input}
          />
          <SubmitButton>Crear libro</SubmitButton>
        </form>
      </div>
    </main>
  );
}
