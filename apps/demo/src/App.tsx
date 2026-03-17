import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { TruncatedText } from "@j0e/haptic-text";
import { HapticRadioGroup } from "@j0e/haptic-text/haptic-radio-group";
import { HapticSnapDrawer } from "@j0e/haptic-text/haptic-snap-drawer";
import { HapticStreamingText } from "@j0e/haptic-text/haptic-streaming-text";
import QRCode from "qrcode";

type Slide = {
  id: string;
  title: string;
  content: ReactNode;
};

const sampleUuid = "123e4567-e89b-12d3-a456-426614174000";

function getCurrentSlideHash(): string {
  return window.location.hash.replace("#", "") || "home";
}

function QrShare({ activeSlideId }: { activeSlideId: string }) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  const shareUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.hash = activeSlideId;
    return url.toString();
  }, [activeSlideId]);

  useEffect(() => {
    void QRCode.toDataURL(shareUrl, {
      margin: 1,
      width: 120,
      color: { dark: "#f8fafc", light: "#00000000" }
    }).then(setQrDataUrl);
  }, [shareUrl]);

  return (
    <aside className="qrPanel">
      <p className="qrLabel">Share slide</p>
      {qrDataUrl ? (
        <img src={qrDataUrl} alt={`QR for ${activeSlideId}`} className="qrImage" />
      ) : null}
      <code className="qrCodeText">#{activeSlideId}</code>
    </aside>
  );
}

function SlideDots({
  slides,
  activeSlideId,
  onDotClick
}: {
  slides: Slide[];
  activeSlideId: string;
  onDotClick: (id: string) => void;
}) {
  return (
    <nav className="slideDots" aria-label="Slide navigation">
      {slides.map((slide) => (
        <button
          key={slide.id}
          className="slideDot"
          data-active={slide.id === activeSlideId}
          onClick={() => onDotClick(slide.id)}
          aria-label={slide.title}
          type="button"
        />
      ))}
    </nav>
  );
}

function StreamingTextSlide({ isVisible }: { isVisible: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isVisible) setIsPlaying(false);
  }, [isVisible]);

  const toggle = useCallback(() => setIsPlaying((v) => !v), []);

  return (
    <div className="stack">
      <p>Simulated token stream with a subtle haptic pulse every few characters.</p>
      <HapticStreamingText
        sourceText="We can add tactile rhythm to live AI output so updates feel intentional instead of noisy. This component throttles haptic triggers to avoid fatigue while still reinforcing each burst of new content."
        hapticEveryNChars={12}
        intervalMs={65}
        playing={isPlaying}
      />
      <button type="button" className="streamToggle" onClick={toggle}>
        {isPlaying ? "Stop" : "Start"}
      </button>
    </div>
  );
}

export function App() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [activeSlideId, setActiveSlideId] = useState("home");

  const slides: Slide[] = [
    {
      id: "home",
      title: "Home",
      content: (
        <div className="stack">
          <h1 className="heroTitle">
            Haptic UI
            <br />
            Components
          </h1>
          <p className="heroBody">
            Swipe through this deck to explore tactile feedback patterns for modern mobile web
            interfaces. Best experienced on a device that supports the Vibration API.
          </p>
        </div>
      )
    },
    {
      id: "truncated-text",
      title: "TruncatedText",
      content: (
        <div className="stack">
          <p>
            Tap to expand, tap again to collapse. Built-in patterns for <code>uuid</code> and{" "}
            <code>email</code>, or pass a custom truncation function.
          </p>
          <TruncatedText text={sampleUuid} pattern="uuid" />
          <TruncatedText text="joedemo@example.com" pattern="email" />
        </div>
      )
    },
    {
      id: "haptic-radio",
      title: "Radio Presets",
      content: (
        <div className="stack">
          <p>Each option fires a different haptic preset so you can feel the difference.</p>
          <HapticRadioGroup
            name="haptic-preset"
            options={[
              { id: "selection", label: "Selection (8 ms)", hapticPreset: "selection" },
              { id: "light", label: "Light (15 ms)", hapticPreset: "light" },
              { id: "medium", label: "Medium (25 ms)", hapticPreset: "medium" },
              { id: "heavy", label: "Heavy (35 ms)", hapticPreset: "heavy" },
              { id: "success", label: "Success (2 pulses)", hapticPreset: "success" }
            ]}
          />
        </div>
      )
    },
    {
      id: "snap-drawer",
      title: "Snap Drawer",
      content: (
        <div className="stack">
          <p>Tap the snap-point pills to resize the drawer and feel the corresponding haptic.</p>
          <HapticSnapDrawer />
        </div>
      )
    },
    {
      id: "streaming-text",
      title: "AI Streaming Text",
      content: <StreamingTextSlide isVisible={activeSlideId === "streaming-text"} />
    },
    {
      id: "goodbye",
      title: "Fin",
      content: (
        <div className="goodbyeStack">
          <h2 className="goodbyeTitle">Thanks for exploring.</h2>
          <p className="goodbyeBody">
            This is an open-source proof of concept. The components are published as an npm package
            and work on any React project.
          </p>
          <div className="goodbyeLinks">
            <a className="primaryLink" href="https://j0e.me" target="_blank" rel="noreferrer">
              j0e.me &rarr;
            </a>
            <a
              className="primaryLink"
              href="https://github.com/josephdburdick/mobile-haptic-web"
              target="_blank"
              rel="noreferrer"
            >
              Source on GitHub
            </a>
          </div>
          <hr className="goodbyeDivider" />
          <p className="goodbyeFooter">Built with web-haptics, Vite, and React.</p>
        </div>
      )
    }
  ];

  function scrollToSlide(slideId: string) {
    const rail = railRef.current;
    if (!rail) return;
    const el = rail.querySelector<HTMLElement>(`[data-slide-id="${slideId}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const initialId = getCurrentSlideHash();
    const initialSlide = rail.querySelector<HTMLElement>(`[data-slide-id="${initialId}"]`);
    if (initialSlide) {
      initialSlide.scrollIntoView({ behavior: "auto", inline: "start", block: "nearest" });
      setActiveSlideId(initialId);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!best) return;

        const slideId = (best.target as HTMLElement).dataset.slideId;
        if (!slideId) return;

        setActiveSlideId(slideId);
        if (window.location.hash !== `#${slideId}`) {
          window.history.replaceState(null, "", `#${slideId}`);
        }
      },
      { root: rail, threshold: [0.6, 0.9] }
    );

    const elements = Array.from(rail.querySelectorAll<HTMLElement>("[data-slide-id]"));
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="pageShell">
      <a href="https://j0e.me" target="_blank" rel="noreferrer" className="siteLogo">
        <img src="/j0e-logo--solid.svg" alt="j0e" className="siteLogoImg" />
      </a>
      <div className="slidesRail" ref={railRef}>
        {slides.map((slide) => (
          <section key={slide.id} className="slide" data-slide-id={slide.id}>
            <div className="slideInner">
              <p className="slideEyebrow">{slide.title}</p>
              {slide.content}
            </div>
          </section>
        ))}
      </div>
      <SlideDots slides={slides} activeSlideId={activeSlideId} onDotClick={scrollToSlide} />
      <QrShare activeSlideId={activeSlideId} />
    </main>
  );
}
