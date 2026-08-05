"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";

const bookSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  description: z.string().trim().optional(),
});

export async function createBookAction(formData: FormData) {
  const userId = await requireUserId();
  const parsed = bookSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });

  const book = await prisma.book.create({
    data: { ...parsed, ownerId: userId },
  });

  revalidatePath("/libros");
  redirect(`/libros/${book.id}`);
}

export async function deleteBookAction(bookId: string) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);
  await prisma.book.delete({ where: { id: bookId } });
  revalidatePath("/libros");
  redirect("/libros");
}

export async function updateBookAction(bookId: string, formData: FormData) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);
  const parsed = bookSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });

  await prisma.book.update({ where: { id: bookId }, data: parsed });
  revalidatePath(`/libros/${bookId}`);
}
