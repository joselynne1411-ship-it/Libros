import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";
import {
  createChapterAction,
  deleteChapterAction,
} from "@/lib/actions/chapters";
import { SubmitButton } from "@/components/SubmitButton";
import { card, input, muted, dangerLink } from "@/lib/ui";

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
            className={`flex items-start justify-between gap-4 ${card}`}
          >
            <div>
              <p className={`text-xs font-medium ${muted}`}>
                📖 Cap. {chapter.order}
              </p>
              <p className="font-semibold text-rose-700">{chapter.title}</p>
              {chapter.summary && (
                <p className={`mt-1 text-sm ${muted}`}>{chapter.summary}</p>
              )}
              <p className={`mt-1 text-xs ${muted}`}>
                👤 {chapter._count.appearances} personajes aparecen aquí
              </p>
            </div>
            <form
              action={async () => {
                "use server";
                await deleteChapterAction(bookId, chapter.id);
              }}
            >
              <button type="submit" className={dangerLink}>
                Eliminar
              </button>
            </form>
          </div>
        ))}
        {chapters.length === 0 && (
          <p className={`text-sm ${muted}`}>Todavía no hay capítulos.</p>
        )}
      </div>

      <div className={`max-w-md ${card}`}>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-rose-700">
          <span aria-hidden>✨</span> Nuevo capítulo
        </h2>
        <form action={create} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            Número
            <input
              name="order"
              type="number"
              defaultValue={chapters.length + 1}
              required
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            Título
            <input name="title" required className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-rose-900/70">
            Resumen (opcional)
            <textarea name="summary" rows={2} className={input} />
          </label>
          <SubmitButton>Añadir capítulo</SubmitButton>
        </form>
      </div>
    </div>
  );
}
