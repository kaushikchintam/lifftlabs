import { PlusGate } from "@/components/layout/plus-gate";
import { PageHeader } from "@/components/layout/page-header";
import { GibbsBoard } from "@/features/gibbs/components/gibbs-board";

export default function GibbsPage() {
  return (
    <PlusGate>
      <div className="max-w-4xl">
        <PageHeader eyebrow="Gibbs reflective cycle" title="Reflection" />
        <GibbsBoard />
      </div>
    </PlusGate>
  );
}
