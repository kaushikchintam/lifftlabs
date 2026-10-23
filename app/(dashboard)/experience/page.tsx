import { PlusGate } from "@/components/layout/plus-gate";
import { ExperienceBoard } from "@/features/experience/components/experience-board";

export default function ExperiencePage() {
  return (
    <PlusGate>
      <ExperienceBoard />
    </PlusGate>
  );
}
