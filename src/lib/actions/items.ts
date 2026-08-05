"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";

const itemSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  description: z.string().trim().optional(),
  ownerId: z.string().trim().optional(),
  locationId: z.string().trim().optional(),
});

export async function createItemAction(bookId: string, formData: FormData) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);

  const parsed = itemSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    ownerId: formData.get("ownerId") || undefined,
    locationId: formData.get("locationId") || undefined,
  });

  await prisma.item.create({
    data: {
      name: parsed.name,
      description: parsed.description,
      ownerId: parsed.ownerId || null,
      locationId: parsed.locationId || null,
      bookId,
    },
  });
  revalidatePath(`/libros/${bookId}/objetos`);
}

export async function deleteItemAction(bookId: string, itemId: string) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);
  await prisma.item.delete({ where: { id: itemId } });
  revalidatePath(`/libros/${bookId}/objetos`);
}
