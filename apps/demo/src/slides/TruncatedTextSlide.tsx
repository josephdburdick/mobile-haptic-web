import { TruncatedText } from "@j0e/haptic-text"

const sampleUuid = "123e4567-e89b-12d3-a456-426614174000"

export function TruncatedTextSlide() {
  return (
    <div className="stack">
      <p>
        Tap to expand, tap again to collapse. Built-in patterns for <code>uuid</code>{" "}
        and <code>email</code>, or pass a custom truncation function.
      </p>
      <TruncatedText text={sampleUuid} pattern="uuid" />
      <TruncatedText text="joedemo@example.com" pattern="email" />
    </div>
  )
}
