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
    <div className="overflow-hidden rounded-2xl border border-lf-line bg-white">
      <div className={`px-7 py-6 ${accent === "brand" ? "bg-lf-ink text-white" : "bg-[#E2F1E8] text-lf-ink"}`}>
        <h3 className="font-bold tracking-tight text-2xl">{shelf.title}</h3>
        <p className={`text-sm ${accent === "brand" ? "text-white/80" : "text-lf-muted"}`}>{shelf.subtitle}</p>
      </div>
      <div className="px-7">
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
