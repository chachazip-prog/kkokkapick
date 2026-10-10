import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Grid2X2,
  Heart,
  Image,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { ProposalProduct, SceneContext } from "./ProposalGallery";
import { OriginalPhoto } from "@/components/commerce-gallery";
import { useKkokkapick } from "@/components/catalog-provider";
import "./refinements.css";

// Second-round review compositions only. These do not select a production UI.
const apparelCategories = [
  "전체",
  "바디수트",
  "상하복",
  "실내복",
  "외출복",
  "양말·소품",
];
const playCategories = ["전체", "장난감", "교구", "학습"];
const isPlay = (product: ProposalProduct) =>
  ["play", "toy", "learning"].includes(product.domain || "");

export function refinedCategories(
  context: SceneContext,
  domain = context.domain,
) {
  const categories = context.catalogFresh
    ? [
        ...new Set(
          context.catalogProducts
            .filter((product) => isPlay(product) === (domain === "play"))
            .map((product) => product.category?.trim())
            .filter((value): value is string => !!value),
        ),
      ]
    : [];
  return [
    "전체",
    ...(categories.length
      ? categories
      : (domain === "play" ? playCategories : apparelCategories).slice(1)),
  ];
}
const currency = (price: number) => `${price.toLocaleString("ko-KR")}원`;
const validPrice = (price: number | undefined): price is number =>
  typeof price === "number" && Number.isFinite(price) && price > 0;

function displayName(product: ProposalProduct) {
  return product.name.replace(/_[A-Z0-9]{8,}$/i, "").trim() || product.name;
}

function sellerCount(product: ProposalProduct) {
  return new Set(
    product.offers?.map((offer) => offer.merchant.trim()).filter(Boolean),
  ).size;
}

function safeSellerUrl(value: string | undefined) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

function Heading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="kr-heading">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function Campaign({ context }: { context: SceneContext }) {
  if (!context.hero) return null;
  return (
    <section className="kr-campaign" aria-label="꼬까픽 브랜드 캠페인">
      <div className="kr-campaign-copy">
        <h2>
          우리 아이,
          <br />
          오늘도 예쁘게.
        </h2>
        <p>
          찾는 즐거움,
          <br />
          비교는 간편하게.
        </p>
        <span>브랜드 캠페인</span>
      </div>
      <img
        src={context.hero}
        alt="함께 웃는 한국인 남자아이와 여자아이. 상품 사진이 아닌 꼬까픽 캠페인입니다."
      />
    </section>
  );
}

function SourceEmpty({
  context,
  saved = false,
  onBrowse,
}: {
  context: SceneContext;
  saved?: boolean;
  onBrowse?: () => void;
}) {
  const filtered = context.query || context.category !== "전체";
  return (
    <div className="kr-empty" role="status">
      <p>
        {saved
          ? "아직 담아둔 상품이 없어요."
          : !context.catalogFresh
            ? "지금은 상품 사진을 볼 수 없어요."
            : filtered
              ? "이 조건에 맞는 상품이 없어요."
              : "이 품목의 상품은 아직 없어요."}
      </p>
      <span>
        {saved
          ? "둘러보다 마음에 드는 상품의 하트를 눌러보세요."
          : !context.catalogFresh
            ? "상품 정보가 갱신되면 사진과 가격을 확인할 수 있어요."
            : "다른 품목이나 브랜드로 찾아보세요."}
      </span>
      {filtered && context.catalogFresh && !saved && (
        <button
          type="button"
          className="kr-text-action"
          onClick={() => {
            context.onQuery("");
            context.onCategory("전체");
          }}
        >
          검색 조건 지우기 <X size={14} />
        </button>
      )}
      {saved && (
        <button
          type="button"
          className="kr-text-action"
          onClick={onBrowse || (() => context.onSurface("search"))}
        >
          상품 찾아보기 <Search size={14} />
        </button>
      )}
    </div>
  );
}

