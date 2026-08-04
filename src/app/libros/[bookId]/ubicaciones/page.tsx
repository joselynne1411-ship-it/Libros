import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";
import {
  setMapImageAction,
  createLocationAction,
  deleteLocationAction,
} from "@/lib/actions/locations";
import { SubmitButton } from "@/components/SubmitButton";
import { MapEditor } from "@/components/MapEditor";

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
        <p className="text-sm text-black/60 dark:text-white/60">
          Sube una imagen de mapa para poder ubicar tus lugares sobre ella.
        </p>
      )}

      <form action={uploadMap} className="flex items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          {book.mapImageUrl ? "Reemplazar mapa" : "Subir mapa"}
          <input
            name="file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            required
            className="text-sm"
          />
        </label>
        <SubmitButton>Subir</SubmitButton>
      </form>

      <div className="flex flex-col gap-2">
        {locations.map((l) => (
          <div
            key={l.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-black/10 p-3 dark:border-white/10"
          >
            <div>
              <p className="font-medium">{l.name}</p>
              {l.description && (
                <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                  {l.description}
                </p>
              )}
            </div>
            <form
              action={async () => {
                "use server";
                await deleteLocationAction(bookId, l.id);
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
        ))}
      </div>

      <div className="max-w-md rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-3 font-medium">Nueva ubicación</h2>
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
            Descripción (opcional)
            <textarea
              name="description"
              rows={2}
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
            />
          </label>
          <SubmitButton>Crear ubicación</SubmitButton>
        </form>
      </div>
    </div>
  );
}
