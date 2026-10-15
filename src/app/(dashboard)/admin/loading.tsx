export default function AdminLoading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="space-y-5">
      <p className="text-sm font-medium text-text-secondary">Memuat halaman...</p>
      <div aria-hidden="true" className="space-y-5 motion-safe:animate-pulse">
        <div className="page-hero space-y-3">
          <div className="h-8 w-48 max-w-full rounded-lg bg-primary/10" />
          <div className="h-4 w-72 max-w-full rounded-lg bg-primary/5" />
        </div>
        <div className="section-card space-y-4 p-5">
          <div className="h-11 rounded-xl bg-primary/5" />
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-12 rounded-lg bg-primary/5" />
          ))}
        </div>
      </div>
    </div>
  )
}
