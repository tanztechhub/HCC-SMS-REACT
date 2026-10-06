import { useEffect, useState } from "react"
import "./PwaInstall.css"

export default function PwaInstall() {
  const [prompt, setPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)")
    const update = () => setInstalled(standalone.matches || Boolean(navigator.standalone))
    const ready = (event) => { event.preventDefault(); setPrompt(event) }
    const complete = () => { setInstalled(true); setPrompt(null); setShowHelp(false) }
    update()
    standalone.addEventListener("change", update)
    window.addEventListener("beforeinstallprompt", ready)
    window.addEventListener("appinstalled", complete)
    return () => {
      standalone.removeEventListener("change", update)
      window.removeEventListener("beforeinstallprompt", ready)
      window.removeEventListener("appinstalled", complete)
    }
  }, [])
  const install = async () => {
    if (!prompt) { setShowHelp(true); return }
    try { await prompt.prompt(); await prompt.userChoice } finally { setPrompt(null) }
  }
  if (installed || (!prompt && !isIos)) return null
  return <div className="hcc-pwa-install">
    {showHelp && <div className="hcc-pwa-help" role="dialog" aria-label="Install HCC SMS">
      <strong>Install HCC SMS</strong><p>In Safari, tap Share, then Add to Home Screen.</p>
      <button type="button" onClick={() => setShowHelp(false)}>Close</button>
    </div>}
    <button type="button" className="hcc-pwa-button" onClick={install}>Install HCC SMS</button>
  </div>
}
