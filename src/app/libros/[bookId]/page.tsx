import { requireUserId, requireBook } from "@/lib/session";
import { updateBookAction, deleteBookAction } from "@/lib/actions/books";
import { SubmitButton } from "@/components/SubmitButton";
import { input, muted, dangerButton } from "@/lib/ui";

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
        <label className="flex flex-col gap-1 text-sm text-rose-900/70">
          Título
          <input name="title" defaultValue={book.title} required className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-rose-900/70">
          Descripción
          <textarea
            name="description"
            defaultValue={book.description ?? ""}
            rows={4}
            className={input}
          />
        </label>
        <SubmitButton className="self-start">Guardar cambios</SubmitButton>
      </form>

      <form action={remove} className="border-t border-pink-100 pt-4">
        <p className={`mb-2 text-sm ${muted}`}>
          Eliminar este libro borrará también sus personajes, ubicaciones,
          eventos y objetos.
        </p>
        <button type="submit" className={dangerButton}>
          Eliminar libro
        </button>
      </form>
    </div>
  );
}
