"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";
import { saveUploadedImage } from "@/lib/uploads";

export async function setMapImageAction(bookId: string, formData: FormData) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  const url = await saveUploadedImage(file);
  await prisma.book.update({ where: { id: bookId }, data: { mapImageUrl: url } });
  revalidatePath(`/libros/${bookId}/ubicaciones`);
}

const locationSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  description: z.string().trim().optional(),
});

export async function createLocationAction(
  bookId: string,
  formData: FormData,
) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);

  const parsed = locationSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  await prisma.location.create({ data: { ...parsed, bookId } });
  revalidatePath(`/libros/${bookId}/ubicaciones`);
}

export async function updateLocationPositionAction(
  bookId: string,
  locationId: string,
  xPercent: number,
  yPercent: number,
) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);

  await prisma.location.update({
    where: { id: locationId },
    data: { xPercent, yPercent },
  });
  revalidatePath(`/libros/${bookId}/ubicaciones`);
}

export async function deleteLocationAction(
  bookId: string,
  locationId: string,
) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);
  await prisma.location.delete({ where: { id: locationId } });
  revalidatePath(`/libros/${bookId}/ubicaciones`);
}
