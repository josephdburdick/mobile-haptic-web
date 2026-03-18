import { TruncatedText } from "@j0e/haptic-text"

const sampleUuid = "123e4567-e89b-12d3-a456-426614174000"

type TruncatedTextSlideProps = { soundEnabled?: boolean }

export function TruncatedTextSlide({ soundEnabled }: TruncatedTextSlideProps) {
  return (
    <div className="stack">
      <p>
        Tap to expand, tap again to collapse. The ellipsis shows where text was
        truncated. Built-in patterns for <code>uuid</code> and{" "}
        <code>email</code>.
      </p>

      <p className="truncatedSectionLabel">Copy always visible</p>
      <div className="truncatedRow">
        <span className="truncatedRowLabel">uuid</span>
        <TruncatedText text={sampleUuid} pattern="uuid" enabled={soundEnabled} />
      </div>
      <div className="truncatedRow">
        <span className="truncatedRowLabel">email</span>
        <TruncatedText text="joedemo@example.com" pattern="email" enabled={soundEnabled} />
      </div>

      <p className="truncatedSectionLabel">Copy on expand only</p>
      <div className="truncatedRow">
        <span className="truncatedRowLabel">uuid</span>
        <TruncatedText
          text={sampleUuid}
          pattern="uuid"
          copyVisibility="expanded"
          enabled={soundEnabled}
        />
      </div>
      <div className="truncatedRow">
        <span className="truncatedRowLabel">email</span>
        <TruncatedText
          text="joedemo@example.com"
          pattern="email"
          copyVisibility="expanded"
          enabled={soundEnabled}
        />
      </div>
    </div>
  )
}
