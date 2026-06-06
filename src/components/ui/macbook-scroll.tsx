"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function MacbookScroll({
  title,
  children,
  className,
}: {
  title: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const element = sectionRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight;
      const nextProgress = Math.min(
        1,
        Math.max(0, (viewport - rect.top) / Math.max(viewport * 0.8, 1)),
      );
      setProgress(nextProgress);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const rotateX = 14 - progress * 13;
  const scale = 0.9 + progress * 0.1;

  return (
    <section ref={sectionRef} className={cn("relative py-8 sm:py-14", className)}>
      <div className="mx-auto mb-10 max-w-2xl text-center text-xl font-medium leading-8 text-[#d0d6e0] sm:text-2xl">
        {title}
      </div>
      <div className="mx-auto max-w-6xl [perspective:1600px]">
        <div
          className="origin-bottom transition-transform duration-150 ease-out motion-reduce:transform-none"
          style={{ transform: `rotateX(${rotateX}deg) scale(${scale})` }}
        >
          <div className="relative rounded-t-[1rem] border border-[#3a3c42] bg-[#151619] p-1.5 shadow-[0_50px_120px_rgb(0_0_0_/_55%)] sm:rounded-t-[1.25rem] sm:p-2">
            <div className="absolute left-1/2 top-1.5 z-10 h-1.5 w-12 -translate-x-1/2 rounded-b-md bg-black sm:w-16" />
            {children}
          </div>
          <div className="relative mx-auto h-3 w-[108%] -translate-x-[3.7%] rounded-b-[70%] border-x border-b border-[#32343a] bg-gradient-to-b from-[#393b41] to-[#111214] shadow-[0_18px_30px_rgb(0_0_0_/_45%)] sm:h-4">
            <div className="absolute left-1/2 top-0 h-1 w-20 -translate-x-1/2 rounded-b-md bg-[#0b0c0d] sm:w-28" />
          </div>
        </div>
      </div>
    </section>
  );
}
