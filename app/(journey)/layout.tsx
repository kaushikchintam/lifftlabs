export default function JourneyLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-lf-page px-4 py-10 font-sans text-lf-ink md:py-14">
      <div className="mx-auto max-w-[920px]">{children}</div>
    </main>
  );
}
