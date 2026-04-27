export function LoadingScreen({
  label = 'Loading DAIL...',
  fullscreen = true,
}: {
  label?: string
  fullscreen?: boolean
}) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={fullscreen ? 'loading-screen' : 'loading-screen loading-screen-inline'}
      role="status"
    >
      <img alt="" className="loading-logo" src="/dail-logo.jpg" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
