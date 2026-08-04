import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";
import {
  createTimelineEventAction,
  deleteTimelineEventAction,
} from "@/lib/actions/timeline";
import { SubmitButton } from "@/components/SubmitButton";

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const userId = await requireUserId();
  await requireBook(bookId, userId);

  const [events, characters, locations] = await Promise.all([
    prisma.timelineEvent.findMany({
      where: { bookId },
      orderBy: { order: "asc" },
      include: { location: true, characters: { include: { character: true } } },
    }),
    prisma.character.findMany({ where: { bookId }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { bookId }, orderBy: { name: "asc" } }),
  ]);

  async function create(formData: FormData) {
    "use server";
    await createTimelineEventAction(bookId, formData);
  }

  return (
    <div className="flex flex-col gap-8">
      <ol className="flex flex-col gap-3 border-l border-black/10 pl-4 dark:border-white/10">
        {events.map((event) => (
          <li key={event.id} className="relative">
            <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-600" />
            <div className="flex items-start justify-between gap-4 rounded-lg border border-black/10 p-3 dark:border-white/10">
              <div>
                <p className="text-xs text-black/50 dark:text-white/50">
                  #{event.order}
                  {event.location && <> · {event.location.name}</>}
                </p>
                <p className="font-medium">{event.title}</p>
                {event.description && (
                  <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                    {event.description}
                  </p>
                )}
                {event.characters.length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-2 text-xs">
                    {event.characters.map(({ character }) => (
                      <Link
                        key={character.id}
                        href={`/libros/${bookId}/personajes/${character.id}`}
                        className="rounded-full bg-black/5 px-2 py-0.5 text-indigo-600 hover:underline dark:bg-white/10"
                      >
                        {character.name}
                      </Link>
                    ))}
                  </p>
                )}
              </div>
              <form
                action={async () => {
                  "use server";
                  await deleteTimelineEventAction(bookId, event.id);
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </form>
            </div>
          </li>
        ))}
        {events.length === 0 && (
          <p className="text-sm text-black/60 dark:text-white/60">
            Todavía no hay eventos en la línea de tiempo.
          </p>
        )}
      </ol>

      <div className="max-w-lg rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-3 font-medium">Nuevo evento</h2>
        <form action={create} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Orden cronológico
            <input
              name="order"
              type="number"
              defaultValue={events.length + 1}
              required
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Título
            <input
              name="title"
              required
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
            Ubicación (opcional)
            <select
              name="locationId"
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
            >
              <option value="">— Ninguna —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="flex flex-col gap-1 text-sm">
            <legend>Personajes involucrados</legend>
            <div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-md border border-black/10 p-2 dark:border-white/20">
              {characters.map((c) => (
                <label key={c.id} className="flex items-center gap-2">
                  <input type="checkbox" name="characterIds" value={c.id} />
                  {c.name}
                </label>
              ))}
              {characters.length === 0 && (
                <p className="text-black/50 dark:text-white/50">
                  Sin personajes todavía.
                </p>
              )}
            </div>
          </fieldset>
          <SubmitButton>Añadir evento</SubmitButton>
        </form>
      </div>
    </div>
  );
}
