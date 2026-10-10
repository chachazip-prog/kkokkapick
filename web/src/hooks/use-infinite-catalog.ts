import { useEffect, useRef, useState } from "react";

/** Append stable product keys only after actual scrolling; no more button. */
export function useInfiniteCatalog(
  total: number,
  initial: number,
  signature: string,
) {
  const [amount, setAmount] = useState(initial);
  const sentinel = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);
  useEffect(() => {
    setAmount(initial);
    hasScrolled.current = false;
  }, [initial, signature]);
  useEffect(() => {
    const appendIfVisible = () => {
      const bounds = sentinel.current?.getBoundingClientRect();
      if (
        hasScrolled.current &&
        bounds &&
        bounds.top < innerHeight &&
        bounds.bottom >= 0
      )
        setAmount((value) => Math.min(total, value + initial));
    };
    // A four-row feed can place the sentinel inside the initial viewport.
    // IntersectionObserver will not fire again when the user first scrolls.
    let frame = 0;
    const scroll = () => {
      hasScrolled.current = true;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(appendIfVisible);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          hasScrolled.current &&
          entries.some((entry) => entry.isIntersecting)
        )
          setAmount((value) => Math.min(total, value + initial));
      },
      { rootMargin: "0px" },
    );
    if (sentinel.current) observer.observe(sentinel.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
    };
  }, [initial, total, amount, signature]);
  return { amount, sentinel };
}
