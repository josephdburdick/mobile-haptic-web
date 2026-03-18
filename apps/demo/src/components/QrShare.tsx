import { useEffect, useMemo, useState } from "react"
import QRCode from "qrcode"

type QrShareProps = {
  activeSlideId: string
}

export function QrShare({ activeSlideId }: QrShareProps) {
  const [qrDataUrl, setQrDataUrl] = useState("")

  const shareUrl = useMemo(() => {
    const url = new URL(window.location.href)
    url.hash = activeSlideId
    return url.toString()
  }, [activeSlideId])

  useEffect(() => {
    void QRCode.toDataURL(shareUrl, {
      margin: 1,
      width: 120,
      color: { dark: "#f8fafc", light: "#00000000" },
    }).then(setQrDataUrl)
  }, [shareUrl])

  return (
    <aside className="qrPanel">
      <p className="qrLabel">Share slide</p>
      {qrDataUrl ? (
        <img src={qrDataUrl} alt={`QR for ${activeSlideId}`} className="qrImage" />
      ) : null}
      <code className="qrCodeText">#{activeSlideId}</code>
    </aside>
  )
}
