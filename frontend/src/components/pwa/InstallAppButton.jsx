import React, { useEffect, useState } from 'react'

const InstallAppButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
      setVisible(true)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setVisible(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-green-50 dark:border-green-800 dark:bg-gray-900 dark:text-green-300 dark:hover:bg-gray-800"
    >
      Install App
    </button>
  )
}

export default InstallAppButton