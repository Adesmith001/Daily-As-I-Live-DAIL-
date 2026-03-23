import { Download } from 'lucide-react'
import { toast } from 'sonner'

import { Button, type ButtonProps } from '@/components/ui/button'
import { usePwaInstall } from '@/hooks/use-pwa-install'
import { cn } from '@/lib/utils'

type InstallAppButtonProps = ButtonProps & {
  installedLabel?: string
  label?: string
}

export function InstallAppButton({
  className,
  installedLabel = 'Installed',
  label = 'Download app',
  ...props
}: InstallAppButtonProps) {
  const { canInstall, isInstalled, isIosManualInstall, promptInstall } = usePwaInstall()

  async function handleInstall() {
    if (isInstalled) {
      toast.message('DAIL is already installed on this device.')
      return
    }

    if (isIosManualInstall) {
      toast.message('To install DAIL on iPhone or iPad, tap Share and then Add to Home Screen.')
      return
    }

    if (!canInstall) {
      toast.error('This browser does not expose app install here. Try Chrome, Edge, or Add to Home Screen on iPhone.')
      return
    }

    const result = await promptInstall()

    if (result.outcome === 'accepted') {
      toast.success('DAIL is being added to your device.')
      return
    }

    if (result.outcome === 'dismissed') {
      toast.message('Install was dismissed. You can try again anytime.')
      return
    }

    toast.error('Install is not available right now on this browser.')
  }

  return (
    <Button className={cn('shrink-0', className)} onClick={() => void handleInstall()} {...props}>
      <Download className="size-4" />
      {isInstalled ? installedLabel : label}
    </Button>
  )
}
