import { PlusGate } from "@/components/layout/plus-gate";
import { PortfolioBoard } from "@/features/portfolio/components/portfolio-board";

export default function PortfolioPage() {
  return (
    <PlusGate>
      <PortfolioBoard />
    </PlusGate>
  );
}
