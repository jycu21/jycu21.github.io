import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Snap from "lenis/snap";
import "lenis/dist/lenis.css";
import cjy from "./assets/cjy.jpg";
import { type InfoCardProps } from "./interface";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const FULL_NAME = "Jun Yu Choo";
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
type NameCharacter = { character: string; font: FontClass };

const fontForCycle = (
  cycle: number,
  random: () => number = Math.random
): FontClass =>
  FONT_CLASSES[cycle] ??
  FONT_CLASSES[Math.floor(random() * FONT_CLASSES.length)] ??
  FONT_CLASSES[0];

const nameInFont = (font: FontClass): NameCharacter[] =>
  Array.from(FULL_NAME, (character) => ({ character, font }));

if (import.meta.env.DEV) {
  console.assert(
    FONT_CLASSES.every((font, index) => fontForCycle(index) === font) &&
      fontForCycle(FONT_CLASSES.length, () => 0) === FONT_CLASSES[0] &&
      fontForCycle(FONT_CLASSES.length, () => 0.99) === FONT_CLASSES.at(-1),
    "Typewriter should cycle fonts before randomizing them"
  );
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  number,
  bgColor,
  textColor = "text-black",
  children,
}) => {
  return (
    <div
      className={`flex h-full flex-col p-6 md:p-8 ${bgColor} ${textColor}`}
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
  const contactRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const contactCursorRef = useRef<HTMLDivElement>(null);
  const projectSnapRef = useRef<HTMLSpanElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [time, setTime] = useState<Date>(new Date());
  const [selectedProject, setSelectedProject] = useState(0);
  const [displayedName, setDisplayedName] = useState<NameCharacter[]>(() =>
    nameInFont(FONT_CLASSES[0])
  );

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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    let current = nameInFont(FONT_CLASSES[0]);
    let cycle = 1;

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
      current = deleting
        ? current.slice(0, -1)
        : [
            ...current,
            {
              character: FULL_NAME[current.length]!,
              font: fontForCycle(cycle),
            },
          ];
      setDisplayedName(current);

      if (deleting && current.length) {
        const pause = current.at(-1)?.character === " " ? 125 : 0;
        schedule(() => step(true), 75 + pause, 175 + pause);
      } else if (deleting) {
        schedule(() => step(false), 4000);
      } else if (current.length < FULL_NAME.length) {
        const wordPause = current.at(-1)?.character === " " ? 250 : 0;
        const hesitation =
          Math.random() < 0.35 ? 250 + Math.random() * 750 : 0;
        schedule(
          () => step(false),
          70 + wordPause + hesitation,
          210 + wordPause + hesitation
        );
      } else {
        cycle += 1;
        schedule(() => step(true), 4000);
      }
    };

    schedule(() => step(true), 4000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.utils
        .toArray<SVGSVGElement>(".contact-stack-mark")
        .forEach((mark) => {
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
              },
            }
          );
        });
    }, contactRef);

    ScrollTrigger.refresh();
    return () => context.revert();
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

  return (
    <div className="font-site h-screen bg-[#F6FDFC] text-[#2D2D2D]">
      {/* Fixed Header */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-[#F6FDFC]/95 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between px-8 py-6 text-[10px] uppercase text-xs sm:text-xs lg:text-base font-bold">
          <span className="hidden sm:block">Frontend Developer</span>
          <span className="">Racking brains @ Simpletruss</span>
          <a
            href="mailto:hello@example.com"
            className="hidden md:block hover:underline"
          >
            Email
          </a>
          <span className="whitespace-nowrap tabular-nums">
            Kuala Lumpur {formatTime(time)}
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
          className="h-[calc(60vh-var(--header-height))] flex flex-col items-center justify-center px-8 text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <h1
              aria-label={FULL_NAME}
              className="flex h-[1.1em] items-center justify-center text-[9vw] xl:text-[10vw] leading-[1.1] font-serif"
            >
              <span aria-hidden="true">
                {displayedName.map(({ character, font }, index) => (
                  <span key={index} className={font}>
                    {character}
                  </span>
                ))}
                <span className="typewriter-cursor" />
              </span>
            </h1>
            <p className="text-lg text-gray-600">
              frontend developer with an interest for coffee
            </p>
          </div>
        </section>

        {/* About Section */}
        <div className="min-h-[40vh] md:h-[40vh]">
          <div className="grid h-full flex-initial grid-cols-1 divide-y divide-[#17191A] border border-[#17191A] md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="">
              <InfoCard title="About" number="01" bgColor="bg-[#E0FDF5]">
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
              <InfoCard title="Photography" number="02" bgColor="bg-[#FED7AA]">
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
          className="relative z-10 grid min-h-[calc(100vh-var(--header-height))] border-b border-[#17191A] bg-[#F6FDFC] md:grid-cols-2"
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

          <div className="h-[calc(100vh-var(--header-height)-22.4vw-3.5rem)] bg-[#F6FDFC] p-5 md:p-8">
            <div className="relative grid h-full grid-cols-1 gap-16 after:hidden after:bg-[#17191A] after:content-[''] md:grid-cols-2 md:after:absolute md:after:inset-y-0 md:after:left-1/2 md:after:block md:after:w-px md:after:-translate-x-1/2">
              <div className="hidden h-full min-h-0 items-center justify-center md:flex">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label="Animated artwork"
                  className="h-full w-full object-cover"
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
        <footer className="h-14 border-t border-[#D1D5DB] bg-[#F6FDFC] px-8 text-[18px]">
          <div className="flex h-full items-center justify-between">
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
