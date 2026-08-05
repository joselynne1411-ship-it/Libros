"use client";

import { useState, useTransition } from "react";
import { updateLocationPositionAction } from "@/lib/actions/locations";

type Location = {
  id: string;
  name: string;
  xPercent: number | null;
  yPercent: number | null;
};

export function MapEditor({
  bookId,
  mapImageUrl,
  locations,
}: {
  bookId: string;
  mapImageUrl: string;
  locations: Location[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selected = locations.find((l) => l.id === selectedId) ?? null;

  function handleMapClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!selectedId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
    startTransition(() => {
      updateLocationPositionAction(bookId, selectedId, xPercent, yPercent);
    });
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row">
      <div
        onClick={handleMapClick}
        className={`relative w-full max-w-2xl overflow-hidden rounded-2xl border border-pink-100 shadow-sm shadow-pink-100 ${
          selectedId ? "cursor-crosshair" : ""
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mapImageUrl} alt="Mapa" className="block w-full select-none" />
        {locations
          .filter((l) => l.xPercent != null && l.yPercent != null)
          .map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(l.id);
              }}
              title={l.name}
              style={{ left: `${l.xPercent}%`, top: `${l.yPercent}%` }}
              className={`absolute -translate-x-1/2 -translate-y-full text-lg drop-shadow transition ${
                selectedId === l.id ? "scale-125" : ""
              }`}
            >
              📍
            </button>
          ))}
      </div>

      <div className="flex w-full max-w-xs flex-col gap-1">
        <p className="mb-1 text-sm text-rose-900/50">
          {selected
            ? `Haz clic en el mapa para ubicar a "${selected.name}"${isPending ? "…" : ""}`
            : "Selecciona una ubicación y luego haz clic en el mapa para colocarla."}
        </p>
        {locations.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setSelectedId(l.id === selectedId ? null : l.id)}
            className={`flex items-center justify-between rounded-xl border px-2 py-1.5 text-left text-sm transition ${
              selectedId === l.id
                ? "border-pink-400 bg-pink-50"
                : "border-pink-100 hover:border-pink-300"
            }`}
          >
            <span className="flex items-center gap-1.5">📍 {l.name}</span>
            {l.xPercent == null && (
              <span className="text-xs text-amber-600">sin ubicar</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
