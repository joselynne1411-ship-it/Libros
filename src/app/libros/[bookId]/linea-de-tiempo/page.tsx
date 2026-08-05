import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";
import {
  createTimelineEventAction,
  deleteTimelineEventAction,
} from "@/lib/actions/timeline";
import { SubmitButton } from "@/components/SubmitButton";
import { card, input, muted, dangerLink } from "@/lib/ui";

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
      <ol className="flex flex-col gap-3 border-l-2 border-pink-100 pl-4">
        {events.map((event) => (
          <li key={event.id} className="relative">
            <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-pink-400 ring-4 ring-pink-50" />
            <div className={`flex items-start justify-between gap-4 ${card}`}>
              <div>
                <p className={`text-xs ${muted}`}>
                  ⏳ #{event.order}
                  {event.location && <> · 📍 {event.location.name}</>}
                </p>
                <p className="font-semibold text-rose-700">{event.title}</p>
                {event.description && (
                  <p className={`mt-1 text-sm ${muted}`}>{event.description}</p>
                )}
                {event.characters.length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-2 text-xs">
                    {event.characters.map(({ character }) => (
                      <Link
                        key={character.id}
                        href={`/libros/${bookId}/personajes/${character.id}`}
                        className="rounded-full bg-pink-50 px-2 py-0.5 text-pink-700 hover:underline"
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
                <button type="submit" className={dangerLink}>
                  Eliminar
                </button>
              </form>
            </div>
          </li>
        ))}
        {events.length === 0 && (
          <p className={`text-sm ${muted}`}>
            Todavía no hay eventos en la línea de tiempo.
          </p>
        )}
      </ol>

      <div className={`max-w-lg ${card}`}>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-rose-700">
          <span aria-hidden>✨</span> Nuevo evento
        </h2>
        <form action={create} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            Orden cronológico
            <input
              name="order"
              type="number"
              defaultValue={events.length + 1}
              required
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            Título
            <input name="title" required className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            Descripción (opcional)
            <textarea name="description" rows={2} className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            Ubicación (opcional)
            <select name="locationId" className={input}>
              <option value="">— Ninguna —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="flex flex-col gap-1 text-sm text-rose-900/70">
            <legend>Personajes involucrados</legend>
            <div className={`flex max-h-40 flex-col gap-1 overflow-y-auto ${input}`}>
              {characters.map((c) => (
                <label key={c.id} className="flex items-center gap-2">
                  <input type="checkbox" name="characterIds" value={c.id} />
                  {c.name}
                </label>
              ))}
              {characters.length === 0 && (
                <p className={muted}>Sin personajes todavía.</p>
              )}
            </div>
          </fieldset>
          <SubmitButton>Añadir evento</SubmitButton>
        </form>
      </div>
    </div>
  );
}
