"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";

const characterSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  alias: z.string().trim().optional(),
  description: z.string().trim().optional(),
  status: z.enum(["ALIVE", "DECEASED", "MISSING", "UNKNOWN"]),
  statusNote: z.string().trim().optional(),
});

function parseCharacterForm(formData: FormData) {
  return characterSchema.parse({
    name: formData.get("name"),
    alias: formData.get("alias") || undefined,
    description: formData.get("description") || undefined,
    status: formData.get("status") || "ALIVE",
    statusNote: formData.get("statusNote") || undefined,
  });
}

export async function createCharacterAction(
  bookId: string,
  formData: FormData,
) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);
  const parsed = parseCharacterForm(formData);

  const character = await prisma.character.create({
    data: { ...parsed, bookId },
  });

  revalidatePath(`/libros/${bookId}/personajes`);
  redirect(`/libros/${bookId}/personajes/${character.id}`);
}

export async function updateCharacterAction(
  bookId: string,
  characterId: string,
  formData: FormData,
) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);
  const parsed = parseCharacterForm(formData);

  await prisma.character.update({
    where: { id: characterId },
    data: parsed,
  });

  revalidatePath(`/libros/${bookId}/personajes`);
  revalidatePath(`/libros/${bookId}/personajes/${characterId}`);
}

export async function deleteCharacterAction(
  bookId: string,
  characterId: string,
) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);
  await prisma.character.delete({ where: { id: characterId } });
  revalidatePath(`/libros/${bookId}/personajes`);
  redirect(`/libros/${bookId}/personajes`);
}

export async function toggleAppearanceAction(
  bookId: string,
  characterId: string,
  chapterId: string,
  appears: boolean,
) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);

  if (appears) {
    await prisma.chapterAppearance.upsert({
      where: { chapterId_characterId: { chapterId, characterId } },
      update: {},
      create: { chapterId, characterId },
    });
  } else {
    await prisma.chapterAppearance
      .delete({
        where: { chapterId_characterId: { chapterId, characterId } },
      })
      .catch(() => {});
  }

  revalidatePath(`/libros/${bookId}/personajes/${characterId}`);
}

export async function updateAppearanceNoteAction(
  bookId: string,
  characterId: string,
  chapterId: string,
  formData: FormData,
) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);

  await prisma.chapterAppearance.update({
    where: { chapterId_characterId: { chapterId, characterId } },
    data: {
      statusAtPoint: (formData.get("statusAtPoint") as string) || null,
      notes: (formData.get("notes") as string) || null,
    },
  });

  revalidatePath(`/libros/${bookId}/personajes/${characterId}`);
}

const relationSchema = z.object({
  toId: z.string().trim().min(1),
  type: z.enum([
    "PARENT_OF",
    "SIBLING_OF",
    "MARRIED_TO",
    "PARTNER_OF",
    "MENTOR_OF",
    "ENEMY_OF",
    "FRIEND_OF",
    "OTHER",
  ]),
  note: z.string().trim().optional(),
});

export async function createRelationAction(
  bookId: string,
  fromId: string,
  formData: FormData,
) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);

  const parsed = relationSchema.parse({
    toId: formData.get("toId"),
    type: formData.get("type"),
    note: formData.get("note") || undefined,
  });

  if (parsed.toId === fromId) return;

  await prisma.characterRelation.create({
    data: { bookId, fromId, toId: parsed.toId, type: parsed.type, note: parsed.note },
  });

  revalidatePath(`/libros/${bookId}/personajes/${fromId}`);
  revalidatePath(`/libros/${bookId}/arbol-genealogico`);
}

export async function deleteRelationAction(
  bookId: string,
  characterId: string,
  relationId: string,
) {
  const userId = await requireUserId();
  await requireBook(bookId, userId);
  await prisma.characterRelation.delete({ where: { id: relationId } });
  revalidatePath(`/libros/${bookId}/personajes/${characterId}`);
  revalidatePath(`/libros/${bookId}/arbol-genealogico`);
}
