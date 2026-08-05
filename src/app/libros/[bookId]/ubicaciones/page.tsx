import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";
import {
  setMapImageAction,
  createLocationAction,
  deleteLocationAction,
} from "@/lib/actions/locations";
import { SubmitButton } from "@/components/SubmitButton";
import { MapEditor } from "@/components/MapEditor";
import { card, input, muted, dangerLink } from "@/lib/ui";

export default async function LocationsPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const userId = await requireUserId();
  const book = await requireBook(bookId, userId);

  const locations = await prisma.location.findMany({
    where: { bookId },
    orderBy: { name: "asc" },
  });

  async function uploadMap(formData: FormData) {
    "use server";
    await setMapImageAction(bookId, formData);
  }

  async function create(formData: FormData) {
    "use server";
    await createLocationAction(bookId, formData);
  }

  return (
    <div className="flex flex-col gap-6">
      {book.mapImageUrl ? (
        <MapEditor
          bookId={bookId}
          mapImageUrl={book.mapImageUrl}
          locations={locations}
        />
      ) : (
        <p className={`text-sm ${muted}`}>
          🗺️ Sube una imagen de mapa para poder ubicar tus lugares sobre ella.
        </p>
      )}

      <form action={uploadMap} className="flex items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-rose-900/70">
          {book.mapImageUrl ? "Reemplazar mapa" : "Subir mapa"}
          <input
            name="file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            required
            className="text-sm text-rose-900/70 file:mr-3 file:rounded-full file:border-0 file:bg-pink-100 file:px-3 file:py-1.5 file:text-pink-700"
          />
        </label>
        <SubmitButton>Subir</SubmitButton>
      </form>

      <div className="flex flex-col gap-2">
        {locations.map((l) => (
          <div key={l.id} className={`flex items-start justify-between gap-4 ${card}`}>
            <div>
              <p className="flex items-center gap-2 font-semibold text-rose-950">
                <span aria-hidden>📍</span> {l.name}
              </p>
              {l.description && (
                <p className={`mt-1 text-sm ${muted}`}>{l.description}</p>
              )}
            </div>
            <form
              action={async () => {
                "use server";
                await deleteLocationAction(bookId, l.id);
              }}
            >
              <button type="submit" className={dangerLink}>
                Eliminar
              </button>
            </form>
          </div>
        ))}
      </div>

      <div className={`max-w-md ${card}`}>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-rose-950">
          <span aria-hidden>✨</span> Nueva ubicación
        </h2>
        <form action={create} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            Nombre
            <input name="name" required className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            Descripción (opcional)
            <textarea name="description" rows={2} className={input} />
          </label>
          <SubmitButton>Crear ubicación</SubmitButton>
        </form>
      </div>
    </div>
  );
}
