"use client";
import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import { cn } from "@/lib/cn";

export function FavoriteButton({ id, className }: { id: string; className?: string }) {
  const has = useFavorites(s => s.has(id));
  const toggle = useFavorites(s => s.toggle);
  return (
    <button
      aria-pressed={has}
      aria-label={has ? "В обраному" : "Додати в обране"}
      onClick={() => toggle(id)}
      className={cn(
        "px-3 py-2 rounded-2xl border border-[--line] bg-neutral-0 hover:bg-black/[.03] inline-flex items-center gap-2 transition",
        className
      )}
      title={has ? "В обраному" : "Додати в обране"}
    >
      <Heart className={cn("size-4", has && "fill-red-500 stroke-red-500")} />
      <span className="text-body-sm text-[--ink]">{has ? "В обраному" : "В обране"}</span>
    </button>
  );
}
