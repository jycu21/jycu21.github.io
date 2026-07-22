import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Snap from "lenis/snap";
import "lenis/dist/lenis.css";
import { AboutSection } from "./components/portfolio/AboutSection";
import { ContactSection } from "./components/portfolio/ContactSection";
import { IntroHero } from "./components/portfolio/IntroHero";
import { ProjectsSection } from "./components/portfolio/ProjectsSection";
import { SiteFooter } from "./components/portfolio/SiteFooter";
import { SiteHeader } from "./components/portfolio/SiteHeader";
import { type Theme } from "./components/portfolio/ThemeToggle";

gsap.registerPlugin(ScrollTrigger);

const initialTheme = (): Theme => {
  try {
    return window.localStorage.getItem("portfolio-theme") === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

const Portfolio = () => {
  const headerRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const projectSnapRef = useRef<HTMLSpanElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const measureHeader = (): void => {
      const height = header.getBoundingClientRect().height;
      setHeaderHeight(height);
      document.documentElement.style.setProperty(
        "--header-height",
        `${height}px`
      );
    };

    measureHeader();

    const resizeObserver = new ResizeObserver(measureHeader);
    resizeObserver.observe(header);
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
    document.documentElement.dataset.theme = theme;

    try {
      window.localStorage.setItem("portfolio-theme", theme);
    } catch {
      // The theme still works when storage is unavailable.
    }
  }, [theme]);

  return (
    <div
      data-theme={theme}
      className="site-viewport font-site bg-[#F6FDFC] text-[#2D2D2D]"
    >
      <SiteHeader ref={headerRef} theme={theme} setTheme={setTheme} />

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
          <IntroHero />
          <AboutSection />
          <ProjectsSection ref={projectSnapRef} />
          <ContactSection scrollWrapperRef={scrollWrapperRef} />
          <SiteFooter ref={footerRef} />
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
