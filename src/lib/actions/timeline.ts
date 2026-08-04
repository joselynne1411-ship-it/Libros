"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";

const eventSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  order: z.coerce.number().int(),
  description: z.string().trim().optional(),
  locationId: z.string().trim().optional(),
});

export async function createTimelineEventAction(
  bookId: string,
  formData: FormData,
) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);

  const parsed = eventSchema.parse({
    title: formData.get("title"),
    order: formData.get("order"),
    description: formData.get("description") || undefined,
    locationId: formData.get("locationId") || undefined,
  });

  const characterIds = formData.getAll("characterIds") as string[];

  await prisma.timelineEvent.create({
    data: {
      title: parsed.title,
      order: parsed.order,
      description: parsed.description,
      locationId: parsed.locationId || null,
      bookId,
      characters: {
        create: characterIds.map((characterId) => ({ characterId })),
      },
    },
  });

  revalidatePath(`/libros/${bookId}/linea-de-tiempo`);
}

export async function deleteTimelineEventAction(
  bookId: string,
  eventId: string,
) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);
  await prisma.timelineEvent.delete({ where: { id: eventId } });
  revalidatePath(`/libros/${bookId}/linea-de-tiempo`);
}
