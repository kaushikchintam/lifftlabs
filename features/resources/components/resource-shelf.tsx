"use client";

import { useCallback, useEffect, useState } from "react";
import { ResourceCard } from "./resource-card";
import type { ResourceShelfData } from "./data/resources";

interface ReflectionRow {
  resource_slug: string;
  reflection: string;
}

export function ResourceShelf({ shelf, accent }: { shelf: ResourceShelfData; accent: "brand" | "brand-tint" }) {
  const [reflections, setReflections] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    const res = await fetch("/api/resources/reflections");
    if (res.ok) {
      const { reflections } = await res.json();
      const map: Record<string, string> = {};
      for (const r of reflections as ReflectionRow[]) map[r.resource_slug] = r.reflection;
      setReflections(map);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="rounded-2xl border border-[#ECE7DD] bg-white overflow-hidden shadow-sm">
      <div className={`px-5 py-4 ${accent === "brand" ? "bg-brand text-white" : "bg-brand-tint/60 text-ink"}`}>
        <h3 className="font-dm-serif text-2xl">{shelf.title}</h3>
        <p className={`font-dm-sans text-sm ${accent === "brand" ? "text-white/80" : "text-ink-muted"}`}>{shelf.subtitle}</p>
      </div>
      <div className="px-5">
        {shelf.resources.map((resource) => (
          <ResourceCard
            key={resource.slug}
            resource={resource}
            reflection={reflections[resource.slug] ?? null}
            onSaved={refresh}
          />
        ))}
      </div>
    </div>
  );
}
