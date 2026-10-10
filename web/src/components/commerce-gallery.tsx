import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useKkokkapick } from "./catalog-provider";
import type { ClientProduct } from "@/domain";

export function OriginalPhoto({
  url,
  name,
  generation,
  loading = "lazy",
}: {
  url: string;
  name: string;
  generation: number;
  loading?: "eager" | "lazy";
}) {
  const { recoverPhoto } = useKkokkapick();
  const [status, setStatus] = useState<
    "loading" | "ready" | "recovering" | "offline" | "unavailable"
  >("loading");
  const [attempt, setAttempt] = useState(0);
  const active = useRef(true);
  const pending = useRef(false);
  const reloaded = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => {
    if (status !== "offline") return;
    const online = () => {
      reloaded.current = false;
      setAttempt((value) => value + 1);
      setStatus("loading");
    };
    window.addEventListener("online", online, { once: true });
    return () => window.removeEventListener("online", online);
  }, [status]);
  const recover = async () => {
    if (pending.current || status === "offline" || status === "unavailable")
      return;
    pending.current = true;
    setStatus("recovering");
    const result = await recoverPhoto(url, generation, reloaded.current);
    pending.current = false;
    if (!active.current) return;
    if (result === "stale") return;
    if (result === "offline") setStatus("offline");
    else if (result === "available") {
      reloaded.current = true;
      setAttempt((value) => value + 1);
      setStatus("loading");
    } else setStatus("unavailable");
  };
  return (
    <>
      {status === "unavailable" ? (
        <p className="photo-state" role="status">
          사진 연결을 확인해 주세요.
        </p>
      ) : (
        <img
          key={attempt}
          src={url}
          alt={name}
          loading={loading}
          decoding="async"
          onLoad={() => setStatus("ready")}
          onError={() => void recover()}
          style={{
            visibility:
              status === "recovering" || status === "offline"
                ? "hidden"
                : undefined,
          }}
        />
      )}
      {status === "recovering" ? (
        <p className="photo-state" role="status">
          원본 사진을 다시 확인하고 있어요.
        </p>
      ) : null}
      {status === "offline" ? (
        <p className="photo-state" role="status">
          인터넷 연결 후 사진을 다시 확인해요.
        </p>
      ) : null}
    </>
  );
}

export function CommerceGallery({
  product,
  compact = false,
}: {
  product: ClientProduct;
  compact?: boolean;
}) {
  const { images } = useKkokkapick();
  const urls = images.urls(product);
  const [selected, setSelected] = useState(urls[0]);
  const rail = useRef<HTMLDivElement>(null);
  const generation = images.generation();
  const activeIndex = Math.max(0, urls.indexOf(selected));
  const select = (index: number) => {
    const url = urls[index];
    if (!url) return;
    setSelected(url);
    rail.current?.scrollTo({
      left: index * rail.current.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  const previousUrls = useRef(urls.join("|"));
  useEffect(() => {
    if (previousUrls.current === urls.join("|")) return;
    previousUrls.current = urls.join("|");
    const index = Math.max(0, urls.indexOf(selected));
    if (rail.current)
      rail.current.scrollLeft = index * rail.current.clientWidth;
  }, [selected, urls]);
  return (
    <div className={compact ? "commerce-gallery compact" : "commerce-gallery"}>
      <div
        ref={rail}
        className="photo-rail"
        tabIndex={urls.length > 1 ? 0 : -1}
        role="group"
        aria-label={product.displayName + " 상품 사진"}
        onKeyDown={(event) => {
          if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            select(
              Math.max(
                0,
                Math.min(
                  urls.length - 1,
                  activeIndex + (event.key === "ArrowRight" ? 1 : -1),
                ),
              ),
            );
          }
        }}
        onScroll={(event) => {
          const index = Math.round(
            event.currentTarget.scrollLeft / event.currentTarget.clientWidth,
          );
          if (urls[index]) setSelected(urls[index]);
        }}
      >
        {urls.map((url) => (
          <div className="photo-slide" key={url}>
            <OriginalPhoto
              key={`${generation}:${url}`}
              url={url}
              name={product.displayName}
              generation={generation}
            />
          </div>
        ))}
      </div>
      {urls.length > 1 ? (
        <div className="photo-dots" role="group" aria-label="사진 선택">
          {urls.map((url, index) => (
            <button
              type="button"
              key={url}
              aria-label={`${index + 1}번째 사진`}
              aria-pressed={activeIndex === index}
              onClick={() => select(index)}
            >
              <span />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PhotoTile({
  product,
  onOpen,
}: {
  product: ClientProduct;
  onOpen: (product: ClientProduct) => void;
}) {
  const { images } = useKkokkapick();
  const url = images.urls(product)[0];
  return (
    <button
      type="button"
      className="photo-tile"
      data-photo={product.id}
      onClick={() => onOpen(product)}
      aria-label={product.displayName + " 상품 카드 보기"}
    >
      {url ? (
        <OriginalPhoto
          key={`${images.generation()}:${url}`}
          url={url}
          name={product.displayName}
          generation={images.generation()}
        />
      ) : null}
    </button>
  );
}

export function PhotoFeed({
  products,
  onOpen,
}: {
  products: ClientProduct[];
  onOpen: (product: ClientProduct) => void;
}) {
  const grid = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState(90);
  useEffect(() => {
    const measure = () => {
      if (!grid.current) return;
      const bottom =
        document.querySelector(".technical-nav")?.getBoundingClientRect().top ??
        innerHeight;
      const available =
        Math.min(window.visualViewport?.height ?? innerHeight, bottom) -
        grid.current.getBoundingClientRect().top -
        36;
      setRowHeight(Math.max(64, Math.floor(available / 4)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return (
    <div
      ref={grid}
      className="photo-feed"
      style={{ "--photo-row": `${rowHeight}px` } as CSSProperties}
    >
      {products.map((product) => (
        <PhotoTile key={product.id} product={product} onOpen={onOpen} />
      ))}
    </div>
  );
}
