import {
  useRef,
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
  type SetStateAction,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { animate, motion, useReducedMotion } from "motion/react";

export type Theme = "light" | "dark";

interface ThemeToggleProps {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
}

const SUN_CORE_PATH =
  "M12 6 C8.686 6 6 8.686 6 12 C6 15.314 8.686 18 12 18 C15.314 18 18 15.314 18 12 C18 8.686 15.314 6 12 6 Z";
const MOON_CORE_PATH =
  "M12 6 C8.686 6 6 8.686 6 12 C6 15.314 8.686 18 12 18 C14.9 18 17.35 16.1 18 13.5 C14.25 14.1 11.35 10.75 12 6 Z";

const SUN_RAY_PATHS = [
  "M12 2 Q12 3 12 4",
  "M19.071 4.929 Q18.364 5.636 17.657 6.343",
  "M22 12 Q21 12 20 12",
  "M19.071 19.071 Q18.364 18.364 17.657 17.657",
  "M12 22 Q12 21 12 20",
  "M4.929 19.071 Q5.636 18.364 6.343 17.657",
  "M2 12 Q3 12 4 12",
  "M4.929 4.929 Q5.636 5.636 6.343 6.343",
] as const;

const COLLAPSED_RAY_PATHS = [
  "M12 3 Q12 3 12 3",
  "M18.364 5.636 Q18.364 5.636 18.364 5.636",
  "M21 12 Q21 12 21 12",
  "M18.364 18.364 Q18.364 18.364 18.364 18.364",
  "M12 21 Q12 21 12 21",
  "M5.636 18.364 Q5.636 18.364 5.636 18.364",
  "M3 12 Q3 12 3 12",
  "M5.636 5.636 Q5.636 5.636 5.636 5.636",
] as const;

const CORE_EASE = [0.65, 0, 0.35, 1] as const;
const RAY_EASE = [0.4, 0, 1, 1] as const;
const RAY_RETURN_EASE = [0, 0, 0.2, 1] as const;
const REVEAL_START_EASE = [0.55, 0, 0.85, 0.35] as const;
const REVEAL_EXPAND_EASE = [0.22, 1, 0.36, 1] as const;
const REVEAL_DURATION = 2.1;
const REVEAL_SLOW_PHASE = 0.2;
const REVEAL_SLOW_RADIUS = 8;

interface ThemeIconProps {
  isDark: boolean;
  shouldReduceMotion: boolean;
}

const ThemeIcon = ({ isDark, shouldReduceMotion }: ThemeIconProps) => {
  const coreTransition = shouldReduceMotion
    ? { duration: 0 }
    : {
        duration: isDark ? 0.34 : 0.3,
        delay: isDark ? 0.14 : 0,
        ease: CORE_EASE,
      };

  return (
    <svg
      className="theme-toggle-icon"
      viewBox="0 0 24 24"
      fill="none"
      focusable="false"
    >
      <motion.path
        className="theme-toggle-icon-line theme-toggle-icon-core"
        initial={false}
        animate={{
          d: isDark ? MOON_CORE_PATH : SUN_CORE_PATH,
        }}
        transition={coreTransition}
      />
      {SUN_RAY_PATHS.map((sunPath, index) => (
        <motion.path
          key={index}
          className="theme-toggle-icon-line theme-toggle-icon-ray"
          initial={false}
          animate={{
            d: isDark ? COLLAPSED_RAY_PATHS[index] : sunPath,
            opacity: isDark ? 0 : 1,
          }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: isDark ? 0.16 : 0.22,
                  delay: isDark ? index * 0.006 : 0.2 + index * 0.008,
                  ease: isDark ? RAY_EASE : RAY_RETURN_EASE,
                }
          }
        />
      ))}
    </svg>
  );
};

