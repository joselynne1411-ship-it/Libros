import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";
import {
  createChapterAction,
  deleteChapterAction,
} from "@/lib/actions/chapters";
import { SubmitButton } from "@/components/SubmitButton";

export default async function ChaptersPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const userId = await requireUserId();
  await requireBook(bookId, userId);

  const chapters = await prisma.chapter.findMany({
    where: { bookId },
    orderBy: { order: "asc" },
    include: { _count: { select: { appearances: true } } },
  });

  async function create(formData: FormData) {
    "use server";
    await createChapterAction(bookId, formData);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-black/10 p-3 dark:border-white/10"
          >
            <div>
              <p className="text-sm text-black/50 dark:text-white/50">
                Cap. {chapter.order}
              </p>
              <p className="font-medium">{chapter.title}</p>
              {chapter.summary && (
                <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                  {chapter.summary}
                </p>
              )}
              <p className="mt-1 text-xs text-black/50 dark:text-white/50">
                {chapter._count.appearances} personajes aparecen aquí
              </p>
            </div>
            <form
              action={async () => {
                "use server";
                await deleteChapterAction(bookId, chapter.id);
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
        {chapters.length === 0 && (
          <p className="text-sm text-black/60 dark:text-white/60">
            Todavía no hay capítulos.
          </p>
        )}
      </div>

      <div className="max-w-md rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-3 font-medium">Nuevo capítulo</h2>
        <form action={create} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Número
            <input
              name="order"
              type="number"
              defaultValue={chapters.length + 1}
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
            Resumen (opcional)
            <textarea
              name="summary"
              rows={2}
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
            />
          </label>
          <SubmitButton>Añadir capítulo</SubmitButton>
        </form>
      </div>
    </div>
  );
}
