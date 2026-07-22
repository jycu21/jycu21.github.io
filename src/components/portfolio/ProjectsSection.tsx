import { forwardRef, useState } from "react";
import { ExternalArrow } from "./ExternalArrow";

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

export const ProjectsSection = forwardRef<HTMLSpanElement>(
  function ProjectsSection(_, projectSnapRef) {
    const [selectedProject, setSelectedProject] = useState(0);

    return (
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
    );
  }
);
