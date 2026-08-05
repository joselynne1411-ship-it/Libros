"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";

const chapterSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  order: z.coerce.number().int(),
  summary: z.string().trim().optional(),
});

export async function createChapterAction(bookId: string, formData: FormData) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);

  const parsed = chapterSchema.parse({
    title: formData.get("title"),
    order: formData.get("order"),
    summary: formData.get("summary") || undefined,
  });

  await prisma.chapter.create({ data: { ...parsed, bookId } });
  revalidatePath(`/libros/${bookId}/capitulos`);
}

export async function updateChapterAction(
  bookId: string,
  chapterId: string,
  formData: FormData,
) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);

  const parsed = chapterSchema.parse({
    title: formData.get("title"),
    order: formData.get("order"),
    summary: formData.get("summary") || undefined,
  });

  await prisma.chapter.update({ where: { id: chapterId }, data: parsed });
  revalidatePath(`/libros/${bookId}/capitulos`);
}

export async function deleteChapterAction(bookId: string, chapterId: string) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);
  await prisma.chapter.delete({ where: { id: chapterId } });
  revalidatePath(`/libros/${bookId}/capitulos`);
}
