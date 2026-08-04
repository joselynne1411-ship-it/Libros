import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";
import { createCharacterAction } from "@/lib/actions/characters";
import { SubmitButton } from "@/components/SubmitButton";
import { statusLabels, statusColors } from "@/lib/labels";

export default async function CharactersPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const userId = await requireUserId();
  await requireBook(bookId, userId);

  const characters = await prisma.character.findMany({
    where: { bookId },
    orderBy: { name: "asc" },
    include: { _count: { select: { appearances: true, itemsOwned: true } } },
  });

  async function create(formData: FormData) {
    "use server";
    await createCharacterAction(bookId, formData);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {characters.map((c) => (
          <Link
            key={c.id}
            href={`/libros/${bookId}/personajes/${c.id}`}
            className="rounded-lg border border-black/10 p-3 transition hover:border-indigo-400 dark:border-white/10"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{c.name}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${statusColors[c.status]}`}
              >
                {statusLabels[c.status]}
              </span>
            </div>
            {c.alias && (
              <p className="text-sm text-black/50 dark:text-white/50">
                “{c.alias}”
              </p>
            )}
            <p className="mt-2 text-xs text-black/50 dark:text-white/50">
              Aparece en {c._count.appearances} capítulos · {c._count.itemsOwned}{" "}
              objetos
            </p>
          </Link>
        ))}
        {characters.length === 0 && (
          <p className="text-sm text-black/60 dark:text-white/60">
            Todavía no hay personajes.
          </p>
        )}
      </div>

      <div className="max-w-md rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-3 font-medium">Nuevo personaje</h2>
        <form action={create} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Nombre
            <input
              name="name"
              required
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Alias (opcional)
            <input
              name="alias"
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Descripción (opcional)
            <textarea
              name="description"
              rows={2}
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Estado
            <select
              name="status"
              defaultValue="ALIVE"
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <SubmitButton>Crear personaje</SubmitButton>
        </form>
      </div>
    </div>
  );
}