export const ThemeToggle = ({ theme, setTheme }: ThemeToggleProps) => {
  const iconShellRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);
  const liveLayerRef = useRef<HTMLDivElement>(null);
  const transitionRunningRef = useRef(false);
  const shouldReduceMotion = Boolean(useReducedMotion());
  const isDark = theme === "dark";
  const nextTheme: Theme = isDark ? "light" : "dark";

  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>): void => {
    if (transitionRunningRef.current) return;

    const applyTheme = (): void => {
      document.documentElement.dataset.theme = nextTheme;
      flushSync(() => setTheme(nextTheme));
    };

    const overlay = overlayRef.current;
    const liveLayer = liveLayerRef.current;
    const iconShell = iconShellRef.current;
    const sourceViewport = document.querySelector<HTMLElement>(".site-viewport");
    const supportsMask =
      CSS.supports(
        "mask-image",
        "radial-gradient(circle, transparent 0, black 1px)"
      ) ||
      CSS.supports(
        "-webkit-mask-image",
        "radial-gradient(circle, transparent 0, black 1px)"
      );

    if (
      shouldReduceMotion ||
      !liveLayer ||
      !sourceViewport ||
      !supportsMask
    ) {
      applyTheme();
      return;
    }

    transitionRunningRef.current = true;

    const iconBounds =
      iconShell?.getBoundingClientRect() ??
      event.currentTarget.getBoundingClientRect();
    const originX = iconBounds.left + iconBounds.width / 2;
    const originY = iconBounds.top + iconBounds.height / 2;
    const originXPercent = Math.min(
      100,
      Math.max(0, (originX / window.innerWidth) * 100)
    );
    const originYPercent = Math.min(
      100,
      Math.max(0, (originY / window.innerHeight) * 100)
    );
    const revealRadius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY)
    );
    const updateRevealMask = (radius: number): void => {
      const mask = `radial-gradient(circle at ${originXPercent}% ${originYPercent}%, transparent 0 ${radius}px, #000 ${radius + 1}px)`;
      liveLayer.style.maskImage = mask;
      liveLayer.style.setProperty("-webkit-mask-image", mask);
    };
    const viewportClone = sourceViewport.cloneNode(true) as HTMLElement;
    let overlayIsOpen = false;
    let animationFrame = 0;
    let fallbackTimer = 0;
    let finished = false;
    let revealAnimation: ReturnType<typeof animate> | null = null;

    viewportClone.classList.add("theme-live-page-clone");
    viewportClone.setAttribute("aria-hidden", "true");
    viewportClone.inert = true;
    liveLayer.replaceChildren(viewportClone);
    liveLayer.style.setProperty("--theme-reveal-x", `${originXPercent}%`);
    liveLayer.style.setProperty("--theme-reveal-y", `${originYPercent}%`);
    updateRevealMask(0);

    if (
      overlay &&
      iconShell &&
      typeof overlay.showPopover === "function"
    ) {
      overlay.style.left = `${iconBounds.left}px`;
      overlay.style.top = `${iconBounds.top}px`;
      overlay.style.width = `${iconBounds.width}px`;
      overlay.style.height = `${iconBounds.height}px`;
      overlay.style.color = nextTheme === "dark" ? "#d2d2d2" : "#2d2d2d";

      try {
        overlay.showPopover();
        overlayIsOpen = true;
      } catch {
        // The page reveal still works when popovers are unavailable.
      }
    }

    const sourceScroller = sourceViewport.querySelector<HTMLElement>(
      "[data-scroll-wrapper]"
    );
    const cloneScroller = viewportClone.querySelector<HTMLElement>(
      "[data-scroll-wrapper]"
    );
    const sourceVideos = Array.from(
      sourceViewport.querySelectorAll<HTMLVideoElement>("video")
    );
    const cloneVideos = Array.from(
      viewportClone.querySelectorAll<HTMLVideoElement>("video")
    );

    const syncDynamicContent = (): void => {
      sourceViewport
        .querySelectorAll<HTMLElement>("[data-live-sync]")
        .forEach((sourceElement) => {
          const key = sourceElement.dataset.liveSync;
          if (!key) return;

          const cloneElement = viewportClone.querySelector<HTMLElement>(
            `[data-live-sync="${CSS.escape(key)}"]`
          );
          if (!cloneElement) return;

          if (cloneElement.innerHTML !== sourceElement.innerHTML) {
            cloneElement.innerHTML = sourceElement.innerHTML;
          }

          const ariaLabel = sourceElement.getAttribute("aria-label");
          if (ariaLabel === null) {
            cloneElement.removeAttribute("aria-label");
          } else {
            cloneElement.setAttribute("aria-label", ariaLabel);
          }
        });
    };

    const mutationObserver = new MutationObserver(syncDynamicContent);
    mutationObserver.observe(sourceViewport, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    syncDynamicContent();

    const syncMovingContent = (): void => {
      if (sourceScroller && cloneScroller) {
        cloneScroller.scrollTop = sourceScroller.scrollTop;
        cloneScroller.scrollLeft = sourceScroller.scrollLeft;
      }

      sourceVideos.forEach((sourceVideo, index) => {
        const cloneVideo = cloneVideos[index];
        if (!cloneVideo || !Number.isFinite(sourceVideo.currentTime)) return;

        if (Math.abs(cloneVideo.currentTime - sourceVideo.currentTime) > 0.08) {
          try {
            cloneVideo.currentTime = sourceVideo.currentTime;
          } catch {
            // A video without metadata will synchronize on a later frame.
          }
        }
      });

      animationFrame = window.requestAnimationFrame(syncMovingContent);
    };

    syncMovingContent();

    const finishTransition = (): void => {
      if (finished) return;
      finished = true;

      window.clearTimeout(fallbackTimer);
      window.cancelAnimationFrame(animationFrame);
      mutationObserver.disconnect();
      revealAnimation?.stop();
      revealAnimation = null;

      if (overlayIsOpen && overlay?.matches(":popover-open")) {
        overlay.hidePopover();
      }

      delete liveLayer.dataset.active;
      liveLayer.replaceChildren();
      liveLayer.style.removeProperty("mask-image");
      liveLayer.style.removeProperty("-webkit-mask-image");
      liveLayer.style.removeProperty("--theme-reveal-x");
      liveLayer.style.removeProperty("--theme-reveal-y");
      transitionRunningRef.current = false;
    };

    delete liveLayer.dataset.active;
    void liveLayer.offsetWidth;
    liveLayer.dataset.active = "true";
    applyTheme();

    revealAnimation = animate(
      0,
      [0, REVEAL_SLOW_RADIUS, revealRadius + 2],
      {
        duration: REVEAL_DURATION,
        times: [0, REVEAL_SLOW_PHASE / REVEAL_DURATION, 1],
        ease: [REVEAL_START_EASE, REVEAL_EXPAND_EASE],
        onUpdate: updateRevealMask,
        onComplete: finishTransition,
      }
    );
    fallbackTimer = window.setTimeout(finishTransition, 2300);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="theme-toggle"
        aria-label={`Switch to ${nextTheme} mode`}
        aria-pressed={isDark}
        title={`Switch to ${nextTheme} mode`}
      >
        <span
          ref={iconShellRef}
          className="theme-toggle-icon-shell"
          aria-hidden="true"
        >
          <ThemeIcon
            isDark={isDark}
            shouldReduceMotion={shouldReduceMotion}
          />
        </span>
      </button>
      {createPortal(
        <span
          ref={overlayRef}
          className="theme-icon-morph-overlay"
          popover="manual"
          aria-hidden="true"
        >
          <ThemeIcon
            isDark={isDark}
            shouldReduceMotion={shouldReduceMotion}
          />
        </span>,
        document.body
      )}
      {createPortal(
        <div
          ref={liveLayerRef}
          className="theme-live-page-layer"
          aria-hidden="true"
        />,
        document.body
      )}
    </>
  );
};
