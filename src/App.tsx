import React, { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
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
  | { kind: "coffee" };
type IntroOperation =
  | { kind: "character"; character: string }
  | { kind: "coffee" }
  | { kind: "braces" }
  | { kind: "code"; character: string };
type IntroPhrase = { label: string; operations: IntroOperation[] };
type DisplayedIntro = { label: string; items: IntroItem[] };

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
      items.push(
        { kind: "character", character: "{", font },
        { kind: "character", character: "}", font }
      );
      return;
    }

    const item: IntroItem = {
      kind: "character",
      character: operation.character,
      font,
    };

    if (operation.kind === "code") {
      items.splice(items.length - 1, 0, item);
    } else {
      items.push(item);
    }
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
      <div className="mb-4 flex items-center justify-between border-b border-[#17191A] pb-4">
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
  const themeTransitioningRef = useRef(false);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [time, setTime] = useState<Date>(new Date());
  const [theme, setTheme] = useState<Theme>(initialTheme);
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
    const move = ({ clientX, clientY }: PointerEvent): void => {
      const { left, top } = portrait.getBoundingClientRect();
      moveX(clientX - left);
      moveY(clientY - top);
    };
    const enter = (): void => {
      gsap.to(cursor, { scale: 1, duration: 0.35, ease: "power3.out" });
    };
    const leave = (): void => {
      gsap.to(cursor, { scale: 0, duration: 0.25, ease: "power3.in" });
    };

    gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0 });
    portrait.addEventListener("pointermove", move);
    portrait.addEventListener("pointerenter", enter);
    portrait.addEventListener("pointerleave", leave);

    return () => {
      portrait.removeEventListener("pointermove", move);
      portrait.removeEventListener("pointerenter", enter);
      portrait.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(cursor);
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

    if (
      prefersReducedMotion ||
      typeof document.startViewTransition !== "function"
    ) {
      applyTheme();
      return;
    }

    const root = document.documentElement;

    themeTransitioningRef.current = true;
    root.dataset.themeTransitioning = "true";
    root.style.setProperty("--theme-reveal-x", `${originXPercent}%`);
    root.style.setProperty("--theme-reveal-y", `${originYPercent}%`);

    const transition = document.startViewTransition(applyTheme);

    transition.finished.finally(() => {
      themeTransitioningRef.current = false;
      delete root.dataset.themeTransitioning;
      root.style.removeProperty("--theme-reveal-x");
      root.style.removeProperty("--theme-reveal-y");
    });
  };

  return (
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
            href="mailto:hello@example.com"
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
              <span aria-hidden="true">{theme === "light" ? "☾" : "☼"}</span>
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
            {displayedIntro.items.length > 0 && (
              <span aria-hidden="true" className="block w-full">
                {displayedIntro.items.map((item, index) => {
                  const isClosingBrace =
                    item.kind === "character" && item.character === "}";

                  return (
                    <React.Fragment key={index}>
                      {isClosingBrace && <span className="typewriter-cursor" />}
                      {item.kind === "coffee" ? (
                        <span className="typewriter-coffee">
                          <img src="/coffee.png" alt="" />
                        </span>
                      ) : (
                        <span className={item.font}>{item.character}</span>
                      )}
                    </React.Fragment>
                  );
                })}
                {!displayedIntro.items.some(
                  (item) =>
                    item.kind === "character" && item.character === "}"
                ) && <span className="typewriter-cursor" />}
              </span>
            )}
          </h1>
        </section>

        {/* About Section */}
        <div className="min-h-[40vh] md:h-[40vh]">
          <div className="grid h-full flex-initial grid-cols-1 divide-y divide-[#17191A] border border-[#17191A] md:grid-cols-3 md:divide-x md:divide-y-0">
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
                className="pointer-events-none absolute left-0 top-0 z-10 hidden h-40 w-40 rounded-full bg-white mix-blend-difference will-change-transform md:block"
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
          className="projects-viewport relative z-10 grid border-b border-[#17191A] bg-[#F6FDFC] md:grid-cols-2"
        >
          <span
            ref={projectSnapRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[calc(var(--header-height)*-1)] h-px"
          />
          <div className="relative flex min-h-[55vh] flex-col justify-between p-8 md:min-h-0 md:border-r md:border-[#17191A]">
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
                <li key={project.title} className="border-b border-[#17191A]">
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
            <iframe
              key={PROJECTS[selectedProject].url}
              src={PROJECTS[selectedProject].url}
              title={`${PROJECTS[selectedProject].title} live preview`}
              className="pointer-events-none h-full min-h-[50vh] w-full border-0 bg-white"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <a
              href={PROJECTS[selectedProject].url}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-5 right-5 bg-[#F6FDFC] px-4 py-2 text-sm uppercase"
            >
              Open live site ↗
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
                  ? "sticky top-[var(--header-height)] z-10 border-b border-[#17191A]"
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
            <div className="relative grid min-h-0 w-full flex-1 grid-cols-1 gap-16 after:hidden after:bg-[#17191A] after:content-[''] md:grid-cols-2 md:after:absolute md:after:inset-y-0 md:after:left-1/2 md:after:block md:after:w-px md:after:-translate-x-1/2">
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
                <div className="grid grid-cols-2 border-b border-[#17191A] pb-2 text-[0.65rem] uppercase">
                  <span>Links:</span>
                  <span>Selected places</span>
                </div>
                <ul aria-label="Selected links">
                  {["LinkedIn", "GitHub", "Snippets", "Unsplash", "Resources"].map(
                    (label) => (
                      <li
                        key={label}
                        className="group relative overflow-hidden border-b border-[#17191A] text-[clamp(1.5rem,2.35vw,3rem)] font-semibold uppercase leading-none"
                      >
                        <span className="flex items-center justify-between py-1">
                          {label}
                          <span aria-hidden="true" className="mr-[6px] text-base font-normal">
                            ↗
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 flex items-center justify-between bg-[#17191A] py-1 text-[#F6FDFC] [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:[clip-path:inset(0_0_0_0)]"
                        >
                          {label}
                          <span className="mr-[6px] text-base font-normal">
                            ↗
                          </span>
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
          className="min-h-14 border-t border-[#D1D5DB] bg-[#F6FDFC] px-5 py-4 text-sm sm:h-14 sm:px-8 sm:py-0 sm:text-[18px]"
        >
          <div className="flex h-full flex-col justify-center gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2024 Jun Yu Choo</span>
            <span>Built with React & Tailwind</span>
          </div>
        </footer>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
