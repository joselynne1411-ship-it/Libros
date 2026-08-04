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
import { statusLabels, statusColors, relationLabels } from "@/lib/labels";

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
          <h2 className="text-lg font-semibold">{character.name}</h2>
          {character.alias && (
            <p className="text-sm text-black/50 dark:text-white/50">
              “{character.alias}”
            </p>
          )}
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${statusColors[character.status]}`}
        >
          {statusLabels[character.status]}
        </span>
      </div>

      <section className="grid gap-8 md:grid-cols-2">
        <form action={update} className="flex flex-col gap-3">
          <h3 className="font-medium">Ficha</h3>
          <label className="flex flex-col gap-1 text-sm">
            Nombre
            <input
              name="name"
              defaultValue={character.name}
              required
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Alias
            <input
              name="alias"
              defaultValue={character.alias ?? ""}
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Descripción
            <textarea
              name="description"
              defaultValue={character.description ?? ""}
              rows={4}
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Estado actual
            <select
              name="status"
              defaultValue={character.status}
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Nota sobre el estado
            <input
              name="statusNote"
              defaultValue={character.statusNote ?? ""}
              placeholder='p.ej. "Herido tras la batalla del cap. 12"'
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
            />
          </label>
          <SubmitButton className="self-start">Guardar</SubmitButton>
        </form>

        <div className="flex flex-col gap-4">
          <div>
            <h3 className="mb-2 font-medium">Objetos que posee</h3>
            {character.itemsOwned.length > 0 ? (
              <ul className="flex flex-col gap-1 text-sm">
                {character.itemsOwned.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/libros/${bookId}/objetos`}
                      className="text-indigo-600 hover:underline"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-black/60 dark:text-white/60">
                Ningún objeto asignado todavía.
              </p>
            )}
          </div>

          <form action={remove} className="border-t border-black/10 pt-4 dark:border-white/10">
            <button
              type="submit"
              className="rounded-md border border-red-600 px-4 py-2 text-sm text-red-600 hover:bg-red-600 hover:text-white"
            >
              Eliminar personaje
            </button>
          </form>
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-medium">Aparición en capítulos</h3>
        <p className="mb-3 text-sm text-black/60 dark:text-white/60">
          Marca en qué capítulos aparece {character.name} y anota su estado en
          ese punto de la historia.
        </p>
        <div className="flex flex-col gap-2">
          {chapters.map((chapter) => {
            const appearance = appearanceByChapter.get(chapter.id);
            return (
              <div
                key={chapter.id}
                className="rounded-lg border border-black/10 p-3 dark:border-white/10"
              >
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
                      className={`rounded-md border px-2 py-1 text-xs ${
                        appearance
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-black/20 dark:border-white/20"
                      }`}
                    >
                      {appearance ? "Aparece" : "No aparece"}
                    </button>
                  </form>
                  <span className="text-sm font-medium">
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
                      className="rounded-md border border-black/10 px-2 py-1 text-sm dark:border-white/20"
                    />
                    <div className="flex gap-2">
                      <input
                        name="notes"
                        defaultValue={appearance.notes ?? ""}
                        placeholder="Notas"
                        className="w-full rounded-md border border-black/10 px-2 py-1 text-sm dark:border-white/20"
                      />
                      <button
                        type="submit"
                        className="shrink-0 rounded-md border border-black/20 px-2 text-xs dark:border-white/20"
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
            <p className="text-sm text-black/60 dark:text-white/60">
              Crea capítulos primero para poder marcar apariciones.
            </p>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-medium">Relaciones</h3>
        <ul className="mb-4 flex flex-col gap-1 text-sm">
          {character.relationsFrom.map((r) => (
            <li key={r.id} className="flex items-center gap-2">
              <span>
                {character.name} {relationLabels[r.type]}{" "}
                <Link
                  href={`/libros/${bookId}/personajes/${r.to.id}`}
                  className="text-indigo-600 hover:underline"
                >
                  {r.to.name}
                </Link>
                {r.note && (
                  <span className="text-black/50 dark:text-white/50">
                    {" "}
                    — {r.note}
                  </span>
                )}
              </span>
              <form
                action={async () => {
                  "use server";
                  await deleteRelationAction(bookId, characterId, r.id);
                }}
              >
                <button
                  type="submit"
                  className="text-xs text-red-600 hover:underline"
                >
                  quitar
                </button>
              </form>
            </li>
          ))}
          {character.relationsTo.map((r) => (
            <li key={r.id} className="flex items-center gap-2">
              <span>
                <Link
                  href={`/libros/${bookId}/personajes/${r.from.id}`}
                  className="text-indigo-600 hover:underline"
                >
                  {r.from.name}
                </Link>{" "}
                {relationLabels[r.type]} {character.name}
                {r.note && (
                  <span className="text-black/50 dark:text-white/50">
                    {" "}
                    — {r.note}
                  </span>
                )}
              </span>
            </li>
          ))}
          {character.relationsFrom.length === 0 &&
            character.relationsTo.length === 0 && (
              <p className="text-black/60 dark:text-white/60">
                Sin relaciones registradas.
              </p>
            )}
        </ul>

        <form
          action={addRelation}
          className="flex max-w-lg flex-wrap items-end gap-2"
        >
          <label className="flex flex-col gap-1 text-sm">
            {character.name}
            <select
              name="type"
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
            >
              {Object.entries(relationLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Personaje
            <select
              name="toId"
              required
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
            >
              {otherCharacters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Nota
            <input
              name="note"
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
            />
          </label>
          <SubmitButton>Añadir relación</SubmitButton>
        </form>
      </section>
    </div>
  );
}
