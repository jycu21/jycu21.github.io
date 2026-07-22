import {
  useRef,
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
  type SetStateAction,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { gsap } from "gsap";

export type Theme = "light" | "dark";

interface ThemeToggleProps {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
}

const MOON_CORE_PATH =
  "M16.7 1.2 C9.8 2.5 6.2 9 8.6 15.4 C11 21.8 18 23.8 23.25 19.5 C17.2 19.6 12.4 15.2 12.4 9.6 C12.4 6.4 13.9 3.4 16.7 1.2 Z";
const SUN_CORE_PATH =
  "M12 7 C9.239 7 7 9.239 7 12 C7 14.761 9.239 17 12 17 C14.761 17 17 14.761 17 12 C17 9.239 14.761 7 12 7 Z";
const MOON_CORE_STROKE_WIDTH = 1.2;
const SUN_CORE_STROKE_WIDTH = 1.5;
const MOON_RAY_PATHS = [
  "M16.8 3.2 Q16.8 3.2 16.8 3.2",
  "M13 5.5 Q13 5.5 13 5.5",
  "M10.2 9 Q10.2 9 10.2 9",
  "M9.3 13 Q9.3 13 9.3 13",
  "M11.2 17.7 Q11.2 17.7 11.2 17.7",
  "M15 20.5 Q15 20.5 15 20.5",
  "M19.2 20.4 Q19.2 20.4 19.2 20.4",
  "M22.8 18.8 Q22.8 18.8 22.8 18.8",
] as const;
const SUN_RAY_PATHS = [
  "M12 0.75 Q12 2.375 12 4",
  "M19.955 4.045 Q18.807 5.193 17.66 6.34",
  "M23.25 12 Q21.625 12 20 12",
  "M19.955 19.955 Q18.807 18.807 17.66 17.66",
  "M12 23.25 Q12 21.625 12 20",
  "M4.045 19.955 Q5.193 18.807 6.34 17.66",
  "M0.75 12 Q2.375 12 4 12",
  "M4.045 4.045 Q5.193 5.193 6.34 6.34",
] as const;

export const ThemeToggle = ({ theme, setTheme }: ThemeToggleProps) => {
  const iconShellRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const iconCoreRef = useRef<SVGPathElement>(null);
  const iconRayRefs = useRef<Array<SVGPathElement | null>>([]);
  const overlayRef = useRef<HTMLSpanElement>(null);
  const overlaySvgRef = useRef<SVGSVGElement>(null);
  const overlayCoreRef = useRef<SVGPathElement>(null);
  const overlayRayRefs = useRef<Array<SVGPathElement | null>>([]);
  const transitionRunningRef = useRef(false);
  const initialThemeRef = useRef(theme);

  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>): void => {
    if (transitionRunningRef.current) return;
    transitionRunningRef.current = true;

    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    const icon = iconRef.current;
    const iconCore = iconCoreRef.current;
    const iconRays = iconRayRefs.current.filter(
      (ray): ray is SVGPathElement => ray !== null
    );
    const overlay = overlayRef.current;
    const overlaySvg = overlaySvgRef.current;
    const overlayCore = overlayCoreRef.current;
    const overlayRays = overlayRayRefs.current.filter(
      (ray): ray is SVGPathElement => ray !== null
    );
    const { left, top, width, height } =
      event.currentTarget.getBoundingClientRect();
    const pointerActivation = event.detail > 0;
    const originX = pointerActivation ? event.clientX : left + width / 2;
    const originY = pointerActivation ? event.clientY : top + height / 2;
    const originXPercent = Math.min(
      100,
      Math.max(0, (originX / window.innerWidth) * 100)
    );
    const originYPercent = Math.min(
      100,
      Math.max(0, (originY / window.innerHeight) * 100)
    );
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const targetCorePath =
      nextTheme === "dark" ? MOON_CORE_PATH : SUN_CORE_PATH;
    const targetRayPaths =
      nextTheme === "dark" ? MOON_RAY_PATHS : SUN_RAY_PATHS;
    const targetRotation = nextTheme === "dark" ? -8 : 0;
    const targetY = nextTheme === "dark" ? -0.75 : 0;
    const targetCoreStrokeWidth =
      nextTheme === "dark"
        ? MOON_CORE_STROKE_WIDTH
        : SUN_CORE_STROKE_WIDTH;

    const updateIconGeometry = (
      targetIcon: SVGSVGElement,
      targetCore: SVGPathElement,
      targetRays: SVGPathElement[]
    ): void => {
      targetCore.setAttribute("d", targetCorePath);
      targetRays.forEach((ray, index) => {
        ray.setAttribute("d", targetRayPaths[index]);
      });
      gsap.set(targetCore, { strokeWidth: targetCoreStrokeWidth });
      gsap.set(targetIcon, { rotation: targetRotation, y: targetY });
    };

    let morphIcon = icon;
    let morphCore = iconCore;
    let morphRays = iconRays;
    let overlayIsOpen = false;

    if (
      overlay &&
      overlaySvg &&
      overlayCore &&
      overlayRays.length === SUN_RAY_PATHS.length &&
      iconShellRef.current &&
      typeof overlay.showPopover === "function"
    ) {
      const shellBounds = iconShellRef.current.getBoundingClientRect();

      overlay.style.left = `${shellBounds.left}px`;
      overlay.style.top = `${shellBounds.top}px`;
      overlay.style.color =
        nextTheme === "dark" ? "#d2d2d2" : "#2d2d2d";

      try {
        overlay.showPopover();
        overlayIsOpen = true;
        morphIcon = overlaySvg;
        morphCore = overlayCore;
        morphRays = overlayRays;
      } catch {
        // The in-place SVG remains the fallback when popovers are unavailable.
      }
    }

    if (
      overlayIsOpen &&
      icon &&
      iconCore &&
      iconRays.length === SUN_RAY_PATHS.length
    ) {
      updateIconGeometry(icon, iconCore, iconRays);
    }

    const animateIcon = (): Promise<void> => {
      if (
        !morphIcon ||
        !morphCore ||
        morphRays.length !== SUN_RAY_PATHS.length
      ) {
        return Promise.resolve();
      }

      gsap.killTweensOf([morphIcon, morphCore, ...morphRays]);

      if (prefersReducedMotion) {
        updateIconGeometry(morphIcon, morphCore, morphRays);
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const timeline = gsap.timeline({ onComplete: resolve });

        if (nextTheme === "dark") {
          timeline
            .to(
              morphRays,
              {
                attr: { d: (index: number) => targetRayPaths[index] },
                duration: 0.18,
                ease: "power2.in",
                stagger: { each: 0.004, from: "end" },
              },
              0
            )
            .to(
              morphCore,
              {
                attr: { d: targetCorePath },
                strokeWidth: targetCoreStrokeWidth,
                duration: 0.32,
                ease: "power2.inOut",
              },
              0.16
            )
            .to(
              morphIcon,
              {
                rotation: targetRotation,
                y: targetY,
                duration: 0.32,
                ease: "power2.inOut",
              },
              0.16
            );
        } else {
          timeline
            .to(
              morphCore,
              {
                attr: { d: targetCorePath },
                strokeWidth: targetCoreStrokeWidth,
                duration: 0.3,
                ease: "power2.inOut",
              },
              0
            )
            .to(
              morphIcon,
              {
                rotation: targetRotation,
                y: targetY,
                duration: 0.3,
                ease: "power2.inOut",
              },
              0
            )
            .to(
              morphRays,
              {
                attr: { d: (index: number) => targetRayPaths[index] },
                duration: 0.22,
                ease: "power2.out",
                stagger: { each: 0.004, from: "start" },
              },
              0.26
            );
        }
      });
    };

    const applyTheme = (): void => {
      document.documentElement.dataset.theme = nextTheme;
      flushSync(() => setTheme(nextTheme));
    };

    const revealTheme = (): Promise<void> => {
      if (
        prefersReducedMotion ||
        typeof document.startViewTransition !== "function"
      ) {
        applyTheme();
        return Promise.resolve();
      }

      const root = document.documentElement;

      root.dataset.themeTransitioning = "true";
      root.style.setProperty("--theme-reveal-x", `${originXPercent}%`);
      root.style.setProperty("--theme-reveal-y", `${originYPercent}%`);

      try {
        const transition = document.startViewTransition(applyTheme);
        return transition.finished
          .then(() => undefined)
          .catch(() => undefined)
          .finally(() => {
            delete root.dataset.themeTransitioning;
            root.style.removeProperty("--theme-reveal-x");
            root.style.removeProperty("--theme-reveal-y");
          });
      } catch {
        applyTheme();
        delete root.dataset.themeTransitioning;
        root.style.removeProperty("--theme-reveal-x");
        root.style.removeProperty("--theme-reveal-y");
        return Promise.resolve();
      }
    };

    void Promise.allSettled([animateIcon(), revealTheme()]).then(() => {
      if (overlayIsOpen && overlay?.matches(":popover-open")) {
        overlay.hidePopover();
      }
      transitionRunningRef.current = false;
    });
  };

  const initialCorePath =
    initialThemeRef.current === "light" ? SUN_CORE_PATH : MOON_CORE_PATH;
  const initialRayPaths =
    initialThemeRef.current === "light" ? SUN_RAY_PATHS : MOON_RAY_PATHS;
  const initialStrokeWidth =
    initialThemeRef.current === "light"
      ? SUN_CORE_STROKE_WIDTH
      : MOON_CORE_STROKE_WIDTH;
  const nextTheme: Theme = theme === "light" ? "dark" : "light";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="theme-toggle"
        aria-label={`Switch to ${nextTheme} mode`}
        title={`Switch to ${nextTheme} mode`}
      >
        <span
          ref={iconShellRef}
          className="theme-toggle-icon-shell"
          aria-hidden="true"
        >
          <svg
            ref={iconRef}
            className="theme-toggle-icon"
            viewBox="0 0 24 24"
            fill="none"
            focusable="false"
          >
            <path
              ref={iconCoreRef}
              d={initialCorePath}
              className="theme-toggle-icon-line theme-toggle-icon-core"
              style={{ strokeWidth: initialStrokeWidth }}
            />
            {initialRayPaths.map((path, index) => (
              <path
                key={index}
                ref={(node) => {
                  iconRayRefs.current[index] = node;
                }}
                d={path}
                className="theme-toggle-icon-line theme-toggle-icon-ray"
              />
            ))}
          </svg>
        </span>
      </button>
      {createPortal(
        <span
          ref={overlayRef}
          className="theme-icon-morph-overlay"
          popover="manual"
          aria-hidden="true"
        >
          <svg
            ref={overlaySvgRef}
            className="theme-toggle-icon"
            viewBox="0 0 24 24"
            fill="none"
            focusable="false"
          >
            <path
              ref={overlayCoreRef}
              d={initialCorePath}
              className="theme-toggle-icon-line theme-toggle-icon-core"
              style={{ strokeWidth: initialStrokeWidth }}
            />
            {initialRayPaths.map((path, index) => (
              <path
                key={index}
                ref={(node) => {
                  overlayRayRefs.current[index] = node;
                }}
                d={path}
                className="theme-toggle-icon-line theme-toggle-icon-ray"
              />
            ))}
          </svg>
        </span>,
        document.body
      )}
    </>
  );
};
