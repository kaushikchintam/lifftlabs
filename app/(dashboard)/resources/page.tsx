import { PlusGate } from "@/components/layout/plus-gate";
import { PageHeader } from "@/components/layout/page-header";
import { ResourceShelf } from "@/features/resources/components/resource-shelf";
import { RESOURCE_SHELVES } from "@/features/resources/components/data/resources";

export default function ResourcesPage() {
  return (
    <PlusGate>
      <PageHeader title="Resources" />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <ResourceShelf shelf={RESOURCE_SHELVES.pragmatic} accent="brand" />
        <ResourceShelf shelf={RESOURCE_SHELVES.inspiration} accent="brand-tint" />
      </div>
    </PlusGate>
  );
}
