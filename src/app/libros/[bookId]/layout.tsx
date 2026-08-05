import { requireUserId, requireBook } from "@/lib/session";
import { BookNav } from "@/components/BookNav";

export default async function BookLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const userId = await requireUserId();
  const book = await requireBook(bookId, userId);

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-6">
        <h1 className="mx-auto flex max-w-5xl items-center gap-2 text-xl font-bold text-rose-950">
          <span aria-hidden>📖</span> {book.title}
        </h1>
      </div>
      <div className="mx-auto w-full max-w-5xl">
        <BookNav bookId={bookId} />
      </div>
      <div className="mx-auto w-full max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}
