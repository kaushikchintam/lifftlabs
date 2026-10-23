/** Eyebrow · title · subtitle — the applicant tools' page header. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-[15px] font-medium uppercase tracking-wide text-[#2F7A55]">{eyebrow}</p>}
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 text-[19px] text-lf-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
