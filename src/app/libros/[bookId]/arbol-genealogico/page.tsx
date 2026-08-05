import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireBook } from "@/lib/session";
import { relationLabels } from "@/lib/labels";
import { muted, link } from "@/lib/ui";

type CharacterNode = {
  id: string;
  name: string;
  children: CharacterNode[];
};

export default async function FamilyTreePage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const userId = await requireUserId();
  await requireBook(bookId, userId);

  const [characters, relations] = await Promise.all([
    prisma.character.findMany({ where: { bookId }, orderBy: { name: "asc" } }),
    prisma.characterRelation.findMany({
      where: { bookId },
      include: { from: true, to: true },
    }),
  ]);

  const parentOf = relations.filter((r) => r.type === "PARENT_OF");
  const otherRelations = relations.filter((r) => r.type !== "PARENT_OF");

  const childrenByParent = new Map<string, string[]>();
  const hasParent = new Set<string>();
  for (const r of parentOf) {
    childrenByParent.set(r.fromId, [
      ...(childrenByParent.get(r.fromId) ?? []),
      r.toId,
    ]);
    hasParent.add(r.toId);
  }

  const byId = new Map(characters.map((c) => [c.id, c]));

  function buildNode(id: string, visited: Set<string>): CharacterNode | null {
    const character = byId.get(id);
    if (!character || visited.has(id)) return null;
    const nextVisited = new Set(visited).add(id);
    const childIds = childrenByParent.get(id) ?? [];
    return {
      id,
      name: character.name,
      children: childIds
        .map((childId) => buildNode(childId, nextVisited))
        .filter((n): n is CharacterNode => n !== null),
    };
  }

  const roots = characters
    .filter((c) => !hasParent.has(c.id))
    .map((c) => buildNode(c.id, new Set()))
    .filter((n): n is CharacterNode => n !== null);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-rose-700">
          <span aria-hidden>🌳</span> Árbol genealógico
        </h2>
        {roots.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {roots.map((node) => (
              <TreeNode key={node.id} node={node} bookId={bookId} depth={0} />
            ))}
          </ul>
        ) : (
          <p className={`text-sm ${muted}`}>
            Registra relaciones de tipo &quot;es padre/madre de&quot; en la
            ficha de un personaje para construir el árbol.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-rose-700">
          <span aria-hidden>💞</span> Otras relaciones
        </h2>
        {otherRelations.length > 0 ? (
          <ul className="flex flex-col gap-1 text-sm">
            {otherRelations.map((r) => (
              <li key={r.id}>
                <Link href={`/libros/${bookId}/personajes/${r.from.id}`} className={link}>
                  {r.from.name}
                </Link>{" "}
                {relationLabels[r.type]}{" "}
                <Link href={`/libros/${bookId}/personajes/${r.to.id}`} className={link}>
                  {r.to.name}
                </Link>
                {r.note && <span className={muted}> — {r.note}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className={`text-sm ${muted}`}>Sin otras relaciones registradas.</p>
        )}
      </section>
    </div>
  );
}

function TreeNode({
  node,
  bookId,
  depth,
}: {
  node: CharacterNode;
  bookId: string;
  depth: number;
}) {
  return (
    <li style={{ marginLeft: depth * 20 }}>
      <Link href={`/libros/${bookId}/personajes/${node.id}`} className={link}>
        👤 {node.name}
      </Link>
      {node.children.length > 0 && (
        <ul className="mt-1 flex flex-col gap-1 border-l-2 border-pink-100 pl-3">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} bookId={bookId} depth={0} />
          ))}
        </ul>
      )}
    </li>
  );
}
