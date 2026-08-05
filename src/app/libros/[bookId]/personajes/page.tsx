import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";
import { createCharacterAction } from "@/lib/actions/characters";
import { SubmitButton } from "@/components/SubmitButton";
import { statusLabels, statusColors, statusIcons } from "@/lib/labels";
import { card, cardHover, input, muted } from "@/lib/ui";

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
          <Link key={c.id} href={`/libros/${bookId}/personajes/${c.id}`} className={cardHover}>
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 font-semibold text-black">
                <span aria-hidden>👤</span> {c.name}
              </p>
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[c.status]}`}
              >
                {statusIcons[c.status]} {statusLabels[c.status]}
              </span>
            </div>
            {c.alias && <p className={`text-sm ${muted}`}>“{c.alias}”</p>}
            <p className={`mt-2 text-xs ${muted}`}>
              📖 {c._count.appearances} capítulos · 🗝️ {c._count.itemsOwned}{" "}
              objetos
            </p>
          </Link>
        ))}
        {characters.length === 0 && (
          <p className={`text-sm ${muted}`}>Todavía no hay personajes.</p>
        )}
      </div>

      <div className={`max-w-md ${card}`}>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-black">
          <span aria-hidden>✨</span> Nuevo personaje
        </h2>
        <form action={create} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-black/70">
            Nombre
            <input name="name" required className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-black/70">
            Alias (opcional)
            <input name="alias" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-black/70">
            Descripción (opcional)
            <textarea name="description" rows={2} className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-black/70">
            Estado
            <select name="status" defaultValue="ALIVE" className={input}>
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
