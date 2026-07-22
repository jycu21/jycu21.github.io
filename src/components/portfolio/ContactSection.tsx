import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ExternalArrow } from "./ExternalArrow";

const CONTACT_STACK_HEIGHTS = [3, 4.17, 5.33, 6.5, 7.67, 8.83, 22.4];
const CONTACT_TITLE = "Let's talk";

interface ContactSectionProps {
  scrollWrapperRef: RefObject<HTMLDivElement | null>;
}

export const ContactSection = ({ scrollWrapperRef }: ContactSectionProps) => {
  const contactRef = useRef<HTMLElement>(null);

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
        let fadeStart = 0;
        let fadeRange = 1;

        const measureFadeRange = (): void => {
          const panelHeight = mark.parentElement?.clientHeight ?? 0;
          const markHeight = mark.clientHeight;
          if (!panelHeight || !markHeight) return;

          const fadeEnd = Math.min(panelHeight / markHeight, 1);
          fadeStart = fadeEnd * 0.55;
          fadeRange = Math.max(fadeEnd - fadeStart, Number.EPSILON);
        };
        const updateVisibility = (progress: number): void => {
          const fadeProgress = Math.max(
            0,
            Math.min(1, (progress - fadeStart) / fadeRange)
          );
          const opacity = 1 - fadeProgress;

          mark.style.opacity = `${opacity}`;
          mark.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
        };

        measureFadeRange();
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
              onRefresh: ({ progress }) => {
                measureFadeRange();
                updateVisibility(progress);
              },
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
  }, [scrollWrapperRef]);

  return (
    <section ref={contactRef} id="contact">
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
        <div className="contact-content-grid theme-divider relative grid min-h-0 w-full flex-1 grid-cols-1 gap-16 after:hidden after:bg-[#17191A] after:content-[''] md:grid-cols-2 md:after:absolute md:after:inset-y-0 md:after:left-1/2 md:after:block md:after:w-px md:after:-translate-x-1/2">
          <div className="contact-media-slot">
            <video
              autoPlay
              loop
              muted
              playsInline
              aria-label="Animated artwork"
              className="theme-natural-media"
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
  );
};
