import { useEffect, useMemo, useState } from "react"
import QRCode from "qrcode"

type QrShareProps = {
  activeSlideId: string
}

export function QrShare({ activeSlideId }: QrShareProps) {
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const shareUrl = useMemo(() => {
    const url = new URL(window.location.href)
    url.hash = activeSlideId
    return url.toString()
  }, [activeSlideId])

  useEffect(() => {
    void QRCode.toDataURL(shareUrl, {
      margin: 1,
      width: 256,
      color: { dark: "#f8fafc", light: "#00000000" },
    }).then(setQrDataUrl)
  }, [shareUrl])

  useEffect(() => {
    if (!isDialogOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDialogOpen(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isDialogOpen])

  return (
    <>
      <button
        type="button"
        className="qrToggle"
        aria-label="Open QR share dialog"
        aria-expanded={isDialogOpen}
        onClick={() => setIsDialogOpen(true)}
      >
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="" className="qrToggleImage" aria-hidden="true" />
        ) : (
          <span className="qrToggleFallback" aria-hidden="true">
            QR
          </span>
        )}
      </button>

      {isDialogOpen ? (
        <div
          className="qrDialogOverlay"
          role="presentation"
          onClick={() => setIsDialogOpen(false)}
        >
          <section
            className="qrDialog"
            role="dialog"
            aria-modal="true"
            aria-label="Share this slide"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="qrDialogLabel">Share this slide</p>
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${activeSlideId}`}
                className="qrDialogImage"
              />
            ) : null}
            <code className="qrCodeText">#{activeSlideId}</code>
            <button
              type="button"
              className="qrDialogClose"
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </button>
          </section>
        </div>
      ) : null}
    </>
  )
}
