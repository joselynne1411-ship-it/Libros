import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";
import { createItemAction, deleteItemAction } from "@/lib/actions/items";
import { SubmitButton } from "@/components/SubmitButton";
import { card, input, muted, link, dangerLink } from "@/lib/ui";

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
          <div key={item.id} className={card}>
            <div className="flex items-start justify-between">
              <p className="flex items-center gap-2 font-semibold text-rose-950">
                <span aria-hidden>🗝️</span> {item.name}
              </p>
              <form
                action={async () => {
                  "use server";
                  await deleteItemAction(bookId, item.id);
                }}
              >
                <button type="submit" className={dangerLink}>
                  Eliminar
                </button>
              </form>
            </div>
            {item.description && (
              <p className={`mt-1 text-sm ${muted}`}>{item.description}</p>
            )}
            <p className={`mt-2 text-xs ${muted}`}>
              {item.owner ? (
                <>
                  Poseído por{" "}
                  <Link
                    href={`/libros/${bookId}/personajes/${item.owner.id}`}
                    className={link}
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
          <p className={`text-sm ${muted}`}>Todavía no hay objetos.</p>
        )}
      </div>

      <div className={`max-w-md ${card}`}>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-rose-950">
          <span aria-hidden>✨</span> Nuevo objeto
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
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            Dueño (opcional)
            <select name="ownerId" className={input}>
              <option value="">— Ninguno —</option>
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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
          <SubmitButton>Añadir objeto</SubmitButton>
        </form>
      </div>
    </div>
  );
}
