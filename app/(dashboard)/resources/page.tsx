import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ResourceShelf } from "@/features/resources/components/resource-shelf";
import { RESOURCE_SHELVES } from "@/features/resources/components/data/resources";

export default async function ResourcesPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-full bg-[#FAF8F3] p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="font-dm-serif text-5xl text-ink">Resources</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <ResourceShelf shelf={RESOURCE_SHELVES.pragmatic} accent="brand" />
          <ResourceShelf shelf={RESOURCE_SHELVES.inspiration} accent="brand-tint" />
        </div>
      </div>
    </div>
  );
}
