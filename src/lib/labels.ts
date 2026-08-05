export const statusLabels: Record<string, string> = {
  ALIVE: "Vivo",
  DECEASED: "Fallecido",
  MISSING: "Desaparecido",
  UNKNOWN: "Desconocido",
};

export const statusIcons: Record<string, string> = {
  ALIVE: "💗",
  DECEASED: "🕊️",
  MISSING: "❓",
  UNKNOWN: "🌫️",
};

export const statusColors: Record<string, string> = {
  ALIVE: "bg-green-100 text-green-700",
  DECEASED: "bg-zinc-200 text-zinc-700",
  MISSING: "bg-amber-100 text-amber-700",
  UNKNOWN: "bg-blue-100 text-blue-700",
};

export const relationLabels: Record<string, string> = {
  PARENT_OF: "es padre/madre de",
  SIBLING_OF: "es hermano/a de",
  MARRIED_TO: "está casado/a con",
  PARTNER_OF: "es pareja de",
  MENTOR_OF: "es mentor/a de",
  ENEMY_OF: "es enemigo/a de",
  FRIEND_OF: "es amigo/a de",
  OTHER: "se relaciona con",
};
