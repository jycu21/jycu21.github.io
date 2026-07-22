import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import cjy from "../../assets/cjy.jpg";

interface InfoCardProps {
  title: string;
  number: string;
  bgColor: string;
  textColor?: string;
  children: ReactNode;
}

const InfoCard = ({
  title,
  number,
  bgColor,
  textColor = "text-black",
  children,
}: InfoCardProps) => (
  <div
    className={`theme-accent flex h-full flex-col p-6 md:p-8 ${bgColor} ${textColor}`}
  >
    <div className="theme-border mb-4 flex items-center justify-between border-b border-[#17191A] pb-4">
      <h3 className="flex items-center gap-2 text-xs uppercase tracking-wider md:text-sm">
        <span className="inline-block h-2 w-2 rounded-full bg-current" />
        {title}
      </h3>
      <span className="text-xs md:text-sm">{number}</span>
    </div>
    <div className="flex flex-grow items-center">
      <div className="text-base leading-relaxed lg:text-lg">{children}</div>
    </div>
  </div>
);

export const AboutSection = () => {
  const portraitRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const portrait = portraitRef.current;
    const cursor = cursorRef.current;
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

  return (
    <div className="min-h-[40vh] md:h-[40vh]">
      <div className="theme-border theme-divide grid h-full flex-initial grid-cols-1 divide-y divide-[#17191A] border border-[#17191A] md:grid-cols-3 md:divide-x md:divide-y-0">
        <div>
          <InfoCard
            title="About"
            number="01"
            bgColor="theme-accent-mint bg-[#E0FDF5]"
          >
            <p>
              Frontend developer with a passion for clean code and minimalist
              design. When I'm not crafting digital experiences, you'll find me
              brewing coffee or capturing moments through my camera lens.
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
            className="h-full w-full object-cover object-top"
          />
          <div
            ref={cursorRef}
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
              Street photography, landscape shots, and candid moments. Currently
              still lost in my Korea trip's Lightroom catalog.
            </p>
          </InfoCard>
        </div>
      </div>
    </div>
  );
};