function SearchBox({
  context,
  withFilter = false,
}: {
  context: SceneContext;
  withFilter?: boolean;
}) {
  const id = `refined-search-${context.direction.id}`;
  return (
    <form
      className="kr-search"
      role="search"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (
          !(event.nativeEvent as Event & { isComposing?: boolean }).isComposing
        )
          context.onSurface("search");
      }}
    >
      <label htmlFor={id} className="kr-sr-only">
        상품 또는 브랜드 검색
      </label>
      <Search size={19} aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={context.query}
        placeholder={
          context.domain === "play"
            ? "장난감·교구를 찾아요"
            : "상품이나 브랜드를 찾아요"
        }
        onChange={(event) => context.onQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && event.nativeEvent.isComposing)
            event.preventDefault();
        }}
      />
      {context.query && (
        <button
          type="button"
          aria-label="검색어 지우기"
          onClick={() => {
            context.onQuery("");
            document.getElementById(id)?.focus();
          }}
        >
          <X size={17} />
        </button>
      )}
      <button type="submit" className="kr-search-submit">
        검색
      </button>
      {withFilter && (
        <button
          type="button"
          className="kr-inline-filter"
          aria-label="상품 조건"
          title="상품 조건"
          onClick={() => context.onOverlay("filter")}
        >
          <SlidersHorizontal size={18} />
        </button>
      )}
    </form>
  );
}

function CategoryLine({ context }: { context: SceneContext }) {
  return (
    <nav
      className="kr-categories"
      aria-label={context.domain === "play" ? "놀이 품목" : "의류 품목"}
    >
      {refinedCategories(context).map((category) => (
        <button
          key={category}
          type="button"
          aria-pressed={context.category === category}
          onClick={() => context.onCategory(category)}
        >
          {category}
        </button>
      ))}
    </nav>
  );
}

function DomainLine({ context }: { context: SceneContext }) {
  return (
    <div className="kr-domain-switch" role="group" aria-label="찾을 상품 종류">
      <button
        type="button"
        aria-pressed={context.domain === "apparel"}
        onClick={() => context.onDomain("apparel")}
      >
        아이 옷
      </button>
      <button
        type="button"
        aria-pressed={context.domain === "play"}
        onClick={() => context.onDomain("play")}
      >
        장난감·교구
      </button>
    </div>
  );
}

function Photo({
  product,
  index = 0,
  onSelect,
}: {
  product: ProposalProduct;
  index?: number;
  onSelect: () => void;
}) {
  const { images } = useKkokkapick();
  const src = images.urls(product)[0];
  const generation = images.generation();
  return (
    <button
      type="button"
      className="kr-photo"
      aria-label={`${displayName(product)} 상품 정보 보기`}
      onClick={onSelect}
    >
      {src ? (
        <OriginalPhoto
          key={`${generation}:${src}`}
          url={src}
          name=""
          generation={generation}
          loading={index < 6 ? "eager" : "lazy"}
        />
      ) : (
        <span className="kr-photo-error">
          사진을 불러오지
          <br />
          못했어요
        </span>
      )}
    </button>
  );
}

function SaveButton({
  product,
  context,
}: {
  product: ProposalProduct;
  context: SceneContext;
}) {
  const active = context.saved.includes(product.id);
  return (
    <button
      type="button"
      className="kr-save"
      aria-pressed={active}
      aria-label={`${displayName(product)} ${active ? "찜 해제" : "찜하기"}`}
      onClick={() => context.onSave(product.id)}
    >
      <Heart
        size={18}
        fill={active ? "currentColor" : "none"}
        aria-hidden="true"
      />
    </button>
  );
}

function Facts({
  product,
  full = false,
}: {
  product: ProposalProduct;
  full?: boolean;
}) {
  const merchants = sellerCount(product);
  return (
    <div className="kr-facts">
      {product.brand && <p className="kr-product-brand">{product.brand}</p>}
      <h3 title={product.name}>{displayName(product)}</h3>
      {validPrice(product.minPrice) && (
        <p className="kr-price">
          {merchants > 1 && <span>최저 </span>}
          {currency(product.minPrice)}
        </p>
      )}
      {merchants > 1 && (
        <p className="kr-product-caption">판매처 {merchants}곳 비교</p>
      )}
      {full && <Specs product={product} />}
    </div>
  );
}

