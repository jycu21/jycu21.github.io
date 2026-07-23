import {
  forwardRef,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { ThemeToggle, type Theme } from "./ThemeToggle";

const KUALA_LUMPUR_TIME = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
  timeZone: "Asia/Kuala_Lumpur",
});

const KualaLumpurClock = () => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span data-live-sync="kuala-lumpur-clock">
      Kuala Lumpur {KUALA_LUMPUR_TIME.format(time)}
    </span>
  );
};

interface SiteHeaderProps {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
}

export const SiteHeader = forwardRef<HTMLElement, SiteHeaderProps>(
  function SiteHeader({ theme, setTheme }, ref) {
    return (
      <header
        ref={ref}
        className="fixed left-0 right-0 top-0 z-50 bg-[#F6FDFC]"
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
          <span className="relative justify-self-end whitespace-nowrap pr-10 tabular-nums">
            <KualaLumpurClock />
            <span className="absolute right-0 top-1/2 -translate-y-1/2">
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </span>
          </span>
        </div>
      </header>
    );
  }
);
