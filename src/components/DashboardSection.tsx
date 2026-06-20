interface DashboardSectionProps {
  title: string;
  id?: string;
  children: React.ReactNode;
}

export default function DashboardSection({
  title,
  id,
  children,
}: DashboardSectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-glass-border to-transparent" />
        <h2 className="shrink-0 text-sm font-semibold uppercase tracking-widest text-gray-400">
          {title}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-glass-border to-transparent" />
      </div>
      {children}
    </section>
  );
}