function ProductCard({
  product,
  context,
  index,
}: {
  product: ProposalProduct;
  context: SceneContext;
  index: number;
}) {
  return (
    <article className="kr-product-card">
      <div className="kr-product-visual">
        <Photo
          product={product}
          index={index}
          onSelect={() => context.onSelect(product)}
        />
        <SaveButton product={product} context={context} />
      </div>
      <Facts product={product} />
    </article>
  );
}

function ProductCollection({
  context,
  photos = false,
  products = context.products,
  saved = false,
  onBrowse,
}: {
  context: SceneContext;
  photos?: boolean;
  products?: ProposalProduct[];
  saved?: boolean;
  onBrowse?: () => void;
}) {
  const pageSize = photos ? 12 : 20;
  const [visible, setVisible] = useState(pageSize);
  const sentinel = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);
  const safeProducts = context.catalogFresh ? products : [];
  const key = `${context.query}:${context.category}:${context.domain}:${photos}:${saved}`;
  useEffect(() => {
    setVisible(pageSize);
    hasScrolled.current = false;
  }, [key, pageSize]);
  useEffect(() => {
    if (!sentinel.current || safeProducts.length <= visible) return;
    const scroller = sentinel.current.closest<HTMLElement>(
      ".kp-refined-content, .kp-review-dialog",
    );
    let queued = false;
    const append = () => {
      if (queued) return;
      queued = true;
      setVisible((current) =>
        Math.min(current + pageSize, safeProducts.length),
      );
    };
    const onScroll = (event: Event) => {
      if (event instanceof WheelEvent && event.deltaY <= 0) return;
      hasScrolled.current = true;
      const rect = sentinel.current?.getBoundingClientRect();
      const bottom =
        scroller?.getBoundingClientRect().bottom ?? window.innerHeight;
      const top = scroller?.getBoundingClientRect().top ?? 0;
      if (rect && rect.top < bottom + 160 && rect.bottom >= top) append();
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          hasScrolled.current &&
          entries.some((entry) => entry.isIntersecting)
        )
          append();
      },
      { root: scroller, rootMargin: "160px" },
    );
    observer.observe(sentinel.current);
    const scrollTarget = scroller || window;
    scrollTarget.addEventListener("scroll", onScroll, { passive: true });
    // When all twelve tiles fit, the first downward gesture must still append.
    scrollTarget.addEventListener("wheel", onScroll, { passive: true });
    scrollTarget.addEventListener("touchmove", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      scrollTarget.removeEventListener("scroll", onScroll);
      scrollTarget.removeEventListener("wheel", onScroll);
      scrollTarget.removeEventListener("touchmove", onScroll);
    };
  }, [safeProducts.length, visible, pageSize, key]);
  if (!safeProducts.length)
    return (
      <SourceEmpty
        context={context}
        saved={saved && context.catalogFresh}
        onBrowse={onBrowse}
      />
    );
  return (
    <>
      <div
        className={photos ? "kr-photo-feed" : "kr-product-grid"}
        aria-label={photos ? "사진으로 찾는 상품" : "상품 목록"}
      >
        {safeProducts
          .slice(0, visible)
          .map((product, index) =>
            photos ? (
              <Photo
                key={product.id}
                product={product}
                index={index}
                onSelect={() => context.onSelect(product)}
              />
            ) : (
              <ProductCard
                key={product.id}
                product={product}
                context={context}
                index={index}
              />
            ),
          )}
      </div>
      <div ref={sentinel} className="kr-list-end" aria-live="polite">
        {visible >= safeProducts.length
          ? "상품을 모두 확인했어요"
          : "스크롤하면 다음 상품이 이어져요"}
      </div>
    </>
  );
}

