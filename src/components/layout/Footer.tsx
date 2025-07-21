import { useRef } from "react";
import { gsap } from "gsap";

export const Footer = () => {
  const footerRef = useRef(null);

  gsap.fromTo(
    footerRef.current,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    }
  );
  return (
    <footer className="border-t border-[#D1D5DB] bg-[#2D2D2D] text-white p-8 md:p-16 text-center">
      <h2 className="text-[12vw] md:text-[8vw] leading-[0.9] mb-6 md:mb-8">
        Let's Talk
      </h2>
      <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-base md:text-lg">
        <a href="mailto:hello@example.com" className="hover:underline">
          Email
        </a>
        <a href="https://linkedin.com" className="hover:underline">
          LinkedIn
        </a>
        <a href="https://github.com" className="hover:underline">
          GitHub
        </a>
        <a href="https://instagram.com" className="hover:underline">
          Instagram
        </a>
      </div>
      <p className="text-xs text-gray-400 mt-6">
        Made with ☕ & React in Kuala Lumpur
      </p>
      <p className="text-sm italic text-gray-500">© 2025 Jun Yu Choo</p>
    </footer>
  );
};
