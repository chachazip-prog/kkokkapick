import { useEffect, useLayoutEffect, useRef, useState } from "react";

type ListPosition = { amount: number; scrollY: number };
const rememberedContextLimit = 8;

function remember(
  memory: Map<string, ListPosition>,
  signature: string,
  position: ListPosition,
) {
  memory.delete(signature);
  memory.set(signature, {
    amount: position.amount,
    scrollY: position.scrollY,
  });
  if (memory.size > rememberedContextLimit)
    memory.delete(memory.keys().next().value!);
}

/** Append stable product keys only after actual scrolling; no more button. */
export function useInfiniteCatalog(
  total: number,
  initial: number,
  signature: string,
) {
  const [pagination, setPagination] = useState({ signature, amount: initial });
  // Positions and counts only, scoped to this mounted app. No products,
  // photos, child fields, storage writes or network requests are cached here.
  const memory = useRef(new Map<string, ListPosition>());
  const active = useRef<(ListPosition & { signature: string }) | null>(null);
  const remembered = memory.current.get(signature);
  const quota = Math.max(
    initial,
    pagination.signature === signature
      ? pagination.amount
      : (remembered?.amount ?? initial),
  );
  const amount = Math.min(total, quota);
  const sentinel = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);
  const restoring = useRef(false);
  useLayoutEffect(() => {
    if (active.current?.signature === signature) return;
    if (active.current)
      remember(memory.current, active.current.signature, active.current);
    const position = memory.current.get(signature) || {
      amount: initial,
      scrollY: 0,
    };
    active.current = { signature, ...position };
    remember(memory.current, signature, position);
    setPagination({ signature, amount: position.amount });
    hasScrolled.current = false;
    restoring.current = true;
    window.scrollTo({ top: position.scrollY, behavior: "instant" });
    let nextFrame = 0;
    const frame = requestAnimationFrame(() => {
      nextFrame = requestAnimationFrame(() => {
        restoring.current = false;
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(nextFrame);
      restoring.current = false;
    };
  }, [initial, signature]);
  useLayoutEffect(() => {
    if (active.current?.signature === signature) {
      active.current.amount = quota;
      remember(memory.current, signature, active.current);
    }
  }, [quota, signature]);
  useEffect(() => {
    const savePosition = () => {
      if (!restoring.current && active.current) {
        active.current.scrollY = window.scrollY;
        remember(memory.current, active.current.signature, active.current);
      }
    };
    window.addEventListener("scroll", savePosition, { passive: true });
    return () => window.removeEventListener("scroll", savePosition);
  }, []);
  useEffect(() => {
    const append = () =>
      setPagination((value) => ({
        signature,
        amount: Math.min(
          total,
          (value.signature === signature ? value.amount : amount) + initial,
        ),
      }));
    const appendIfVisible = () => {
      const bounds = sentinel.current?.getBoundingClientRect();
      if (
        !restoring.current &&
        hasScrolled.current &&
        bounds &&
        bounds.top < innerHeight &&
        bounds.bottom >= 0
      )
        append();
    };
    // A four-row feed can place the sentinel inside the initial viewport.
    // IntersectionObserver will not fire again when the user first scrolls.
    let frame = 0;
    const scroll = () => {
      if (restoring.current) return;
      hasScrolled.current = true;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(appendIfVisible);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          !restoring.current &&
          hasScrolled.current &&
          entries.some((entry) => entry.isIntersecting)
        )
          append();
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
