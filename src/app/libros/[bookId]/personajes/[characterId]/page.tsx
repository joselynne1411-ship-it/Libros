import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";
import {
  updateCharacterAction,
  deleteCharacterAction,
  toggleAppearanceAction,
  updateAppearanceNoteAction,
  createRelationAction,
  deleteRelationAction,
} from "@/lib/actions/characters";
import { SubmitButton } from "@/components/SubmitButton";
import { statusLabels, statusColors, statusIcons, relationLabels } from "@/lib/labels";
import { card, input, muted, link, dangerButton, dangerLink } from "@/lib/ui";

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ bookId: string; characterId: string }>;
}) {
  const { bookId, characterId } = await params;
  const userId = await requireUserId();
  await requireBook(bookId, userId);

  const character = await prisma.character.findFirst({
    where: { id: characterId, bookId },
    include: {
      appearances: {
        include: { chapter: true },
        orderBy: { chapter: { order: "asc" } },
      },
      itemsOwned: true,
      relationsFrom: { include: { to: true } },
      relationsTo: { include: { from: true } },
    },
  });
  if (!character) notFound();

  const [chapters, otherCharacters] = await Promise.all([
    prisma.chapter.findMany({ where: { bookId }, orderBy: { order: "asc" } }),
    prisma.character.findMany({
      where: { bookId, id: { not: characterId } },
      orderBy: { name: "asc" },
    }),
  ]);

  const appearanceByChapter = new Map(
    character.appearances.map((a) => [a.chapterId, a]),
  );

  async function update(formData: FormData) {
    "use server";
    await updateCharacterAction(bookId, characterId, formData);
  }

  async function remove() {
    "use server";
    await deleteCharacterAction(bookId, characterId);
  }

  async function addRelation(formData: FormData) {
    "use server";
    await createRelationAction(bookId, characterId, formData);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-rose-950">
            <span aria-hidden>👤</span> {character.name}
          </h2>
          {character.alias && (
            <p className={`text-sm ${muted}`}>“{character.alias}”</p>
          )}
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[character.status]}`}
        >
          {statusIcons[character.status]} {statusLabels[character.status]}
        </span>
      </div>

      <section className="grid gap-8 md:grid-cols-2">
        <form action={update} className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 font-semibold text-rose-950">
            <span aria-hidden>📝</span> Ficha
          </h3>
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            Nombre
            <input name="name" defaultValue={character.name} required className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            Alias
            <input name="alias" defaultValue={character.alias ?? ""} className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            Descripción
            <textarea
              name="description"
              defaultValue={character.description ?? ""}
              rows={4}
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            Estado actual
            <select name="status" defaultValue={character.status} className={input}>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            Nota sobre el estado
            <input
              name="statusNote"
              defaultValue={character.statusNote ?? ""}
              placeholder='p.ej. "Herido tras la batalla del cap. 12"'
              className={input}
            />
          </label>
          <SubmitButton className="self-start">Guardar</SubmitButton>
        </form>

        <div className="flex flex-col gap-4">
          <div>
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-rose-950">
              <span aria-hidden>🗝️</span> Objetos que posee
            </h3>
            {character.itemsOwned.length > 0 ? (
              <ul className="flex flex-col gap-1 text-sm">
                {character.itemsOwned.map((item) => (
                  <li key={item.id}>
                    <Link href={`/libros/${bookId}/objetos`} className={link}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`text-sm ${muted}`}>Ningún objeto asignado todavía.</p>
            )}
          </div>

          <form action={remove} className="border-t border-pink-100 pt-4">
            <button type="submit" className={dangerButton}>
              Eliminar personaje
            </button>
          </form>
        </div>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 font-semibold text-rose-950">
          <span aria-hidden>📖</span> Aparición en capítulos
        </h3>
        <p className={`mb-3 text-sm ${muted}`}>
          Marca en qué capítulos aparece {character.name} y anota su estado en
          ese punto de la historia.
        </p>
        <div className="flex flex-col gap-2">
          {chapters.map((chapter) => {
            const appearance = appearanceByChapter.get(chapter.id);
            return (
              <div key={chapter.id} className={card}>
                <div className="flex items-center gap-3">
                  <form
                    action={async () => {
                      "use server";
                      await toggleAppearanceAction(
                        bookId,
                        characterId,
                        chapter.id,
                        !appearance,
                      );
                    }}
                  >
                    <button
                      type="submit"
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                        appearance
                          ? "border-pink-500 bg-pink-500 text-white"
                          : "border-pink-200 text-rose-900/60 hover:border-pink-400"
                      }`}
                    >
                      {appearance ? "✓ Aparece" : "No aparece"}
                    </button>
                  </form>
                  <span className="text-sm font-medium text-rose-950">
                    Cap. {chapter.order} — {chapter.title}
                  </span>
                </div>
                {appearance && (
                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      await updateAppearanceNoteAction(
                        bookId,
                        characterId,
                        chapter.id,
                        formData,
                      );
                    }}
                    className="mt-2 grid gap-2 pl-1 sm:grid-cols-2"
                  >
                    <input
                      name="statusAtPoint"
                      defaultValue={appearance.statusAtPoint ?? ""}
                      placeholder="Estado en este capítulo"
                      className={`${input} py-1.5`}
                    />
                    <div className="flex gap-2">
                      <input
                        name="notes"
                        defaultValue={appearance.notes ?? ""}
                        placeholder="Notas"
                        className={`w-full ${input} py-1.5`}
                      />
                      <button
                        type="submit"
                        className="shrink-0 rounded-full border border-pink-200 px-3 text-xs text-pink-600 hover:border-pink-400"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
          {chapters.length === 0 && (
            <p className={`text-sm ${muted}`}>
              Crea capítulos primero para poder marcar apariciones.
            </p>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 font-semibold text-rose-950">
          <span aria-hidden>💞</span> Relaciones
        </h3>
        <ul className="mb-4 flex flex-col gap-1 text-sm">
          {character.relationsFrom.map((r) => (
            <li key={r.id} className="flex items-center gap-2">
              <span>
                {character.name} {relationLabels[r.type]}{" "}
                <Link href={`/libros/${bookId}/personajes/${r.to.id}`} className={link}>
                  {r.to.name}
                </Link>
                {r.note && <span className={muted}> — {r.note}</span>}
              </span>
              <form
                action={async () => {
                  "use server";
                  await deleteRelationAction(bookId, characterId, r.id);
                }}
              >
                <button type="submit" className={dangerLink}>
                  quitar
                </button>
              </form>
            </li>
          ))}
          {character.relationsTo.map((r) => (
            <li key={r.id} className="flex items-center gap-2">
              <span>
                <Link href={`/libros/${bookId}/personajes/${r.from.id}`} className={link}>
                  {r.from.name}
                </Link>{" "}
                {relationLabels[r.type]} {character.name}
                {r.note && <span className={muted}> — {r.note}</span>}
              </span>
            </li>
          ))}
          {character.relationsFrom.length === 0 &&
            character.relationsTo.length === 0 && (
              <p className={muted}>Sin relaciones registradas.</p>
            )}
        </ul>

        <form action={addRelation} className="flex max-w-lg flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            {character.name}
            <select name="type" className={input}>
              {Object.entries(relationLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            Personaje
            <select name="toId" required className={input}>
              {otherCharacters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            Nota
            <input name="note" className={input} />
          </label>
          <SubmitButton>Añadir relación</SubmitButton>
        </form>
      </section>
    </div>
  );
}
