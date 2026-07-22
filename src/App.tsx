import React, { useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Snap from "lenis/snap";
import "lenis/dist/lenis.css";
import cjy from "./assets/cjy.jpg";
import { type InfoCardProps } from "./interface";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const FONT_CLASSES = [
  "font-serif",
  "font-sans",
  "font-instrument-serif",
  "font-source-serif",
  "font-helvetica-italic",
] as const;
const CONTACT_STACK_HEIGHTS = [3, 4.17, 5.33, 6.5, 7.67, 8.83, 22.4];
const CONTACT_TITLE = "Let's talk";
const PROJECTS = [
  {
    title: "YTL Cement MY regional website",
    year: "2023",
    url: "https://ytlcement.my/",
  },
  {
    title: "YTL DOS Portal",
    year: "2024",
    url: "https://dos.ytlcement.com/",
  },
] as const;

type FontClass = (typeof FONT_CLASSES)[number];
type Theme = "light" | "dark";
type IntroItem =
  | { kind: "character"; character: string; font: FontClass }
  | { kind: "code"; characters: string; font: FontClass }
  | { kind: "coffee" };
type IntroOperation =
  | { kind: "character"; character: string }
  | { kind: "coffee" }
  | { kind: "braces" }
  | { kind: "code"; character: string };
type IntroPhrase = { label: string; operations: IntroOperation[] };
type DisplayedIntro = { label: string; items: IntroItem[] };

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

const characterOperations = (text: string): IntroOperation[] =>
  Array.from(text, (character) => ({ kind: "character", character }));

const INTRO_PHRASES: IntroPhrase[] = [
  {
    label: "Espresso coffee yourself in {CODE}",
    operations: [
      ...characterOperations("Espresso "),
      { kind: "coffee" },
      ...characterOperations(" yourself in "),
      { kind: "braces" },
      ...Array.from(
        "CODE",
        (character) => ({ kind: "code", character } as const)
      ),
    ],
  },
  {
    label: "Coffee. Code. Create.",
    operations: [
      { kind: "coffee" },
      ...characterOperations(". Code. Create."),
    ],
  },
];

const renderIntro = (
  phrase: IntroPhrase,
  progress: number,
  font: FontClass
): IntroItem[] => {
  const items: IntroItem[] = [];

  phrase.operations.slice(0, progress).forEach((operation) => {
    if (operation.kind === "coffee") {
      items.push({ kind: "coffee" });
      return;
    }

    if (operation.kind === "braces") {
      items.push({ kind: "code", characters: "", font });
      return;
    }

    if (operation.kind === "code") {
      const codeItem = items.find(
        (item): item is Extract<IntroItem, { kind: "code" }> =>
          item.kind === "code"
      );

      if (codeItem) codeItem.characters += operation.character;
      return;
    }

    const item: IntroItem = {
      kind: "character",
      character: operation.character,
      font,
    };

    items.push(item);
  });

  return items;
};

const randomFontAfter = (current: FontClass): FontClass => {
  const choices = FONT_CLASSES.filter((font) => font !== current);
  return choices[Math.floor(Math.random() * choices.length)] ?? FONT_CLASSES[0];
};

const isSpaceOperation = (operation: IntroOperation | undefined): boolean =>
  operation?.kind === "character" && operation.character === " ";

const initialTheme = (): Theme => {
  try {
    return window.localStorage.getItem("portfolio-theme") === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

const ExternalArrow = ({ className = "" }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    fill="none"
    className={`h-[0.9em] w-[0.9em] shrink-0 ${className}`}
  >
    <path
      d="M4 12 12 4M6 4h6v6"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  </svg>
);

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  number,
  bgColor,
  textColor = "text-black",
  children,
}) => {
  return (
    <div
      className={`theme-accent flex h-full flex-col p-6 md:p-8 ${bgColor} ${textColor}`}
    >
      <div className="theme-border mb-4 flex items-center justify-between border-b border-[#17191A] pb-4">
        <h3 className="text-xs md:text-sm uppercase tracking-wider flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-current rounded-full"></span>
          {title}
        </h3>
        <span className="text-xs md:text-sm">{number}</span>
      </div>
      <div className="flex-grow flex items-center">
        <div className="text-base lg:text-lg leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

const Portfolio = () => {
  const headerRef = useRef<HTMLHeadElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const contactCursorRef = useRef<HTMLDivElement>(null);
  const projectSnapRef = useRef<HTMLSpanElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const themeIconShellRef = useRef<HTMLSpanElement>(null);
  const themeIconRef = useRef<SVGSVGElement>(null);
  const themeIconCoreRef = useRef<SVGPathElement>(null);
  const themeIconRayRefs = useRef<Array<SVGPathElement | null>>([]);
  const themeIconOverlayRef = useRef<HTMLSpanElement>(null);
  const themeIconOverlaySvgRef = useRef<SVGSVGElement>(null);
  const themeIconOverlayCoreRef = useRef<SVGPathElement>(null);
  const themeIconOverlayRayRefs = useRef<Array<SVGPathElement | null>>([]);
  const themeTransitioningRef = useRef(false);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [time, setTime] = useState<Date>(new Date());
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const initialIconThemeRef = useRef(theme);
  const [selectedProject, setSelectedProject] = useState(0);
  const [displayedIntro, setDisplayedIntro] = useState<DisplayedIntro>(() => ({
    label: INTRO_PHRASES[0].label,
    items: renderIntro(
      INTRO_PHRASES[0],
      INTRO_PHRASES[0].operations.length,
      FONT_CLASSES[0]
    ),
  }));

  // Dynamically measure header height
  useEffect(() => {
    const measureHeader = (): void => {
      if (headerRef.current) {
        const height = headerRef.current.getBoundingClientRect().height;
        setHeaderHeight(height);
        // Also update CSS custom property for use in CSS if needed
        document.documentElement.style.setProperty(
          "--header-height",
          `${height}px`
        );
      }
    };

    // Measure on mount
    measureHeader();

    // Re-measure on resize
    const resizeObserver = new ResizeObserver(measureHeader);
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    // Also listen to window resize as a fallback
    window.addEventListener("resize", measureHeader);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureHeader);
    };
  }, []);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const measureFooter = (): void => {
      const height = footer.getBoundingClientRect().height;
      document.documentElement.style.setProperty(
        "--footer-height",
        `${height}px`
      );
    };

    measureFooter();

    const resizeObserver = new ResizeObserver(measureFooter);
    resizeObserver.observe(footer);
    window.addEventListener("resize", measureFooter);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureFooter);
      document.documentElement.style.removeProperty("--footer-height");
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!scrollWrapperRef.current || !scrollContentRef.current) return;

    const lenis = new Lenis({
      wrapper: scrollWrapperRef.current,
      content: scrollContentRef.current,
      duration: 1.1,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 2,
      overscroll: false,
    });
    const snap = new Snap(lenis, {
      debounce: 150,
      distanceThreshold: "10%",
    });
    const removeProjectSnap = projectSnapRef.current
      ? snap.addElement(projectSnapRef.current)
      : () => undefined;
    const update = (time: number): void => lenis.raf(time * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      removeProjectSnap();
      snap.destroy();
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    try {
      window.localStorage.setItem("portfolio-theme", theme);
    } catch {
      // The theme still works when storage is unavailable.
    }
  }, [theme]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    let phraseIndex = 0;
    let progress = INTRO_PHRASES[0].operations.length;
    let font: FontClass = FONT_CLASSES[0];

    const schedule = (
      callback: () => void,
      min: number,
      max: number = min
    ): void => {
      timer = window.setTimeout(
        callback,
        min + Math.random() * (max - min)
      );
    };

    const step = (deleting: boolean): void => {
      const phrase = INTRO_PHRASES[phraseIndex];
      progress += deleting ? -1 : 1;
      setDisplayedIntro({
        label: phrase.label,
        items: renderIntro(phrase, progress, font),
      });

      if (deleting && progress > 0) {
        const pause = isSpaceOperation(phrase.operations[progress - 1])
          ? 70
          : 0;
        schedule(() => step(true), 35 + pause, 90 + pause);
      } else if (deleting) {
        phraseIndex = (phraseIndex + 1) % INTRO_PHRASES.length;
        font = randomFontAfter(font);
        setDisplayedIntro({
          label: INTRO_PHRASES[phraseIndex].label,
          items: [],
        });
        schedule(() => step(false), 1800);
      } else if (progress < phrase.operations.length) {
        const wordPause = isSpaceOperation(phrase.operations[progress - 1])
          ? 100
          : 0;
        const hesitation =
          Math.random() < 0.15 ? 100 + Math.random() * 300 : 0;
        schedule(
          () => step(false),
          35 + wordPause + hesitation,
          90 + wordPause + hesitation
        );
      } else {
        schedule(() => step(true), 4000);
      }
    };

    schedule(() => step(true), 4000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const marks = contactRef.current
      ? Array.from(
          contactRef.current.querySelectorAll<SVGSVGElement>(
            ".contact-stack-mark"
          )
        )
      : [];
    const context = gsap.context(() => {
      marks.forEach((mark) => {
        const updateVisibility = (progress: number): void => {
          const panelHeight = mark.parentElement?.clientHeight ?? 0;
          const markHeight = mark.clientHeight;

          if (!panelHeight || !markHeight) return;

          // Fade the word before its final clipped pixels become visible.
          const fadeEnd = Math.min(panelHeight / markHeight, 1);
          const fadeStart = fadeEnd * 0.55;
          const fadeProgress = Math.max(
            0,
            Math.min(1, (progress - fadeStart) / (fadeEnd - fadeStart))
          );
          const opacity = 1 - fadeProgress;

          mark.style.opacity = `${opacity}`;
          mark.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
        };

        gsap.fromTo(
          mark,
          { yPercent: 0 },
          {
            yPercent: 100,
            ease: "none",
            scrollTrigger: {
              trigger: mark.parentElement,
              scroller: scrollWrapperRef.current,
              start: "top center",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
              onUpdate: ({ progress }) => updateVisibility(progress),
              onRefresh: ({ progress }) => updateVisibility(progress),
            },
          }
        );
      });
    }, contactRef);

    ScrollTrigger.refresh();
    return () => {
      context.revert();
      marks.forEach((mark) => {
        mark.style.removeProperty("opacity");
        mark.style.removeProperty("visibility");
      });
    };
  }, []);

  useEffect(() => {
    const portrait = portraitRef.current;
    const cursor = contactCursorRef.current;
    if (!portrait || !cursor) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const moveX = gsap.quickTo(cursor, "x", {
      duration: 0.45,
      ease: "power3.out",
    });
    const moveY = gsap.quickTo(cursor, "y", {
      duration: 0.45,
      ease: "power3.out",
    });
    let isPointerInside = false;
    const positionAtPointer = ({ clientX, clientY }: PointerEvent): void => {
      const { left, top } = portrait.getBoundingClientRect();
      gsap.set(cursor, { x: clientX - left, y: clientY - top });
    };
    const move = ({ clientX, clientY }: PointerEvent): void => {
      const { left, top } = portrait.getBoundingClientRect();
      moveX(clientX - left);
      moveY(clientY - top);
    };
    const enter = (event: PointerEvent): void => {
      isPointerInside = true;
      gsap.killTweensOf(cursor, "autoAlpha,scale");
      positionAtPointer(event);
      gsap.to(cursor, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.35,
        ease: "power3.out",
        overwrite: true,
      });
    };
    const leave = (): void => {
      isPointerInside = false;
      gsap.killTweensOf(cursor, "autoAlpha,scale");
      gsap.to(cursor, {
        autoAlpha: 0,
        scale: 0,
        duration: 0.35,
        ease: "power3.in",
        overwrite: true,
      });
    };
    const detectFastExit = ({ clientX, clientY }: PointerEvent): void => {
      if (!isPointerInside) return;

      const { left, right, top, bottom } = portrait.getBoundingClientRect();
      if (
        clientX < left ||
        clientX > right ||
        clientY < top ||
        clientY > bottom
      ) {
        leave();
      }
    };

    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      autoAlpha: 0,
      scale: 0,
    });
    portrait.addEventListener("pointermove", move);
    portrait.addEventListener("pointerenter", enter);
    portrait.addEventListener("pointerleave", leave);
    portrait.addEventListener("pointercancel", leave);
    window.addEventListener("pointermove", detectFastExit, { passive: true });
    window.addEventListener("blur", leave);

    return () => {
      portrait.removeEventListener("pointermove", move);
      portrait.removeEventListener("pointerenter", enter);
      portrait.removeEventListener("pointerleave", leave);
      portrait.removeEventListener("pointercancel", leave);
      window.removeEventListener("pointermove", detectFastExit);
      window.removeEventListener("blur", leave);
      gsap.killTweensOf(cursor);
      gsap.set(cursor, { autoAlpha: 0, scale: 0 });
    };
  }, []);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kuala_Lumpur",
    });
  };

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>): void => {
    if (themeTransitioningRef.current) return;

    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    const themeIcon = themeIconRef.current;
    const themeIconCore = themeIconCoreRef.current;
    const themeIconRays = themeIconRayRefs.current.filter(
      (ray): ray is SVGPathElement => ray !== null
    );
    const themeIconOverlay = themeIconOverlayRef.current;
    const themeIconOverlaySvg = themeIconOverlaySvgRef.current;
    const themeIconOverlayCore = themeIconOverlayCoreRef.current;
    const themeIconOverlayRays = themeIconOverlayRayRefs.current.filter(
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
    const applyTheme = (): void => {
      document.documentElement.dataset.theme = nextTheme;
      flushSync(() => setTheme(nextTheme));
    };
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
      icon: SVGSVGElement,
      core: SVGPathElement,
      rays: SVGPathElement[]
    ): void => {
      core.setAttribute("d", targetCorePath);
      rays.forEach((ray, index) => {
        ray.setAttribute("d", targetRayPaths[index]);
      });
      gsap.set(core, { strokeWidth: targetCoreStrokeWidth });
      gsap.set(icon, { rotation: targetRotation, y: targetY });
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

      const transition = document.startViewTransition(applyTheme);

      return transition.finished
        .then(() => undefined)
        .finally(() => {
          delete root.dataset.themeTransitioning;
          root.style.removeProperty("--theme-reveal-x");
          root.style.removeProperty("--theme-reveal-y");
        });
    };

    themeTransitioningRef.current = true;

    let morphIconElement = themeIcon;
    let morphIconCore = themeIconCore;
    let morphIconRays = themeIconRays;
    let overlayIsOpen = false;

    if (
      themeIconOverlay &&
      themeIconOverlaySvg &&
      themeIconOverlayCore &&
      themeIconOverlayRays.length === SUN_RAY_PATHS.length &&
      themeIconShellRef.current &&
      typeof themeIconOverlay.showPopover === "function"
    ) {
      const shellBounds = themeIconShellRef.current.getBoundingClientRect();

      themeIconOverlay.style.left = `${shellBounds.left}px`;
      themeIconOverlay.style.top = `${shellBounds.top}px`;
      themeIconOverlay.style.color =
        nextTheme === "dark" ? "#d2d2d2" : "#2d2d2d";

      try {
        themeIconOverlay.showPopover();
        overlayIsOpen = true;
        morphIconElement = themeIconOverlaySvg;
        morphIconCore = themeIconOverlayCore;
        morphIconRays = themeIconOverlayRays;
      } catch {
        // The in-place SVG remains the fallback when popovers are unavailable.
      }
    }

    if (
      overlayIsOpen &&
      themeIcon &&
      themeIconCore &&
      themeIconRays.length === SUN_RAY_PATHS.length
    ) {
      updateIconGeometry(themeIcon, themeIconCore, themeIconRays);
    }

    const morphIcon = (): Promise<void> => {
      if (
        !morphIconElement ||
        !morphIconCore ||
        morphIconRays.length !== SUN_RAY_PATHS.length
      ) {
        return Promise.resolve();
      }

      gsap.killTweensOf([
        morphIconElement,
        morphIconCore,
        ...morphIconRays,
      ]);

      if (prefersReducedMotion) {
        updateIconGeometry(
          morphIconElement,
          morphIconCore,
          morphIconRays
        );
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const timeline = gsap.timeline({ onComplete: resolve });

        if (nextTheme === "dark") {
          timeline
            .to(
              morphIconRays,
              {
                attr: {
                  d: (index: number) => targetRayPaths[index],
                },
                duration: 0.18,
                ease: "power2.in",
                stagger: { each: 0.004, from: "end" },
              },
              0
            )
            .to(
              morphIconCore,
              {
                attr: { d: targetCorePath },
                strokeWidth: targetCoreStrokeWidth,
                duration: 0.32,
                ease: "power2.inOut",
              },
              0.16
            )
            .to(
              morphIconElement,
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
              morphIconCore,
              {
                attr: { d: targetCorePath },
                strokeWidth: targetCoreStrokeWidth,
                duration: 0.3,
                ease: "power2.inOut",
              },
              0
            )
            .to(
              morphIconElement,
              {
                rotation: targetRotation,
                y: targetY,
                duration: 0.3,
                ease: "power2.inOut",
              },
              0
            )
            .to(
              morphIconRays,
              {
                attr: {
                  d: (index: number) => targetRayPaths[index],
                },
                duration: 0.22,
                ease: "power2.out",
                stagger: { each: 0.004, from: "start" },
              },
              0.26
            );
        }
      });
    };

    const iconMorph = morphIcon();
    const themeReveal = revealTheme();

    void Promise.allSettled([iconMorph, themeReveal]).then(() => {
      if (
        overlayIsOpen &&
        themeIconOverlay?.matches(":popover-open")
      ) {
        themeIconOverlay.hidePopover();
      }
      themeTransitioningRef.current = false;
    });
  };

  return (
    <>
    <div
      data-theme={theme}
      className="site-viewport font-site bg-[#F6FDFC] text-[#2D2D2D]"
    >
      {/* Fixed Header */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-[#F6FDFC]"
      >
        <div className="font-header-mono grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-5 text-[9px] uppercase leading-none tracking-[0.08em] sm:px-8 sm:py-6 sm:text-xs lg:text-base">
          <span>Frontend Developer</span>
          <a
            href="mailto:jy99.my@gmail.com"
            className="justify-self-end hover:underline"
          >
            Find me
          </a>
          <span>Racking brains @ Simpletruss</span>
          <span className="flex items-center justify-self-end gap-2 whitespace-nowrap tabular-nums">
            <span>Kuala Lumpur {formatTime(time)}</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              <span
                ref={themeIconShellRef}
                className="theme-toggle-icon-shell"
                aria-hidden="true"
              >
                <svg
                  ref={themeIconRef}
                  className="theme-toggle-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  focusable="false"
                >
                  <path
                    ref={themeIconCoreRef}
                    d={
                      initialIconThemeRef.current === "light"
                        ? SUN_CORE_PATH
                        : MOON_CORE_PATH
                    }
                    className="theme-toggle-icon-line theme-toggle-icon-core"
                    style={{
                      strokeWidth:
                        initialIconThemeRef.current === "light"
                          ? SUN_CORE_STROKE_WIDTH
                          : MOON_CORE_STROKE_WIDTH,
                    }}
                  />
                  {(initialIconThemeRef.current === "light"
                    ? SUN_RAY_PATHS
                    : MOON_RAY_PATHS
                  ).map((path, index) => (
                    <path
                      key={index}
                      ref={(node) => {
                        themeIconRayRefs.current[index] = node;
                      }}
                      d={path}
                      className="theme-toggle-icon-line theme-toggle-icon-ray"
                    />
                  ))}
                </svg>
              </span>
            </button>
          </span>
        </div>
      </header>

      {/* Main content with dynamic padding-top */}
      <div
        ref={scrollWrapperRef}
        data-scroll-wrapper
        className="h-full overflow-x-hidden overflow-y-auto overscroll-y-none"
      >
        <div
          ref={scrollContentRef}
          data-scroller
          style={{ paddingTop: `${headerHeight}px` }}
        >
        {/* Hero Section */}
        <section
          className="hero-viewport flex bg-[#F6FDFC] px-5 text-center sm:px-8"
        >
          <h1
            aria-label={displayedIntro.label}
            className="typewriter-line flex h-full w-full items-center text-[clamp(3rem,8vw,9rem)] font-normal leading-[0.92] tracking-[-0.055em]"
          >
            <span aria-hidden="true" className="block w-full">
              {displayedIntro.items.map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    {item.kind === "coffee" ? (
                      <span className="typewriter-coffee">
                        <img src="/coffee.png" alt="" />
                      </span>
                    ) : item.kind === "code" ? (
                      <span className="inline-block whitespace-nowrap">
                        <span className={item.font}>{`{${item.characters}`}</span>
                        <span className="typewriter-cursor" />
                        <span className={item.font}>{"}"}</span>
                      </span>
                    ) : (
                      <span className={item.font}>{item.character}</span>
                    )}
                  </React.Fragment>
                );
              })}
              {!displayedIntro.items.some((item) => item.kind === "code") && (
                <span className="typewriter-cursor" />
              )}
            </span>
          </h1>
        </section>

        {/* About Section */}
        <div className="min-h-[40vh] md:h-[40vh]">
          <div className="theme-border theme-divide grid h-full flex-initial grid-cols-1 divide-y divide-[#17191A] border border-[#17191A] md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="">
              <InfoCard
                title="About"
                number="01"
                bgColor="theme-accent-mint bg-[#E0FDF5]"
              >
                <p>
                  Frontend developer with a passion for clean code and
                  minimalist design. When I'm not crafting digital experiences,
                  you'll find me brewing coffee or capturing moments through my
                  camera lens.
                </p>
              </InfoCard>
            </div>

            <div
              ref={portraitRef}
              className="portrait-cursor-area relative flex h-80 items-center justify-center overflow-hidden bg-gray-200 md:h-full"
            >
              <img
                src={cjy}
                alt="Jun Yu Choo"
                className="w-full h-full object-cover object-top"
              />
              <div
                ref={contactCursorRef}
                aria-hidden="true"
                className="pointer-events-none invisible absolute left-0 top-0 z-10 hidden h-40 w-40 scale-0 rounded-full bg-white opacity-0 mix-blend-difference will-change-transform md:block"
              />
            </div>

            <div className="h-full">
              <InfoCard
                title="Photography"
                number="02"
                bgColor="theme-accent-orange bg-[#FED7AA]"
              >
                <p>
                  Street photography, landscape shots, and candid moments.
                  Currently still lost in my Korea trip's Lightroom catalog.
                </p>
              </InfoCard>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <section
          aria-labelledby="projects-heading"
          className="theme-border projects-viewport relative z-10 grid border-b border-[#17191A] bg-[#F6FDFC] md:grid-cols-2"
        >
          <span
            ref={projectSnapRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[calc(var(--header-height)*-1)] h-px"
          />
          <div className="theme-border relative flex min-h-[55vh] flex-col justify-between p-8 md:min-h-0 md:border-r md:border-[#17191A]">
            <div>
              <h2
                id="projects-heading"
                className="text-[clamp(2rem,3vw,4rem)] uppercase leading-none"
              >
                Projects I've worked on
              </h2>
              <p className="mt-5 text-sm text-gray-500">
                Selected websites and platforms
              </p>
            </div>

            <ol className="md:absolute md:inset-x-8 md:top-1/2">
              {PROJECTS.map((project, index) => (
                <li
                  key={project.title}
                  className="theme-border border-b border-[#17191A]"
                >
                  <button
                    type="button"
                    aria-pressed={selectedProject === index}
                    onClick={() => setSelectedProject(index)}
                    onFocus={() => setSelectedProject(index)}
                    onPointerEnter={() => setSelectedProject(index)}
                    className={`grid w-full grid-cols-[2rem_1fr_auto] items-center gap-2 py-4 text-left text-sm uppercase transition-colors ${
                      selectedProject === index
                        ? "text-[#17191A]"
                        : "text-gray-400 hover:text-[#17191A]"
                    }`}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>{project.title}</span>
                    <span className="flex items-center gap-8">
                      <span>{project.year}</span>
                      <span aria-hidden="true">→</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative min-h-[50vh] overflow-hidden bg-[#E5E7EB] md:min-h-0">
            <a
              href={PROJECTS[selectedProject].url}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-5 right-5 flex items-center gap-2 bg-[#F6FDFC] px-4 py-2 text-sm uppercase"
            >
              Open live site <ExternalArrow />
            </a>
          </div>
        </section>

        {/* Contact Section */}
        <section
          ref={contactRef}
          id="contact"
        >
          <h2 className="sr-only">{CONTACT_TITLE}</h2>

          <div aria-hidden="true" className="h-[20vh] bg-[#F6FDFC]" />
          {CONTACT_STACK_HEIGHTS.map((height, index) => (
            <div
              key={height}
              aria-hidden="true"
              className={`contact-stack-panel overflow-hidden bg-[#F6FDFC] px-8 ${
                index === CONTACT_STACK_HEIGHTS.length - 1
                  ? "theme-border sticky top-[var(--header-height)] z-10 border-b border-[#17191A]"
                  : ""
              }`}
              style={{ height: `${height}vw` }}
            >
              <svg
                viewBox="0 0 1000 300"
                preserveAspectRatio="none"
                className={`h-auto w-full select-none text-[#17191B] ${
                  index < CONTACT_STACK_HEIGHTS.length - 1
                    ? "contact-stack-mark"
                    : ""
                }`}
              >
                <text
                  x="15"
                  y="200"
                  fill="currentColor"
                  fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
                  fontSize="270"
                  fontStyle="italic"
                  fontWeight="400"
                  textLength="970"
                  lengthAdjust="spacing"
                >
                  {CONTACT_TITLE}
                </text>
              </svg>
            </div>
          ))}

          <div className="contact-content flex bg-[#F6FDFC] p-5 md:p-8">
            <div className="theme-divider relative grid min-h-0 w-full flex-1 grid-cols-1 gap-16 after:hidden after:bg-[#17191A] after:content-[''] md:grid-cols-2 md:after:absolute md:after:inset-y-0 md:after:left-1/2 md:after:block md:after:w-px md:after:-translate-x-1/2">
              <div className="hidden h-full min-h-0 items-center justify-center md:flex">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label="Animated artwork"
                  className="theme-natural-media h-full w-full object-cover"
                >
                  <source src="/TDMovieOut.0.mp4" type="video/mp4" />
                </video>
              </div>

              <div className="self-start">
                <div className="theme-border grid grid-cols-2 border-b border-[#17191A] pb-2 text-[0.65rem] uppercase">
                  <span>Links:</span>
                  <span>Selected places</span>
                </div>
                <ul aria-label="Selected links">
                  {["LinkedIn", "GitHub", "Snippets", "Unsplash", "Resources"].map(
                    (label) => (
                      <li
                        key={label}
                        className="theme-border group relative overflow-hidden border-b border-[#17191A] text-[clamp(1.5rem,2.35vw,3rem)] font-semibold uppercase leading-none"
                      >
                        <span className="flex items-center justify-between py-1">
                          {label}
                          <ExternalArrow className="mr-[6px] text-base" />
                        </span>
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 flex items-center justify-between bg-[#17191A] py-1 text-[#F6FDFC] [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:[clip-path:inset(0_0_0_0)]"
                        >
                          {label}
                          <ExternalArrow className="mr-[6px] text-base" />
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          ref={footerRef}
          className="theme-border min-h-14 border-t border-[#D1D5DB] bg-[#F6FDFC] px-5 py-4 text-sm sm:h-14 sm:px-8 sm:py-0 sm:text-[18px]"
        >
          <div className="flex h-full flex-col justify-center gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2024 Jun Yu Choo</span>
            <span>Built with React & Tailwind</span>
          </div>
        </footer>
        </div>
      </div>
    </div>
      {createPortal(
        <span
          ref={themeIconOverlayRef}
          className="theme-icon-morph-overlay"
          popover="manual"
          aria-hidden="true"
        >
          <svg
            ref={themeIconOverlaySvgRef}
            className="theme-toggle-icon"
            viewBox="0 0 24 24"
            fill="none"
            focusable="false"
          >
            <path
              ref={themeIconOverlayCoreRef}
              d={
                initialIconThemeRef.current === "light"
                  ? SUN_CORE_PATH
                  : MOON_CORE_PATH
              }
              className="theme-toggle-icon-line theme-toggle-icon-core"
              style={{
                strokeWidth:
                  initialIconThemeRef.current === "light"
                    ? SUN_CORE_STROKE_WIDTH
                    : MOON_CORE_STROKE_WIDTH,
              }}
            />
            {(initialIconThemeRef.current === "light"
              ? SUN_RAY_PATHS
              : MOON_RAY_PATHS
            ).map((path, index) => (
              <path
                key={index}
                ref={(node) => {
                  themeIconOverlayRayRefs.current[index] = node;
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

export default Portfolio;
