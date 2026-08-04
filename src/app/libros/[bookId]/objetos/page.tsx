import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";
import { createItemAction, deleteItemAction } from "@/lib/actions/items";
import { SubmitButton } from "@/components/SubmitButton";

export default async function ItemsPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const userId = await requireUserId();
  await requireBook(bookId, userId);

  const [items, characters, locations] = await Promise.all([
    prisma.item.findMany({
      where: { bookId },
      orderBy: { name: "asc" },
      include: { owner: true, location: true },
    }),
    prisma.character.findMany({
      where: { bookId },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({ where: { bookId }, orderBy: { name: "asc" } }),
  ]);

  async function create(formData: FormData) {
    "use server";
    await createItemAction(bookId, formData);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-black/10 p-3 dark:border-white/10"
          >
            <div className="flex items-start justify-between">
              <p className="font-medium">{item.name}</p>
              <form
                action={async () => {
                  "use server";
                  await deleteItemAction(bookId, item.id);
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
            {item.description && (
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                {item.description}
              </p>
            )}
            <p className="mt-2 text-xs text-black/50 dark:text-white/50">
              {item.owner ? (
                <>
                  Poseído por{" "}
                  <Link
                    href={`/libros/${bookId}/personajes/${item.owner.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {item.owner.name}
                  </Link>
                </>
              ) : (
                "Sin dueño"
              )}
              {item.location && <> · en {item.location.name}</>}
            </p>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-black/60 dark:text-white/60">
            Todavía no hay objetos.
          </p>
        )}
      </div>

      <div className="max-w-md rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-3 font-medium">Nuevo objeto</h2>
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
          <label className="flex flex-col gap-1 text-sm">
            Dueño (opcional)
            <select
              name="ownerId"
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
            >
              <option value="">— Ninguno —</option>
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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
          <SubmitButton>Añadir objeto</SubmitButton>
        </form>
      </div>
    </div>
  );
}
