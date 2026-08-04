import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";

export async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

export async function requireBook(bookId: string, userId: string) {
  const book = await prisma.book.findFirst({
    where: { id: bookId, ownerId: userId },
  });
  if (!book) notFound();
  return book;
}
