import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { createBookAction } from "@/lib/actions/books";
import { SubmitButton } from "@/components/SubmitButton";

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
      <h1 className="mb-6 text-2xl font-semibold">Tus libros</h1>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/libros/${book.id}`}
            className="rounded-lg border border-black/10 p-4 transition hover:border-indigo-400 dark:border-white/10"
          >
            <h2 className="font-medium">{book.title}</h2>
            {book.description && (
              <p className="mt-1 line-clamp-2 text-sm text-black/60 dark:text-white/60">
                {book.description}
              </p>
            )}
            <p className="mt-3 text-xs text-black/50 dark:text-white/50">
              {book._count.characters} personajes · {book._count.locations}{" "}
              ubicaciones · {book._count.chapters} capítulos
            </p>
          </Link>
        ))}
        {books.length === 0 && (
          <p className="text-sm text-black/60 dark:text-white/60">
            Todavía no tienes libros. Crea el primero abajo.
          </p>
        )}
      </div>

      <div className="max-w-md rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-3 font-medium">Nuevo libro</h2>
        <form action={createBookAction} className="flex flex-col gap-3">
          <input
            name="title"
            placeholder="Título"
            required
            className="rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/20"
          />
          <textarea
            name="description"
            placeholder="Descripción (opcional)"
            rows={2}
            className="rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/20"
          />
          <SubmitButton>Crear libro</SubmitButton>
        </form>
      </div>
    </main>
  );
}
