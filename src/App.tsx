import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import cjy from "./assets/cjy.jpg";
import {
  type InfoCardProps,
  type Project,
  type ProjectCardProps,
} from "./interface";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  number,
  bgColor,
  textColor = "text-black",
  children,
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  }, []);

  return (
    <div
      ref={cardRef}
      className={`p-6 md:p-8 ${bgColor} ${textColor} h-full flex flex-col rounded-xl shadow-md transition-all duration-300 hover:scale-[1.01]`}
    >
      <div className="flex items-center justify-between mb-4">
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

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  // const cardRef = useRef(null);

  // useEffect(() => {
  //   gsap.fromTo(
  //     cardRef.current,
  //     { opacity: 0, y: 100 },
  //     {
  //       opacity: 1,
  //       y: 0,
  //       duration: 1,
  //       delay: index * 0.15,
  //       ease: "power3.out",
  //       scrollTrigger: {
  //         trigger: cardRef.current,
  //         start: "top 85%",
  //         toggleActions: "play none none none",
  //       },
  //     }
  //   );
  // }, [index]);

  const isEven = index % 2 === 0;

  return (
    <div
      // ref={cardRef}
      className={`flex flex-col gap-4 group ${
        isEven ? "mb-32 md:mb-48 lg:mb-64" : "mt-32 md:mt-48 lg:mt-64"
      }`}
    >
      {/* Project Visual */}
      <div className="relative w-full overflow-hidden bg-white shadow-lg rounded-xl">
        {/* Background image */}
        <div
          className="w-full h-0 pb-[125%] bg-cover bg-center"
          style={{ backgroundImage: `url(${project.image})` }}
        >
          {/* Optional mockup overlay */}
          {project.mockup && (
            <img
              src={project.mockup}
              alt={`${project.title} mockup`}
              className="absolute top-1/2 left-1/2 w-3/5 md:w-2/5 transform -translate-x-1/2 -translate-y-1/2 shadow-xl rounded-[2rem]"
            />
          )}
        </div>
      </div>

      {/* Project Caption */}
      <div className="text-center">
        <h3 className="text-sm md:text-base font-medium">
          {project.title}
          {" — "}
          <span className="text-gray-500">{project.date}</span>
        </h3>
        <p className="text-xs md:text-sm text-gray-500 italic">{index + 1}/2</p>
      </div>
    </div>
  );
};

const Portfolio = () => {
  const heroRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const headerRef = useRef<HTMLHeadElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [time, setTime] = useState<Date>(new Date());

  // Sample projects data
  const projects: Project[] = [
    {
      title: "YTL Cement MY regional website",
      date: "2023",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1000&fit=crop&crop=center",
      // mockup: "/project1-mockup.png", // mobile overlay image
    },
    {
      title: "YTL DOS Portal",
      date: "2024",
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=1000&fit=crop&crop=center",
    },
  ];

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
    const tl = gsap.timeline({ delay: 0.5 });

    tl.fromTo(
      nameRef.current,
      { opacity: 0, y: 100, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power3.out" }
    ).fromTo(
      subtitleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      "-=0.6"
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Header fade in animation
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    );
  }, []);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kuala_Lumpur",
    });
  };

  return (
    <div className="h-screen bg-[#F6FDFC] font-sans text-[#2D2D2D]">
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
          <span>Kuala Lumpur {formatTime(time)}</span>
        </div>
      </header>

      {/* Main content with dynamic padding-top */}
      <div
        className="h-full overflow-y-auto"
        style={{ paddingTop: `${headerHeight}px` }}
      >
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="h-[calc(60vh-var(--header-height))] flex flex-col items-center justify-center px-8 text-center"
        >
          <h1 ref={nameRef} className="text-[9vw] xl:text-[10vw] font-serif">
            Jun Yu Choo
          </h1>
          <p ref={subtitleRef} className="text-lg text-gray-600">
            frontend developer with an interest for coffee
          </p>
        </section>

        {/* About Section */}
        <div className="border-t border-[#D1D5DB] min-h-[40vh] md:h-[40vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 h-full flex-initial">
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

            <div className="h-80 md:h-full relative rounded-xl overflow-hidden shadow-md bg-gray-200 flex items-center justify-center">
              <img
                src={cjy}
                alt="Jun Yu Choo"
                className="w-full h-full object-cover object-top"
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
        <section className="border-t border-[#D1D5DB] px-8 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-4xl font-serif mb-4">Past work</h2>
              <p className="text-gray-600">
                Projects that I were involved in previously
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-12">
              {projects.map((project, index) => (
                <ProjectCard key={index} project={project} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#2D2D2D] text-white px-8 py-4 text-xs">
          <div className="flex justify-between items-center">
            <span>© 2024 Jun Yu Choo</span>
            <span>Built with React & Tailwind</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Portfolio;
