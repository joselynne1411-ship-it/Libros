import { requireUserId, requireBook } from "@/lib/session";
import { updateBookAction, deleteBookAction } from "@/lib/actions/books";
import { SubmitButton } from "@/components/SubmitButton";

export default async function BookOverviewPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const userId = await requireUserId();
  const book = await requireBook(bookId, userId);

  async function update(formData: FormData) {
    "use server";
    await updateBookAction(bookId, formData);
  }

  async function remove() {
    "use server";
    await deleteBookAction(bookId);
  }

  return (
    <div className="flex max-w-md flex-col gap-6">
      <form action={update} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Título
          <input
            name="title"
            defaultValue={book.title}
            required
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Descripción
          <textarea
            name="description"
            defaultValue={book.description ?? ""}
            rows={4}
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20"
          />
        </label>
        <SubmitButton className="self-start">Guardar cambios</SubmitButton>
      </form>

      <form action={remove} className="border-t border-black/10 pt-4 dark:border-white/10">
        <p className="mb-2 text-sm text-black/60 dark:text-white/60">
          Eliminar este libro borrará también sus personajes, ubicaciones,
          eventos y objetos.
        </p>
        <button
          type="submit"
          className="rounded-md border border-red-600 px-4 py-2 text-sm text-red-600 hover:bg-red-600 hover:text-white"
        >
          Eliminar libro
        </button>
      </form>
    </div>
  );
}
