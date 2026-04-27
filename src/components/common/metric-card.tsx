export function MetricCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="stat-block min-h-28">
      <p className="section-kicker">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
        {value}
      </p>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{helper}</p>
    </div>
  )
}
