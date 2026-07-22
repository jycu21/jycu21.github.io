import { forwardRef } from "react";

export const SiteFooter = forwardRef<HTMLElement>(function SiteFooter(_, ref) {
  return (
    <footer
      ref={ref}
      className="theme-border min-h-14 border-t border-[#D1D5DB] bg-[#F6FDFC] px-5 py-4 text-sm sm:h-14 sm:px-8 sm:py-0 sm:text-[18px]"
    >
      <div className="flex h-full flex-col justify-center gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span>© 2024 Jun Yu Choo</span>
        <span>Built with React & Tailwind</span>
      </div>
    </footer>
  );
});
