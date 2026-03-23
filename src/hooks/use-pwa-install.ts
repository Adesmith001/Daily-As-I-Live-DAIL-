import { useCallback, useEffect, useMemo, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

function getIsStandalone() {
  if (typeof window === 'undefined') {
    return false
  }

  const isStandaloneDisplayMode = window.matchMedia('(display-mode: standalone)').matches
  const isIosStandalone =
    'standalone' in window.navigator &&
    typeof window.navigator.standalone === 'boolean' &&
    window.navigator.standalone

  return isStandaloneDisplayMode || isIosStandalone
}

function getIsIos() {
  if (typeof navigator === 'undefined') {
    return false
  }

  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function getIsSafari() {
  if (typeof navigator === 'undefined') {
    return false
  }

  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(getIsStandalone)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    function handleInstalled() {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        handleInstalled()
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    mediaQuery.addEventListener('change', handleMediaChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
      mediaQuery.removeEventListener('change', handleMediaChange)
    }
  }, [])

  const isIosManualInstall = useMemo(
    () => getIsIos() && getIsSafari() && !isInstalled,
    [isInstalled],
  )

  const canInstall = Boolean(deferredPrompt) || isIosManualInstall

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return { outcome: 'unavailable' as const }
    }

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice

    if (choice.outcome === 'accepted') {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    return { outcome: choice.outcome }
  }, [deferredPrompt])

  return {
    canInstall,
    isInstalled,
    isIosManualInstall,
    promptInstall,
  }
}
