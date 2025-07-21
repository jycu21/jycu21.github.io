import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export const Header = () => {
  const [time, setTime] = useState(new Date());
  const headerRef = useRef(null);

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kuala_Lumpur",
    });
  };

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-[#F6FDFC]/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 text-[10px] md:text-xs tracking-wider uppercase font-medium">
        <span className="hidden sm:block">Frontend Developer</span>
        <span className="hidden md:block">Currently working @ Simpletruss</span>
        <a href="mailto:hello@example.com" className="hover:underline">
          Email
        </a>
        <span>Kuala Lumpur {formatTime(time)}</span>
      </div>
    </header>
  );
};