function BrandDirectory({
  context,
  compact = false,
  preview = false,
}: {
  context: SceneContext;
  compact?: boolean;
  preview?: boolean;
}) {
  const brands = context.catalogFresh
    ? [
        ...new Set(
          context.catalogProducts
            .filter(
              (product) => isPlay(product) === (context.domain === "play"),
            )
            .map((product) => product.brand?.trim())
            .filter((brand): brand is string => !!brand),
        ),
      ].sort((a, b) => a.localeCompare(b, "ko-KR"))
    : [];
  const groups = new Map<string, string[]>();
  const initials = [
    "ㄱ",
    "ㄲ",
    "ㄴ",
    "ㄷ",
    "ㄸ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅃ",
    "ㅅ",
    "ㅆ",
    "ㅇ",
    "ㅈ",
    "ㅉ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ];
  (preview ? brands.slice(0, 4) : brands).forEach((brand) => {
    const code = brand.charCodeAt(0);
    const group =
      code >= 0xac00 && code <= 0xd7a3
        ? initials[Math.floor((code - 0xac00) / 588)]
        : /[a-z]/i.test(brand[0])
          ? "ABC"
          : "기타";
    groups.set(group, [...(groups.get(group) || []), brand]);
  });
  if (!brands.length)
    return (
      <div className="kr-brand-pending">
        <p>
          {context.catalogFresh
            ? "확인된 브랜드가 없어요."
            : "브랜드 목록은 상품 정보와 함께 보여드릴게요."}
        </p>
        <button
          type="button"
          className="kr-text-action"
          onClick={() => context.onSurface("search")}
        >
          모든 상품 찾기 <Search size={14} />
        </button>
      </div>
    );
  return (
    <div
      className={`kr-brand-directory ${compact ? "is-compact" : ""} ${preview ? "is-preview" : ""}`}
    >
      {[...groups].map(([initial, names]) => (
        <section key={initial} className="kr-brand-group">
          <h3>{initial}</h3>
          <div>
            {names.map((brand) => (
              <button
                type="button"
                key={brand}
                onClick={() => {
                  context.onCategory("전체");
                  context.onQuery(brand);
                  context.onSurface("search");
                }}
              >
                {brand}
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      ))}
      {preview && brands.length > 4 && (
        <button
          type="button"
          className="kr-text-action"
          onClick={() => context.onOverlay("brands")}
        >
          브랜드 전체 <ChevronRight size={14} />
        </button>
      )}
      <button
        type="button"
        className="kr-text-action"
        onClick={() => {
          context.onQuery("");
          context.onCategory("전체");
          context.onSurface("search");
        }}
      >
        모든 상품 찾기 <ChevronRight size={14} />
      </button>
    </div>
  );
}

function BrowseTools({
  context,
  title,
}: {
  context: SceneContext;
  title: string;
}) {
  return (
    <>
      <Heading title={title}>
        <button
          type="button"
          className="kr-filter-button"
          onClick={() => context.onOverlay("filter")}
        >
          <SlidersHorizontal size={16} />
          조건
        </button>
      </Heading>
      <SearchBox context={context} />
      <CategoryLine context={context} />
    </>
  );
}

function BrandHome({ context }: { context: SceneContext }) {
  return (
    <>
      <Campaign context={context} />
      <div className="kr-brand-layout">
        <aside className="kr-brand-rail">
          <Heading title="브랜드로 찾아요" />
          <BrandDirectory context={context} preview />
        </aside>
        <section className="kr-brand-products">
          <Heading title="함께 둘러볼 아이 옷">
            <button
              type="button"
              className="kr-text-action"
              onClick={() => context.onSurface("search")}
            >
              찾기 <Search size={15} />
            </button>
          </Heading>
          <CategoryLine context={context} />
          <ProductCollection context={context} />
        </section>
      </div>
    </>
  );
}

function ClosetBrowse({
  context,
  surface,
}: {
  context: SceneContext;
  surface: "home" | "search";
}) {
  const [savedOnly, setSavedOnly] = useState(false);
  const [photos, setPhotos] = useState(true);
  const savedProducts = context.catalogFresh
    ? context.catalogProducts.filter((product) =>
        context.saved.includes(product.id),
      )
    : [];
  return (
    <>
      <div className="kr-closet-tabs">
        <div
          className="kr-closet-tabchoices"
          role="group"
          aria-label="옷장 보기"
        >
          <button
            type="button"
            aria-pressed={!savedOnly}
            onClick={() => setSavedOnly(false)}
          >
            둘러보기
          </button>
          <button
            type="button"
            aria-pressed={savedOnly}
            onClick={() => setSavedOnly(true)}
          >
            담은 상품 <span>{context.saved.length}</span>
          </button>
        </div>
        <div
          className="kr-view-switch"
          role="group"
          aria-label="상품 표시 방식"
        >
          <button
            type="button"
            aria-label="사진 보기"
            aria-pressed={photos}
            onClick={() => setPhotos(true)}
          >
            <Image size={14} />
            사진
          </button>
          <button
            type="button"
            aria-label="상품 정보 보기"
            aria-pressed={!photos}
            onClick={() => setPhotos(false)}
          >
            <Grid2X2 size={14} />
            정보
          </button>
        </div>
      </div>
      {!savedOnly && <SearchBox context={context} withFilter />}
      {savedOnly && (
        <button
          type="button"
          className="kr-text-action"
          onClick={() => context.onOverlay("saved")}
        >
          <Heart size={14} />찜 관리
        </button>
      )}
      {!savedOnly && !photos && <CategoryLine context={context} />}
      <ProductCollection
        context={context}
        photos={photos}
        saved={savedOnly}
        products={savedOnly ? savedProducts : context.products}
        onBrowse={() => setSavedOnly(false)}
      />
      {surface === "home" && !context.catalogFresh && (
        <Campaign context={context} />
      )}
    </>
  );
}

function WorldsBrowse({
  context,
  surface,
}: {
  context: SceneContext;
  surface: "home" | "search";
}) {
  return (
    <>
      <DomainLine context={context} />
      {surface === "home" && context.domain === "apparel" && (
        <Campaign context={context} />
      )}
      <BrowseTools
        context={context}
        title={
          context.domain === "play"
            ? "놀면서 자라는 시간"
            : surface === "search"
              ? "아이 옷을 찾아요"
              : "작은 옷, 새로운 발견"
        }
      />
      {context.domain === "play" && (
        <p className="kr-domain-note">
          장난감·교구는 판매처가 표기한 사용 연령을 확인해 주세요.
        </p>
      )}
      <ProductCollection context={context} />
    </>
  );
}

function Specs({ product }: { product: ProposalProduct }) {
  const play = isPlay(product);
  return (
    <dl className="kr-specs">
      <div>
        <dt>소재</dt>
        <dd>{product.material || "판매처에서 확인"}</dd>
      </div>
      {!play && (
        <div>
          <dt>판매 사이즈</dt>
          <dd>
            {product.availableSizes?.length
              ? product.availableSizes.join(" · ")
              : "판매처에서 확인"}
          </dd>
        </div>
      )}
      {play && (
        <div>
          <dt>사용 연령</dt>
          <dd>
            {product.ageEvidence?.rawText ? (
              <>
                {product.ageEvidence.rawText}
                <small>
                  {product.ageEvidence.source === "provider"
                    ? "판매처 제공 정보"
                    : "상품명에 표기된 연령"}
                </small>
              </>
            ) : (
              "판매처에서 확인"
            )}
          </dd>
        </div>
      )}
      <div>
        <dt>품목</dt>
        <dd>{product.category || "판매처에서 확인"}</dd>
      </div>
    </dl>
  );
}

function Gallery({ product }: { product: ProposalProduct }) {
  const { images } = useKkokkapick();
  const healthy = images.urls(product);
  const generation = images.generation();
  const [current, setCurrent] = useState(0);
  const startX = useRef<number | null>(null);
  useEffect(() => setCurrent(0), [product.id]);
  const index = Math.min(current, Math.max(healthy.length - 1, 0));
  return (
    <div className="kr-detail-gallery">
      <div
        className="kr-detail-photo"
        onTouchStart={(event) => {
          startX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (startX.current === null) return;
          const distance =
            (event.changedTouches[0]?.clientX ?? startX.current) -
            startX.current;
          if (Math.abs(distance) > 40)
            setCurrent((value) =>
              Math.max(
                0,
                Math.min(healthy.length - 1, value + (distance < 0 ? 1 : -1)),
              ),
            );
          startX.current = null;
        }}
      >
        {healthy[index] ? (
          <OriginalPhoto
            key={`${generation}:${healthy[index]}`}
            url={healthy[index]}
            name={`${displayName(product)} 상품 사진 ${index + 1}`}
            generation={generation}
            loading="eager"
          />
        ) : (
          <span className="kr-photo-error">상품 사진을 불러오지 못했어요.</span>
        )}
      </div>
      {healthy.length > 1 && (
        <div
          className="kr-dots"
          role="group"
          aria-label={`상품 사진 ${healthy.length}장`}
        >
          <button
            type="button"
            aria-label="이전 상품 사진"
            disabled={index === 0}
            onClick={() => setCurrent(index - 1)}
          >
            <ArrowLeft size={16} />
          </button>
          {healthy.map((photo, position) => (
            <button
              type="button"
              key={photo}
              className="kr-dot"
              aria-label={`${healthy.length}장 중 ${position + 1}번째 사진`}
              aria-pressed={position === index}
              onClick={() => setCurrent(position)}
            >
              <span />
            </button>
          ))}
          <button
            type="button"
            aria-label="다음 상품 사진"
            disabled={index === healthy.length - 1}
            onClick={() => setCurrent(index + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function SellerList({ product }: { product: ProposalProduct }) {
  return (
    <section className="kr-sellers">
      <Heading title="판매처와 가격" />
      {product.offers?.length ? (
        product.offers.map((offer, index) => {
          const url = safeSellerUrl(offer.url);
          return (
            <div className="kr-seller-row" key={`${offer.merchant}:${index}`}>
              <div>
                <p>{offer.merchant || "판매처"}</p>
                {validPrice(offer.price) && (
                  <strong>{currency(offer.price)}</strong>
                )}
              </div>
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer">
                  상품 보기 <ArrowUpRight size={15} />
                </a>
              ) : (
                <span className="kr-seller-pending">링크 확인 전</span>
              )}
            </div>
          );
        })
      ) : (
        <p className="kr-section-note">
          판매처 정보가 연결되면 가격을 비교할 수 있어요.
        </p>
      )}
    </section>
  );
}

function ProductDetail({ context }: { context: SceneContext }) {
  const product = context.catalogFresh ? context.selected : undefined;
  const play = product && isPlay(product);
  const bestOffer = product?.offers
    ?.filter((offer) => safeSellerUrl(offer.url))
    .sort((a, b) => a.price - b.price)[0];
  const purchaseUrl = safeSellerUrl(bestOffer?.url);
  if (!product)
    return (
      <>
        <Heading title="상품을 자세히 볼 때">
          <button
            type="button"
            className="kr-text-action"
            onClick={() => context.onSurface("search")}
          >
            <ArrowLeft size={15} />
            찾기로
          </button>
        </Heading>
        <div className="kr-detail-pending">
          <p>궁금한 상품을 선택해 주세요.</p>
          <span>
            사진, 판매처별 가격, 소재와 판매 사이즈를 한곳에서 확인할 수 있어요.
            제공되지 않은 정보는 판매처에서 확인하도록 안내해요.
          </span>
        </div>
        <SourceEmpty context={context} />
        <button
          type="button"
          className="kr-outline-action"
          onClick={() => context.onSurface("search")}
        >
          상품 찾아보기 <Search size={16} />
        </button>
      </>
    );
  return (
    <>
      <div className="kr-detail-top">
        <button
          type="button"
          className="kr-text-action"
          onClick={() => context.onSurface("search")}
        >
          <ArrowLeft size={16} />
          {context.direction.id === "08" ? "옷 둘러보기" : "상품 목록"}
        </button>
        {context.direction.id === "09" && (
          <span>{play ? "장난감·교구" : "아이 옷"}</span>
        )}
      </div>
      {context.direction.id === "06" && product.brand && (
        <button
          type="button"
          className="kr-detail-brand"
          onClick={() => {
            context.onQuery(product.brand!);
            context.onSurface("search");
          }}
        >
          {product.brand}
          <ChevronRight size={16} />
        </button>
      )}
      <div className="kr-detail-layout">
        <Gallery product={product} />
        <div className="kr-detail-content">
          <Facts product={product} />
          <div className="kr-detail-actions">
            <button
              type="button"
              className="kr-save-text"
              aria-pressed={context.saved.includes(product.id)}
              onClick={() => context.onSave(product.id)}
            >
              <Heart
                size={18}
                fill={
                  context.saved.includes(product.id) ? "currentColor" : "none"
                }
              />
              {context.saved.includes(product.id) ? "담아뒀어요" : "찜하기"}
            </button>
            {purchaseUrl ? (
              <a
                className="kr-primary-action"
                href={purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                판매처에서 보기 <ArrowUpRight size={17} />
              </a>
            ) : (
              <button type="button" className="kr-primary-action" disabled>
                판매처 연결 전
              </button>
            )}
          </div>
          {!purchaseUrl && (
            <p className="kr-action-note">
              확인된 구매 링크가 없어 판매처 이동을 제공하지 않아요.
            </p>
          )}
          <SellerList product={product} />
          <section className="kr-product-info">
            <Heading title="상품 정보" />
            <Specs product={product} />
          </section>
          {!play && (
            <button
              type="button"
              className="kr-child-link"
              onClick={() => context.onOverlay("children")}
            >
              <div>
                <strong>우리 아이 기준으로 확인</strong>
                <span>아이를 선택하면 사이즈 확인에 도움이 돼요.</span>
              </div>
              <ChevronRight size={18} />
            </button>
          )}
          {play && (
            <p className="kr-domain-note">
              사용 연령이 표기되어 있어도 안전 주의사항은 판매처에서 함께 확인해
              주세요.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export function RefinedScene({
  context,
  surface,
}: {
  context: SceneContext;
  surface: "home" | "search" | "detail";
}) {
  return (
    <div className="kp-refinement" data-concept={context.direction.id}>
      {surface === "detail" ? (
        <ProductDetail context={context} />
      ) : context.direction.id === "06" ? (
        surface === "home" ? (
          <BrandHome context={context} />
        ) : (
          <>
            <BrowseTools
              context={context}
              title={
                context.query
                  ? `${context.query} 찾아보기`
                  : "알던 브랜드부터, 새 옷까지"
              }
            />
            <div className="kr-search-brand-row">
              <button
                type="button"
                className="kr-text-action"
                onClick={() => context.onOverlay("brands")}
              >
                브랜드 목록 <ChevronRight size={15} />
              </button>
              <span>이름과 사진을 함께 비교해요.</span>
            </div>
            <ProductCollection context={context} />
          </>
        )
      ) : context.direction.id === "08" ? (
        <ClosetBrowse context={context} surface={surface} />
      ) : (
        <WorldsBrowse context={context} surface={surface} />
      )}
    </div>
  );
}

export function RefinedOverlayBody({
  kind,
  context,
}: {
  kind: "brands" | "saved" | "category" | "product";
  context: SceneContext;
}) {
  const product = context.catalogFresh ? context.selected : undefined;
  const savedProducts = context.catalogFresh
    ? context.catalogProducts.filter((item) => context.saved.includes(item.id))
    : [];
  return (
    <div
      className="kp-refinement kr-overlay"
      data-concept={context.direction.id}
    >
      {kind === "brands" ? (
        <BrandDirectory context={context} compact />
      ) : kind === "category" ? (
        <CategoryLine context={context} />
      ) : kind === "saved" ? (
        <ProductCollection context={context} products={savedProducts} saved />
      ) : product ? (
        <>
          <div className="kr-overlay-product">
            <Photo
              product={product}
              onSelect={() => context.onSurface("detail")}
            />
            <Facts product={product} />
          </div>
          <Specs product={product} />
          <div className="kr-overlay-actions">
            <button
              type="button"
              className="kr-save-text"
              aria-pressed={context.saved.includes(product.id)}
              onClick={() => context.onSave(product.id)}
            >
              <Heart
                size={17}
                fill={
                  context.saved.includes(product.id) ? "currentColor" : "none"
                }
              />
              {context.saved.includes(product.id) ? "담아뒀어요" : "찜하기"}
            </button>
            <button
              type="button"
              className="kr-primary-action"
              onClick={() => context.onSurface("detail")}
            >
              상품 자세히 보기 <ChevronRight size={16} />
            </button>
          </div>
        </>
      ) : (
        <SourceEmpty context={context} />
      )}
    </div>
  );
}
