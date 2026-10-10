import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  directions,
  type DesignDirection,
  type ProposalId,
  type ProposalSurface,
} from "./directions";
import "./proposals.css";

/**
 * Review-only design gallery. It does not implement the selected production UI.
 * Supply the approved, locally served heroImageUrl. Products render only when
 * catalogStatus === 'fresh' and catalogExpiresAt is a future ISO timestamp.
 * Do not pass expired commercial metadata or reclassify campaign art as goods.
 */
export interface ProposalProduct {
  id: string;
  name: string;
  brand?: string | null;
  category?: string;
  domain?: "apparel" | "play" | "toy" | "learning" | (string & {});
  imageUrl?: string;
  imageUrls?: string[];
  minPrice?: number;
  offers?: { merchant: string; price: number; url?: string }[];
  availableSizes?: string[];
  material?: string | null;
  fitStatus?: string;
  fitSource?: string | null;
  ageEvidence?: {
    minMonths: number;
    maxMonths: number | null;
    source: "provider" | "product_title";
    rawText: string;
  } | null;
}

export interface ProposalGalleryProps {
  products?: ProposalProduct[];
  catalogStatus?: "fresh" | "expired" | "unavailable";
  catalogExpiresAt?: string;
  heroImageUrl?: string;
}

type OverlayKind =
  | "filter"
  | "children"
  | "category"
  | "brands"
  | "saved"
  | "chapters"
  | "product";
type Device = "mobile" | "desktop";
type Domain = "apparel" | "play";
type IconName =
  | "search"
  | "heart"
  | "home"
  | "person"
  | "arrow"
  | "close"
  | "filter"
  | "grid"
  | "check"
  | "book"
  | "shirt"
  | "play";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    heart: (
      <path d="M20 5.8c-2.7-2.8-6.4-1.8-8 1-1.6-2.8-5.3-3.8-8-1C-1 11 6.5 17.6 12 21c5.5-3.4 13-10 8-15.2Z" />
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8M5 9.5V21h5v-7h4v7h5V9.5" />
      </>
    ),
    person: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    filter: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <path d="M8 3v6M16 9v6M10 15v6" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    book: (
      <>
        <path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15" />
      </>
    ),
    shirt: <path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4c-1 4-7 4-8 0Z" />,
    play: (
      <>
        <path d="m4 4 7 4-7 4V4Z" />
        <circle cx="17" cy="7" r="4" />
        <rect x="4" y="15" width="7" height="6" rx="1" />
        <path d="m18 14 4 7h-8l4-7Z" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function readReviewLocation() {
  if (typeof window === "undefined")
    return {
      id: "01" as ProposalId,
      surface: "home" as ProposalSurface,
      device: "mobile" as Device,
    };
  const params = new URLSearchParams(
    window.location.hash.split("?")[1] || window.location.search,
  );
  const id = (params.get("proposal") || "01").padStart(2, "0") as ProposalId;
  const surface = params.get("surface") as ProposalSurface;
  return {
    id: directions.some((d) => d.id === id) ? id : ("01" as ProposalId),
    surface: ["home", "search", "detail"].includes(surface)
      ? surface
      : ("home" as ProposalSurface),
    device:
      params.get("device") === "desktop"
        ? ("desktop" as Device)
        : ("mobile" as Device),
  };
}

const clothingCategories = [
  "전체",
  "바디수트",
  "상하복",
  "실내복",
  "외출복",
  "양말·소품",
];
const playCategories = ["전체", "장난감", "교구", "학습"];
const won = (value: number) =>
  `${new Intl.NumberFormat("ko-KR").format(value)}원`;
const isPlayProduct = (product: ProposalProduct) =>
  ["play", "toy", "learning"].includes(product.domain || "");

function CampaignPhoto({
  hero,
  className = "",
  position = "72% center",
  label = false,
}: {
  hero?: string;
  className?: string;
  position?: string;
  label?: boolean;
}) {
  return (
    <div className={`kp-campaign-photo ${className}`}>
      {hero ? (
        <img
          src={hero}
          alt="함께 웃는 남자아이와 여자아이, 승인된 꼬까픽 브랜드 캠페인"
          style={{ objectPosition: position }}
        />
      ) : (
        <div className="kp-image-unavailable">승인 캠페인 이미지 연결 전</div>
      )}
      {label && (
        <span className="kp-campaign-credit">
          브랜드 캠페인 · 상품 사진 아님
        </span>
      )}
    </div>
  );
}

function Campaign({
  hero,
  compact = false,
  reverse = false,
}: {
  hero?: string;
  compact?: boolean;
  reverse?: boolean;
}) {
  return (
    <section
      className={`kp-campaign ${compact ? "is-compact" : ""} ${reverse ? "is-reverse" : ""}`}
      aria-label="꼬까픽 브랜드 소개"
    >
      <div className="kp-campaign-copy">
        <span className="kp-eyebrow">우리 아이의 작은 일상</span>
        <h2>
          예쁜 옷 발견,
          <br />
          꼬까픽에서.
        </h2>
        <p>
          옷은 사진으로 보고,
          <br />
          궁금한 정보는 하나씩 확인해요.
        </p>
      </div>
      <CampaignPhoto hero={hero} />
    </section>
  );
}

interface SceneContext {
  direction: DesignDirection;
  products: ProposalProduct[];
  catalogProducts: ProposalProduct[];
  catalogFresh: boolean;
  hero?: string;
  selected?: ProposalProduct;
  onSelect: (product?: ProposalProduct) => void;
  onSurface: (surface: ProposalSurface) => void;
  onOverlay: (kind: OverlayKind) => void;
  category: string;
  onCategory: (value: string) => void;
  domain: Domain;
  onDomain: (value: Domain) => void;
  saved: string[];
  onSave: (id: string) => void;
  query: string;
  onQuery: (value: string) => void;
  childSelection: number[];
  onChildSelection: (value: number[]) => void;
}

function CategoryBar({
  context,
  vertical = false,
}: {
  context: SceneContext;
  vertical?: boolean;
}) {
  const categories =
    context.domain === "play" ? playCategories : clothingCategories;
  return (
    <nav
      className={`kp-categories ${vertical ? "is-vertical" : ""}`}
      aria-label={context.domain === "play" ? "놀이·학습 품목" : "의류 품목"}
    >
      {categories.map((category) => (
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

function SearchField({
  context,
  large = false,
}: {
  context: SceneContext;
  large?: boolean;
}) {
  const inputId = `proposal-search-${context.direction.id}-${large ? "large" : "regular"}`;
  return (
    <form
      className={`kp-search-field ${large ? "is-large" : ""}`}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (
          !(event.nativeEvent as Event & { isComposing?: boolean }).isComposing
        )
          context.onSurface("search");
      }}
      role="search"
    >
      <label className="kp-visually-hidden" htmlFor={inputId}>
        {context.domain === "play"
          ? "놀이·학습 상품 검색"
          : "상품 또는 브랜드 검색"}
      </label>
      <Icon name="search" size={large ? 24 : 19} />
      <input
        id={inputId}
        type="search"
        value={context.query}
        placeholder={
          context.domain === "play"
            ? "장난감, 교구를 찾아요"
            : "상품 또는 브랜드를 찾아요"
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
          className="kp-icon-button"
          aria-label="검색어 지우기"
          onClick={() => {
            context.onQuery("");
            document.getElementById(inputId)?.focus();
          }}
        >
          <Icon name="close" size={18} />
        </button>
      )}
      <button
        type="submit"
        className="kp-search-submit"
        aria-label="검색 결과 보기"
      >
        <Icon name="arrow" size={19} />
      </button>
    </form>
  );
}

function PhotoTile({
  product,
  hero,
  index,
  selected,
  onSelect,
  className = "",
}: {
  product?: ProposalProduct;
  hero?: string;
  index: number;
  selected?: boolean;
  onSelect: () => void;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = product ? product.imageUrl || product.imageUrls?.[0] : hero;
  useEffect(() => setFailed(false), [src]);
  return (
    <button
      type="button"
      className={`kp-photo-tile ${selected ? "is-selected" : ""} ${product ? "" : "is-campaign"} ${className}`}
      onClick={onSelect}
      aria-label={
        product
          ? `${product.name} 상품 정보 보기`
          : `브랜드 캠페인 구성 ${index + 1} 보기. 실제 상품이 아닙니다.`
      }
      aria-pressed={selected}
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading={index < 6 ? "eager" : "lazy"}
          style={
            !product
              ? {
                  objectPosition: `${[58, 76, 92, 64][index % 4]}% center`,
                  transform: `scale(${index % 3 === 0 ? 1 : 1.22})`,
                }
              : undefined
          }
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="kp-image-unavailable">
          {product ? "사진을 불러오지 못했어요" : "캠페인 이미지 연결 전"}
        </span>
      )}
    </button>
  );
}

function ProductFacts({
  product,
  className = "",
}: {
  product?: ProposalProduct;
  className?: string;
}) {
  const hasClothingSizes =
    !!product?.availableSizes?.length && !isPlayProduct(product);
  const merchants = Array.from(
    new Set(
      product?.offers?.map((offer) => offer.merchant.trim()).filter(Boolean),
    ),
  );
  return (
    <div className={`kp-product-facts ${className}`}>
      <span className="kp-product-brand">
        {product?.brand || (product ? "상품 정보" : "디자인 검토용 캠페인")}
      </span>
      <h3>{product?.name || "사진을 고르면, 이곳에서 확인해요."}</h3>
      {product && Number.isFinite(product.minPrice) ? (
        <p className="kp-price">
          {(product.offers?.length || 0) > 1 && <small>최저가 </small>}
          {won(product.minPrice!)}
        </p>
      ) : (
        !product && (
          <p className="kp-pending-copy">
            최신 상품이 연결되면 이름, 가격, 판매처를 표시해요. 캠페인 속 의상은
            판매 상품이 아닙니다.
          </p>
        )
      )}
      {product?.offers?.length ? (
        <p className="kp-subtle">
          {merchants.length > 1
            ? `판매처 ${merchants.length}곳 비교`
            : merchants[0] || "판매처 확인 전"}
        </p>
      ) : null}
      {product?.material || hasClothingSizes || product?.ageEvidence ? (
        <dl className="kp-specs">
          {product.material && (
            <>
              <dt>소재</dt>
              <dd>{product.material}</dd>
            </>
          )}
          {hasClothingSizes && (
            <>
              <dt>확인된 사이즈</dt>
              <dd>{product.availableSizes!.join(" · ")}</dd>
            </>
          )}
          {product.ageEvidence && (
            <>
              <dt>확인된 연령 표기</dt>
              <dd>
                {product.ageEvidence.rawText}
                <small className="kp-age-source">
                  {product.ageEvidence.source === "provider"
                    ? "판매처 제공 정보"
                    : "상품명 표기 근거"}
                </small>
              </dd>
            </>
          )}
        </dl>
      ) : null}
    </div>
  );
}

function ProductCard({
  product,
  index,
  context,
  compact = false,
}: {
  product?: ProposalProduct;
  index: number;
  context: SceneContext;
  compact?: boolean;
}) {
  return (
    <article className={`kp-product-card ${compact ? "is-compact" : ""}`}>
      <PhotoTile
        product={product}
        hero={context.hero}
        index={index}
        onSelect={() => context.onSelect(product)}
        selected={!!product && product.id === context.selected?.id}
      />
      <ProductFacts product={product} />
      {product && (
        <button
          type="button"
          className="kp-save-button"
          onClick={() => context.onSave(product.id)}
          aria-pressed={context.saved.includes(product.id)}
          aria-label={`${product.name} ${context.saved.includes(product.id) ? "찜 해제" : "찜하기"}`}
        >
          <Icon name="heart" size={17} />
          <span>{context.saved.includes(product.id) ? "담았어요" : "찜"}</span>
        </button>
      )}
    </article>
  );
}

function PhotoFeed({
  context,
  limit = 12,
  mosaic = false,
}: {
  context: SceneContext;
  limit?: number;
  mosaic?: boolean;
}) {
  const [visible, setVisible] = useState(limit);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(
    () => setVisible(limit),
    [context.category, context.query, context.domain, limit],
  );
  useEffect(() => {
    if (!sentinel.current || !context.products.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting))
          setVisible((value) => Math.min(value + 12, context.products.length));
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [context.products.length]);
  if (
    !context.products.length &&
    (context.catalogFresh ||
      context.query ||
      context.category !== "전체" ||
      context.domain === "play")
  )
    return <CatalogEmpty context={context} />;
  const items: (ProposalProduct | undefined)[] = context.products.length
    ? context.products.slice(0, visible)
    : Array.from({ length: Math.min(limit, 12) }, () => undefined);
  return (
    <>
      <div className={`kp-photo-feed ${mosaic ? "is-mosaic" : ""}`}>
        {items.map((product, index) => (
          <PhotoTile
            key={product?.id || `campaign-${index}`}
            product={product}
            hero={context.hero}
            index={index}
            selected={!!product && product.id === context.selected?.id}
            onSelect={() => context.onSelect(product)}
          />
        ))}
      </div>
      <div ref={sentinel} className="kp-feed-status" aria-live="polite">
        {context.products.length
          ? visible >= context.products.length
            ? "모든 상품을 확인했어요"
            : "아래로 이어서 둘러보세요"
          : "구성 검토용 캠페인 사진 · 실제 상품 사진은 최신 카탈로그 연결 후 표시"}
      </div>
    </>
  );
}

function ProductGrid({
  context,
  count = 6,
}: {
  context: SceneContext;
  count?: number;
}) {
  if (
    !context.products.length &&
    (context.catalogFresh ||
      context.query ||
      context.category !== "전체" ||
      context.domain === "play")
  )
    return <CatalogEmpty context={context} />;
  const list: (ProposalProduct | undefined)[] = context.products.length
    ? context.products.slice(0, count)
    : Array.from({ length: Math.min(count, 4) }, () => undefined);
  return (
    <div className="kp-product-grid">
      {list.map((product, index) => (
        <ProductCard
          key={product?.id || index}
          product={product}
          context={context}
          index={index}
        />
      ))}
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
  action,
  onAction,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="kp-section-title">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && (
        <button type="button" className="kp-text-button" onClick={onAction}>
          {action}
          <Icon name="arrow" size={16} />
        </button>
      )}
    </div>
  );
}

function SelectionCard({ context }: { context: SceneContext }) {
  return (
    <aside className="kp-selection-card" aria-live="polite">
      <span className="kp-eyebrow">선택한 사진</span>
      <ProductFacts product={context.selected} />
      <button
        type="button"
        className="kp-primary-button"
        onClick={() => context.onSurface("detail")}
      >
        자세히 보기
        <Icon name="arrow" size={17} />
      </button>
    </aside>
  );
}

function ChildStrip({ context }: { context: SceneContext }) {
  return (
    <section className="kp-child-strip">
      <div>
        <Icon name="person" size={22} />
        <div>
          <strong>함께 고를 아이</strong>
          <span>
            {context.childSelection.length
              ? `검토용 아이 ${context.childSelection.join(" · ")} 선택`
              : "아직 선택하지 않았어요"}
          </span>
        </div>
      </div>
      <button type="button" onClick={() => context.onOverlay("children")}>
        아이 선택
      </button>
    </section>
  );
}

function DomainSwitch({ context }: { context: SceneContext }) {
  return (
    <nav className="kp-domain-switch" aria-label="탐색 영역">
      <button
        type="button"
        onClick={() => context.onDomain("apparel")}
        aria-pressed={context.domain === "apparel"}
      >
        <Icon name="shirt" />
        의류
      </button>
      <button
        type="button"
        onClick={() => context.onDomain("play")}
        aria-pressed={context.domain === "play"}
      >
        <Icon name="play" />
        놀이·학습
      </button>
    </nav>
  );
}

function OfferTable({ product }: { product?: ProposalProduct }) {
  return (
    <section className="kp-offers">
      <h3>판매처에서 확인</h3>
      {product?.offers?.length ? (
        <table>
          <caption className="kp-visually-hidden">
            현재 상품의 판매처별 가격
          </caption>
          <thead>
            <tr>
              <th scope="col">판매처</th>
              <th scope="col">상품 가격</th>
              <th scope="col">확인</th>
            </tr>
          </thead>
          <tbody>
            {product.offers.map((offer, index) => (
              <tr key={`${offer.merchant}-${index}`}>
                <th scope="row">{offer.merchant}</th>
                <td>{won(offer.price)}</td>
                <td>
                  {offer.url ? (
                    <a href={offer.url} target="_blank" rel="noreferrer">
                      판매처
                      <Icon name="arrow" size={14} />
                      <span className="kp-visually-hidden"> 새 창</span>
                    </a>
                  ) : (
                    <span>링크 확인 전</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="kp-evidence-note">
          최신 판매처 정보가 연결되면 비교할 수 있어요. 확인되지 않은 가격은
          표시하지 않아요.
        </p>
      )}
      <p className="kp-subtle">옵션과 최종 가격은 판매처에서 확인해 주세요.</p>
    </section>
  );
}

function CompareList({ context }: { context: SceneContext }) {
  if (
    !context.products.length &&
    (context.catalogFresh ||
      context.query ||
      context.category !== "전체" ||
      context.domain === "play")
  )
    return <CatalogEmpty context={context} />;
  const items: (ProposalProduct | undefined)[] = context.products.length
    ? context.products.slice(0, 5)
    : [undefined, undefined, undefined];
  return (
    <div className="kp-compare-list">
      {items.map((product, index) => (
        <article key={product?.id || index}>
          <PhotoTile
            product={product}
            hero={context.hero}
            index={index}
            onSelect={() => context.onSelect(product)}
          />
          <ProductFacts product={product} />
          <button
            type="button"
            className="kp-text-button"
            onClick={() => {
              context.onSelect(product);
              context.onSurface("detail");
            }}
          >
            비교 보기
            <Icon name="arrow" size={16} />
          </button>
        </article>
      ))}
    </div>
  );
}

function CatalogEmpty({ context }: { context: SceneContext }) {
  return (
    <div className="kp-empty">
      <Icon name={context.domain === "play" ? "play" : "search"} size={40} />
      <h3>
        {context.catalogFresh
          ? "현재 조건에 맞는 상품이 없어요."
          : "최신 상품을 연결한 뒤 찾을 수 있어요."}
      </h3>
      <p>
        {context.catalogFresh
          ? "검색어를 지우거나 다른 품목을 살펴보세요."
          : "확인되지 않은 상품은 검색 결과로 만들지 않아요."}
      </p>
      {(context.query || context.category !== "전체") && (
        <button
          type="button"
          className="kp-outline-button"
          onClick={() => {
            context.onQuery("");
            context.onCategory("전체");
          }}
        >
          조건 지우기
        </button>
      )}
    </div>
  );
}

function BrandIndex({ context }: { context: SceneContext }) {
  const [initial, setInitial] = useState("전체");
  const koreanInitials = [
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
  const brandInitial = (brand: string) => {
    const code = brand.charCodeAt(0) - 0xac00;
    if (code >= 0 && code <= 11171)
      return koreanInitials[Math.floor(code / 588)]
        .replace("ㄲ", "ㄱ")
        .replace("ㄸ", "ㄷ")
        .replace("ㅃ", "ㅂ")
        .replace("ㅆ", "ㅅ")
        .replace("ㅉ", "ㅈ");
    return "A–Z";
  };
  const brands = Array.from(
    new Set(
      context.products
        .map((product) => product.brand)
        .filter((brand): brand is string => !!brand),
    ),
  ).sort((a, b) => a.localeCompare(b, "ko"));
  const visibleBrands =
    initial === "전체"
      ? brands
      : brands.filter((brand) => brandInitial(brand) === initial);
  return (
    <section className="kp-brand-index">
      <span className="kp-eyebrow">BRAND DIRECTORY</span>
      <h2>좋아하는 브랜드부터.</h2>
      <div className="kp-alphabet" aria-label="브랜드 가나다 색인">
        {["전체", ..."ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ".split(""), "A–Z"].map(
          (letter) => (
            <button
              type="button"
              key={letter}
              onClick={() => setInitial(letter)}
              aria-label={`${letter} 브랜드 색인 보기`}
              aria-pressed={initial === letter}
            >
              {letter}
            </button>
          ),
        )}
      </div>
      {visibleBrands.length ? (
        <div className="kp-brand-links">
          {visibleBrands.slice(0, 12).map((brand) => (
            <button
              type="button"
              key={brand}
              onClick={() => {
                context.onQuery(brand);
                context.onSurface("search");
              }}
            >
              {brand}
              <Icon name="arrow" size={15} />
            </button>
          ))}
        </div>
      ) : (
        <p className="kp-evidence-note">
          {brands.length
            ? `${initial} 색인에 확인된 브랜드가 없어요. 전체 색인을 살펴보세요.`
            : "최신 카탈로그에 확인된 브랜드가 이곳에 모여요. 미확인 브랜드는 따로 둘러볼 수 있어요."}
        </p>
      )}
    </section>
  );
}

function BrandShelves({ context }: { context: SceneContext }) {
  const groups = new Map<string, ProposalProduct[]>();
  for (const product of context.products) {
    const brand = product.brand || "브랜드 미확인";
    groups.set(brand, [...(groups.get(brand) || []), product]);
  }
  return (
    <div className="kp-brand-shelves">
      {groups.size ? (
        [...groups.entries()].slice(0, 4).map(([brand, products]) => (
          <section key={brand}>
            <SectionTitle
              title={brand}
              action="브랜드 상품"
              onAction={() => {
                context.onQuery(brand === "브랜드 미확인" ? "" : brand);
                context.onSurface("search");
              }}
            />
            <div className="kp-product-rail">
              {products.slice(0, 5).map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  context={context}
                />
              ))}
            </div>
          </section>
        ))
      ) : (
        <section>
          <SectionTitle
            title="브랜드별 진열장"
            subtitle="확인된 브랜드와 상품이 각각의 선반에 모여요"
          />
          <ProductGrid context={context} count={3} />
        </section>
      )}
    </div>
  );
}

function ChapterNav({ context }: { context: SceneContext }) {
  return (
    <nav className="kp-chapter-nav" aria-label="쇼핑 노트 목차">
      {["첫 발견", "품목 둘러보기", "상품 정보 확인"].map((title, index) => (
        <button
          type="button"
          key={title}
          onClick={() => {
            context.onSurface("home");
            window.requestAnimationFrame(() =>
              document
                .getElementById(
                  `kp-chapter-${context.direction.id}-${index + 1}`,
                )
                ?.scrollIntoView({ block: "start", behavior: "auto" }),
            );
          }}
        >
          <span>0{index + 1}</span>
          {title}
        </button>
      ))}
    </nav>
  );
}

function HomeScene({ context }: { context: SceneContext }) {
  const c = context;
  switch (c.direction.id) {
    case "01":
      return (
        <>
          <SearchField context={c} />
          <Campaign hero={c.hero} compact />
          <CategoryBar context={c} />
          <div className="kp-contact-layout">
            <section>
              <SectionTitle
                title="사진으로 둘러보기"
                subtitle="마음에 드는 사진을 눌러 확인해요"
              />
              <PhotoFeed context={c} />
            </section>
            <SelectionCard context={c} />
          </div>
        </>
      );
    case "02":
      return (
        <>
          <DomainSwitch context={c} />
          {c.domain === "apparel" ? (
            <Campaign hero={c.hero} />
          ) : (
            <div className="kp-showroom-play">
              <Icon name="play" size={48} />
              <div>
                <span className="kp-eyebrow">놀이·학습 쇼룸</span>
                <h2>
                  옷과는 따로,
                  <br />
                  차근차근 살펴봐요.
                </h2>
                <p>확인된 상품 정보로 고르는 장난감과 교구.</p>
              </div>
            </div>
          )}
          <div className="kp-showroom-shelves">
            <section>
              <SectionTitle
                title={
                  c.domain === "apparel"
                    ? "작은 옷을 한 줄씩"
                    : "놀이·학습 상품 한 줄씩"
                }
                action="모두 보기"
                onAction={() => c.onSurface("search")}
              />
              <div className="kp-product-rail">
                {!c.products.length &&
                (c.catalogFresh ||
                  c.query ||
                  c.category !== "전체" ||
                  c.domain === "play") ? (
                  <CatalogEmpty context={c} />
                ) : (
                  (c.products.length
                    ? c.products.slice(0, 5)
                    : [undefined, undefined, undefined]
                  ).map((product, index) => (
                    <ProductCard
                      key={product?.id || index}
                      product={product}
                      context={c}
                      index={index}
                    />
                  ))
                )}
              </div>
            </section>
            <section>
              <SectionTitle
                title={
                  c.domain === "apparel"
                    ? "어떤 옷을 찾으세요?"
                    : "어떤 놀이 상품을 찾으세요?"
                }
              />
              <CategoryBar context={c} />
              <ProductGrid context={c} count={4} />
            </section>
          </div>
        </>
      );
    case "03":
      return (
        <>
          <div className="kp-desk-intro">
            <div>
              <span className="kp-eyebrow">한 상품, 여러 판매처</span>
              <h2>
                사진을 보고,
                <br />
                가격을 확인해요.
              </h2>
            </div>
            <CampaignPhoto hero={c.hero} />
          </div>
          <SearchField context={c} large />
          <CategoryBar context={c} />
          <div className="kp-desk-layout">
            <CompareList context={c} />
            <aside>
              <ProductFacts product={c.selected} />
              <OfferTable product={c.selected} />
            </aside>
          </div>
        </>
      );
    case "04":
      return (
        <>
          <ChildStrip context={c} />
          <div className="kp-fit-home">
            <aside>
              <span className="kp-eyebrow">우리 아이 옷 찾기</span>
              <h2>
                함께 골라도,
                <br />
                확인은 아이별로.
              </h2>
              <p>
                사이즈 근거가 있는 상품에서
                <br />
                아이별 안내를 확인할 수 있어요.
              </p>
              <button
                className="kp-outline-button"
                type="button"
                onClick={() => c.onOverlay("children")}
              >
                아이 선택 방식 보기
              </button>
              <CampaignPhoto hero={c.hero} />
            </aside>
            <section>
              <SearchField context={c} />
              <CategoryBar context={c} />
              <SectionTitle title="옷부터 둘러보세요" />
              <ProductGrid context={c} count={6} />
            </section>
          </div>
        </>
      );
    case "05":
      return (
        <>
          <div className="kp-wardrobe-heading">
            <span className="kp-eyebrow">한 칸씩 둘러보는 옷장</span>
            <h2>오늘은 어떤 옷?</h2>
            <button
              type="button"
              className="kp-text-button"
              onClick={() => c.onOverlay("category")}
            >
              전체 품목
              <Icon name="grid" size={18} />
            </button>
          </div>
          <div className="kp-wardrobe-layout">
            <CategoryBar context={c} vertical />
            <section>
              <div className="kp-wardrobe-feature">
                <CampaignPhoto hero={c.hero} />
                <div>
                  <span className="kp-eyebrow">CLOTHES FIRST</span>
                  <h3>
                    {c.category === "전체" ? "작은 옷, 큰 발견." : c.category}
                  </h3>
                  <p>품목을 고른 뒤 사진으로 둘러봐요.</p>
                </div>
              </div>
              <PhotoFeed context={c} mosaic />
            </section>
          </div>
        </>
      );
    case "06":
      return (
        <>
          <Campaign hero={c.hero} compact />
          <div className="kp-directory-layout">
            <BrandIndex context={c} />
            <section>
              <SearchField context={c} />
              <BrandShelves context={c} />
            </section>
          </div>
        </>
      );
    case "07":
      return (
        <>
          <div className="kp-search-studio">
            <span className="kp-eyebrow">찾는 옷이 있다면</span>
            <h2>바로 찾아볼까요?</h2>
            <SearchField context={c} large />
            <CategoryBar context={c} />
            <button
              type="button"
              className="kp-text-button"
              onClick={() => c.onOverlay("filter")}
            >
              <Icon name="filter" size={17} />
              조건 골라 찾기
            </button>
            <CampaignPhoto hero={c.hero} position="72% 20%" />
          </div>
          <SectionTitle
            title="사진으로 먼저 보기"
            action="검색으로"
            onAction={() => c.onSurface("search")}
          />
          <PhotoFeed context={c} limit={6} />
        </>
      );
    case "08":
      return (
        <>
          <div className="kp-board-top">
            <div>
              <span className="kp-eyebrow">나중에 다시 보고 싶은 옷</span>
              <h2>마음에 담아두세요.</h2>
            </div>
            <button
              type="button"
              className="kp-outline-button"
              onClick={() => c.onOverlay("saved")}
            >
              <Icon name="heart" size={17} />
              담은 옷 {c.saved.length}
            </button>
          </div>
          <div className="kp-board-layout">
            <section>
              <SearchField context={c} />
              <PhotoFeed context={c} mosaic />
            </section>
            <aside className="kp-saved-drawer">
              <Icon name="heart" size={26} />
              <h3>담은 옷</h3>
              {c.saved.length ? (
                <p>{c.saved.length}개의 상품을 담았어요.</p>
              ) : (
                <p>
                  아직 담은 옷이 없어요.
                  <br />
                  사진을 열고 찜해두세요.
                </p>
              )}
              <button
                type="button"
                className="kp-text-button"
                onClick={() => c.onOverlay("saved")}
              >
                담은 옷 보기
                <Icon name="arrow" size={15} />
              </button>
              <CampaignPhoto hero={c.hero} />
            </aside>
          </div>
        </>
      );
    case "09":
      return (
        <>
          <DomainSwitch context={c} />
          <div className="kp-world-intro">
            <div>
              <span className="kp-eyebrow">
                {c.domain === "apparel" ? "CLOTHES" : "PLAY & LEARNING"}
              </span>
              <h2>
                {c.domain === "apparel" ? (
                  <>
                    입는 즐거움,
                    <br />
                    옷부터 골라요.
                  </>
                ) : (
                  <>
                    노는 즐거움,
                    <br />
                    따로 살펴봐요.
                  </>
                )}
              </h2>
              <p>
                {c.domain === "apparel"
                  ? "의류 품목과 사이즈 정보는 이곳에서."
                  : "상품에 확인된 정보만 안내해요."}
              </p>
            </div>
            {c.domain === "apparel" ? (
              <CampaignPhoto hero={c.hero} />
            ) : (
              <div className="kp-play-map">
                <Icon name="play" size={72} />
                <span>장난감 / 교구 / 학습</span>
                <small>발달 효과·안전 인증을 추정하지 않아요</small>
              </div>
            )}
          </div>
          <div className="kp-world-layout">
            <CategoryBar context={c} vertical />
            <section>
              <SearchField context={c} />
              <SectionTitle
                title={
                  c.domain === "apparel" ? "옷 둘러보기" : "놀이·학습 둘러보기"
                }
              />
              <PhotoFeed context={c} limit={9} />
            </section>
          </div>
        </>
      );
    case "10":
      return (
        <>
          <div className="kp-notebook-layout">
            <ChapterNav context={c} />
            <article>
              <div className="kp-notebook-title">
                <span className="kp-eyebrow">꼬까픽 쇼핑 노트</span>
                <h2>
                  작은 일상을
                  <br />
                  함께 입어요.
                </h2>
                <p>
                  사진으로 발견하고, 품목으로 좁히고,
                  <br />
                  상품 정보는 확인하며 골라요.
                </p>
              </div>
              <CampaignPhoto hero={c.hero} label />
              <section className="kp-notebook-chapter" id="kp-chapter-10-1">
                <span className="kp-eyebrow">01 / 첫 발견</span>
                <SectionTitle
                  title="마음이 가는 사진부터"
                  action="상품 색인"
                  onAction={() => c.onSurface("search")}
                />
                <ProductGrid context={c} count={4} />
              </section>
              <section className="kp-notebook-chapter" id="kp-chapter-10-2">
                <span className="kp-eyebrow">02 / 품목 둘러보기</span>
                <SectionTitle title="찾는 옷에 가까워져요" />
                <p className="kp-chapter-copy">
                  바디수트부터 외출복까지. 필요한 품목을 고르면 사진을 조금 더
                  가깝게 살펴볼 수 있어요.
                </p>
                <CategoryBar context={c} />
                <CompareList context={c} />
              </section>
              <section className="kp-notebook-chapter" id="kp-chapter-10-3">
                <span className="kp-eyebrow">03 / 상품 정보 확인</span>
                <SectionTitle title="마음에 드는 옷을 찾았다면" />
                <p className="kp-chapter-copy">
                  이름과 가격, 확인된 소재와 사이즈를 살펴보세요. 판매처 옵션은
                  마지막에 한 번 더 확인해요.
                </p>
                <SelectionCard context={c} />
                <OfferTable product={c.selected} />
              </section>
            </article>
          </div>
        </>
      );
  }
}

function SearchScene({ context }: { context: SceneContext }) {
  const c = context;
  const resultsTitle = c.query
    ? `‘${c.query}’ 찾기`
    : c.domain === "play"
      ? "놀이·학습 찾기"
      : "옷 찾기";
  const toolbar = (
    <div className="kp-results-toolbar">
      <span>
        {c.catalogFresh ? `${c.products.length}개 상품` : "최신 상품 연결 대기"}
      </span>
      <button
        type="button"
        className="kp-outline-button"
        onClick={() => c.onOverlay("filter")}
      >
        <Icon name="filter" size={16} />
        품목 필터
      </button>
    </div>
  );
  const controls = (
    <>
      <SearchField context={c} />
      <CategoryBar context={c} />
      {toolbar}
    </>
  );
  const noResults =
    c.query && !c.products.length ? (
      <p className="kp-evidence-note">
        현재 표시할 검색 결과가 없어요. 검색어를 지우거나 다른 품목을
        살펴보세요.
      </p>
    ) : null;
  switch (c.direction.id) {
    case "01":
      return (
        <>
          <SectionTitle title={resultsTitle} />
          {controls}
          {noResults}
          <div className="kp-contact-layout">
            <section>
              <PhotoFeed context={c} />
            </section>
            <SelectionCard context={c} />
          </div>
        </>
      );
    case "02":
      return (
        <>
          <div className="kp-search-banner">
            <span>오늘의 작은 옷장 / 찾아보기</span>
            <h2>{resultsTitle}</h2>
          </div>
          <div className="kp-filter-and-grid">
            <aside>
              <CategoryBar context={c} vertical />
              <button
                type="button"
                className="kp-outline-button"
                onClick={() => c.onOverlay("filter")}
              >
                조건 더 보기
              </button>
            </aside>
            <section>
              <SearchField context={c} />
              {toolbar}
              {noResults}
              <ProductGrid context={c} count={12} />
            </section>
          </div>
        </>
      );
    case "03":
      return (
        <>
          <span className="kp-eyebrow">COMPARE BY PRODUCT</span>
          <SectionTitle title={resultsTitle} />
          {controls}
          {noResults}
          <div className="kp-desk-layout">
            <CompareList context={c} />
            <aside>
              <h3>선택 상품 비교</h3>
              <ProductFacts product={c.selected} />
              <OfferTable product={c.selected} />
            </aside>
          </div>
        </>
      );
    case "04":
      return (
        <>
          <ChildStrip context={c} />
          <div className="kp-fit-search-heading">
            <h2>{resultsTitle}</h2>
            <p>아이를 선택해도 모든 옷을 둘러볼 수 있어요.</p>
          </div>
          {controls}
          {noResults}
          <div className="kp-fit-results">
            <ProductGrid context={c} count={9} />
            <aside className="kp-evidence-panel">
              <Icon name="person" size={27} />
              <h3>사이즈는 근거부터</h3>
              <p>
                공식 사이즈 표가 있는지, 상품 옵션은 확인됐는지 따로 안내해요.
              </p>
              <button
                type="button"
                className="kp-text-button"
                onClick={() => c.onOverlay("children")}
              >
                선택 아이 확인
              </button>
            </aside>
          </div>
        </>
      );
    case "05":
      return (
        <>
          <div className="kp-wardrobe-heading">
            <span className="kp-eyebrow">옷장 / {c.category}</span>
            <h2>{resultsTitle}</h2>
          </div>
          <div className="kp-wardrobe-layout">
            <CategoryBar context={c} vertical />
            <section>
              <SearchField context={c} />
              {toolbar}
              {noResults}
              <div className="kp-category-result-label">
                {c.category === "전체" ? "의류 품목 전체" : c.category}
              </div>
              <ProductGrid context={c} count={12} />
            </section>
          </div>
        </>
      );
    case "06":
      return (
        <>
          <div className="kp-brand-search-title">
            <span className="kp-eyebrow">BRAND / CATALOG</span>
            <h2>{c.query || "브랜드와 상품 찾기"}</h2>
            <button
              type="button"
              className="kp-text-button"
              onClick={() => c.onOverlay("brands")}
            >
              브랜드 색인
            </button>
          </div>
          {controls}
          {noResults}
          <ProductGrid context={c} count={12} />
        </>
      );
    case "07":
      return (
        <>
          <div className="kp-command-search">
            <h2>찾는 옷을 더 가까이.</h2>
            <SearchField context={c} large />
            <div className="kp-condition-summary">
              <span>영역: {c.domain === "apparel" ? "의류" : "놀이·학습"}</span>
              <span>품목: {c.category}</span>
              <button type="button" onClick={() => c.onOverlay("filter")}>
                조건 바꾸기
                <Icon name="filter" size={15} />
              </button>
            </div>
          </div>
          <div className="kp-filter-and-grid">
            <aside>
              <CategoryBar context={c} vertical />
            </aside>
            <section>
              {toolbar}
              {noResults}
              <PhotoFeed context={c} />
              <SelectionCard context={c} />
            </section>
          </div>
        </>
      );
    case "08":
      return (
        <>
          <div className="kp-board-top">
            <h2>{resultsTitle}</h2>
            <button
              type="button"
              className="kp-outline-button"
              onClick={() => c.onOverlay("saved")}
            >
              담은 옷 {c.saved.length}
            </button>
          </div>
          {controls}
          {noResults}
          <div className="kp-board-search">
            <ProductGrid context={c} count={12} />
            <aside className="kp-saved-drawer">
              <h3>찾다가 담아두기</h3>
              <p>찜해둔 옷은 검색을 마친 뒤에도 다시 확인할 수 있어요.</p>
              <button
                type="button"
                className="kp-text-button"
                onClick={() => c.onOverlay("saved")}
              >
                담은 옷 확인
              </button>
            </aside>
          </div>
        </>
      );
    case "09":
      return (
        <>
          <DomainSwitch context={c} />
          <SectionTitle
            title={resultsTitle}
            subtitle={
              c.domain === "apparel"
                ? "의류 정보로 찾기"
                : "놀이·학습 정보로 찾기"
            }
          />
          {controls}
          {c.domain === "play" && (
            <div className="kp-domain-note">
              <Icon name="play" size={22} />
              확인된 연령·소재가 있을 때만 보여드려요. 의류 사이즈 필터는
              적용하지 않아요.
            </div>
          )}
          {noResults}
          <ProductGrid context={c} count={12} />
        </>
      );
    case "10":
      return (
        <>
          <div className="kp-index-header">
            <button
              type="button"
              className="kp-text-button"
              onClick={() => c.onSurface("home")}
            >
              쇼핑 노트로 돌아가기
            </button>
            <h2>
              사진 속 발견,
              <br />
              상품 색인에서.
            </h2>
            <span className="kp-eyebrow">PRODUCT INDEX</span>
          </div>
          {controls}
          {noResults}
          <div className="kp-notebook-index">
            <CompareList context={c} />
          </div>
        </>
      );
  }
}

function ImageGallery({
  context,
  wide = false,
}: {
  context: SceneContext;
  wide?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const touchOrigin = useRef<{ x: number; y: number } | null>(null);
  const photos = context.selected
    ? context.selected.imageUrls?.length
      ? context.selected.imageUrls
      : context.selected.imageUrl
        ? [context.selected.imageUrl]
        : []
    : context.hero
      ? [context.hero]
      : [];
  useEffect(() => {
    setIndex(0);
    setFailed(false);
  }, [context.selected?.id]);
  const changePhoto = (next: number) => {
    setIndex(Math.max(0, Math.min(next, photos.length - 1)));
    setFailed(false);
  };
  return (
    <section
      className={`kp-detail-gallery ${wide ? "is-wide" : ""}`}
      aria-label="상품 사진 갤러리"
    >
      <div
        className="kp-gallery-image"
        onTouchStart={(event) => {
          touchOrigin.current = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          };
        }}
        onTouchEnd={(event) => {
          if (!touchOrigin.current || !event.changedTouches[0]) return;
          const dx = event.changedTouches[0].clientX - touchOrigin.current.x;
          const dy = event.changedTouches[0].clientY - touchOrigin.current.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5)
            changePhoto(index + (dx < 0 ? 1 : -1));
          touchOrigin.current = null;
        }}
      >
        {photos[index] && !failed ? (
          <img
            src={photos[index]}
            alt={
              context.selected
                ? `${context.selected.name} 사진 ${index + 1}`
                : "승인 브랜드 캠페인. 실제 판매 상품이 아닙니다."
            }
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="kp-image-unavailable">사진을 불러오지 못했어요</div>
        )}
      </div>
      {photos.length > 1 && (
        <div className="kp-gallery-dots" aria-label="사진 선택">
          {photos.map((_, dot) => (
            <button
              type="button"
              key={dot}
              aria-label={`사진 ${dot + 1} 보기`}
              aria-pressed={dot === index}
              onClick={() => changePhoto(dot)}
            >
              <span />
            </button>
          ))}
          <span className="kp-visually-hidden" aria-live="polite">
            사진 {index + 1} / {photos.length}
          </span>
        </div>
      )}
      {!context.selected && (
        <span className="kp-campaign-credit">
          캠페인 이미지 · 실제 상품 아님
        </span>
      )}
    </section>
  );
}

function FitEvidence({ context }: { context: SceneContext }) {
  const verified =
    context.selected?.fitStatus === "verified" && !!context.selected.fitSource;
  return (
    <section className="kp-fit-evidence">
      <div>
        <Icon name="person" size={21} />
        <h3>아이별 사이즈 확인</h3>
      </div>
      <button
        type="button"
        className="kp-text-button"
        onClick={() => context.onOverlay("children")}
      >
        아이 선택
      </button>
      <p>
        {verified
          ? "공식 브랜드 사이즈 표가 확인됐어요. 아이 정보 입력 후 안내할 수 있어요."
          : "이 상품의 공식 사이즈 근거가 확인되면 안내할 수 있어요."}
      </p>
      <small>
        안내와 판매처 실제 옵션은 다를 수 있어요. 최종 옵션을 확인해 주세요.
      </small>
      {context.childSelection.length > 0 && (
        <ul className="kp-child-evidence-list">
          {context.childSelection.map((child) => (
            <li key={child}>
              <strong>아이 {child}</strong>
              <span>
                선택 화면 예시 · 아이 정보 입력 전이라 사이즈를 추천하지 않아요.
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DetailActions({ context }: { context: SceneContext }) {
  const [alertOn, setAlertOn] = useState(false);
  return (
    <div className="kp-detail-actions">
      <button
        type="button"
        className="kp-outline-button"
        disabled={!context.selected}
        aria-pressed={
          !!context.selected && context.saved.includes(context.selected.id)
        }
        onClick={() => context.selected && context.onSave(context.selected.id)}
      >
        <Icon name="heart" size={18} />
        {context.selected && context.saved.includes(context.selected.id)
          ? "찜한 상품"
          : "찜하기"}
      </button>
      <button
        type="button"
        className="kp-primary-button"
        disabled={!context.selected}
        aria-pressed={alertOn}
        onClick={() => setAlertOn((value) => !value)}
      >
        {alertOn ? "알림 화면 예시 켜짐" : "가격 내려가면 알림"}
      </button>
      <span className="kp-action-note">
        디자인 검토용 상태 · 실제 알림을 설정하지 않습니다
      </span>
    </div>
  );
}

function DetailScene({ context }: { context: SceneContext }) {
  const c = context;
  const facts = (
    <>
      <ProductFacts product={c.selected} />
      <DetailActions context={c} />
    </>
  );
  const fit =
    c.domain === "apparel" ? (
      <FitEvidence context={c} />
    ) : (
      <div className="kp-domain-note">
        <Icon name="play" />
        놀이·학습 상품은 확인된 상품 정보만 안내합니다.
      </div>
    );
  const back = (
    <button
      type="button"
      className="kp-back-link"
      onClick={() => c.onSurface("home")}
    >
      <span aria-hidden="true">←</span>
      {c.direction.id === "10"
        ? "쇼핑 노트로"
        : c.direction.id === "06"
          ? "브랜드 진열장으로"
          : c.direction.id === "08"
            ? "보드로"
            : "사진 탐색으로"}
    </button>
  );
  switch (c.direction.id) {
    case "01":
      return (
        <>
          {back}
          <div className="kp-detail-contact">
            <ImageGallery context={c} />
            <div className="kp-detail-info">
              {facts}
              {fit}
              <OfferTable product={c.selected} />
            </div>
          </div>
        </>
      );
    case "02":
      return (
        <>
          {back}
          <div className="kp-detail-showroom">
            <ImageGallery context={c} wide />
            <div>
              <span className="kp-eyebrow">THE LITTLE WARDROBE</span>
              {facts}
              <OfferTable product={c.selected} />
              {fit}
            </div>
          </div>
        </>
      );
    case "03":
      return (
        <>
          {back}
          <div className="kp-detail-desk">
            <div>
              <ImageGallery context={c} />
              {facts}
            </div>
            <div>
              <span className="kp-eyebrow">OFFER COMPARISON</span>
              <h2>판매처를 나란히.</h2>
              <OfferTable product={c.selected} />
              {fit}
            </div>
          </div>
        </>
      );
    case "04":
      return (
        <>
          {back}
          <ChildStrip context={c} />
          <div className="kp-detail-fit">
            <ImageGallery context={c} />
            <div>{facts}</div>
          </div>
          <div className="kp-fit-detail-band">
            {fit}
            <OfferTable product={c.selected} />
          </div>
        </>
      );
    case "05":
      return (
        <>
          {back}
          <div className="kp-wardrobe-detail-path">
            옷장 <span>/</span> {c.selected?.category || c.category}
          </div>
          <div className="kp-detail-wardrobe">
            <aside>
              <CategoryBar context={c} vertical />
            </aside>
            <ImageGallery context={c} />
            <div>
              {facts}
              {fit}
              <OfferTable product={c.selected} />
            </div>
          </div>
        </>
      );
    case "06":
      return (
        <>
          {back}
          <div className="kp-detail-brand-heading">
            <span className="kp-eyebrow">BRAND PROFILE</span>
            <h2>{c.selected?.brand || "브랜드 확인 전"}</h2>
            <button
              type="button"
              className="kp-text-button"
              onClick={() => c.onOverlay("brands")}
            >
              다른 브랜드 찾기
            </button>
          </div>
          <div className="kp-detail-brand">
            <ImageGallery context={c} />
            <div>
              {facts}
              {fit}
            </div>
          </div>
          <OfferTable product={c.selected} />
        </>
      );
    case "07":
      return (
        <>
          <div className="kp-detail-query">
            <SearchField context={c} />
            <button
              type="button"
              className="kp-text-button"
              onClick={() => c.onSurface("search")}
            >
              검색 결과로
            </button>
          </div>
          <div className="kp-detail-command">
            <ImageGallery context={c} />
            <div>
              {facts}
              <OfferTable product={c.selected} />
              {fit}
            </div>
          </div>
        </>
      );
    case "08":
      return (
        <>
          {back}
          <div className="kp-detail-board">
            <ImageGallery context={c} wide />
            <aside>
              <span className="kp-eyebrow">마음에 담기 전에</span>
              {facts}
              {fit}
              <OfferTable product={c.selected} />
              <button
                type="button"
                className="kp-text-button"
                onClick={() => c.onOverlay("saved")}
              >
                담은 옷 보기
              </button>
            </aside>
          </div>
        </>
      );
    case "09":
      return (
        <>
          <DomainSwitch context={c} />
          {back}
          <div className="kp-detail-world">
            <ImageGallery context={c} />
            <div>
              <span className="kp-eyebrow">
                {c.domain === "apparel" ? "의류 정보" : "놀이·학습 정보"}
              </span>
              {facts}
              {fit}
              <OfferTable product={c.selected} />
            </div>
          </div>
        </>
      );
    case "10":
      return (
        <>
          {back}
          <div className="kp-detail-notebook">
            <div className="kp-detail-notebook-title">
              <span className="kp-eyebrow">쇼핑 노트 / 상품 확인</span>
              <h2>
                사진에서 발견한
                <br />한 가지.
              </h2>
            </div>
            <ImageGallery context={c} wide />
            <div className="kp-notebook-facts">
              {facts}
              <OfferTable product={c.selected} />
              {fit}
            </div>
          </div>
        </>
      );
  }
}

function ReviewDialog({
  kind,
  context,
  device,
  onClose,
}: {
  kind: OverlayKind;
  context: SceneContext;
  device: Device;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [draftChildren, setDraftChildren] = useState(context.childSelection);
  const [draftCategory, setDraftCategory] = useState(context.category);
  const [draftDomain, setDraftDomain] = useState(context.domain);
  const titles: Record<OverlayKind, string> = {
    filter: "조건을 골라요",
    children: "함께 고를 아이",
    category: "품목 둘러보기",
    brands: "브랜드 색인",
    saved: "담은 옷",
    chapters: "쇼핑 노트 목차",
    product: "선택한 상품",
  };
  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
      window.requestAnimationFrame(() => {
        if (previousFocus.current?.isConnected) previousFocus.current.focus();
        else
          document
            .querySelector<HTMLButtonElement>(
              ".kp-proposal-screen .kp-back-link, .kp-proposal-screen .kp-brand",
            )
            ?.focus();
      });
    };
  }, []);
  const savedProducts = context.catalogProducts.filter((product) =>
    context.saved.includes(product.id),
  );
  return (
    <dialog
      ref={dialog}
      className={`kp-review-dialog kp-dialog-${kind} direction-${context.direction.id} preview-${device}`}
      aria-labelledby="kp-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const focusable = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            "button, input, a[href], [tabindex]",
          ),
        ).filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.hasAttribute("disabled") &&
            element.getClientRects().length > 0,
        );
        const target = event.shiftKey ? focusable.at(-1) : focusable[0];
        const boundary = event.shiftKey ? focusable[0] : focusable.at(-1);
        if (target && document.activeElement === boundary) {
          event.preventDefault();
          target.focus();
        }
      }}
      style={{ "--kp-accent": context.direction.accent } as CSSProperties}
    >
      <header>
        <div>
          <span className="kp-eyebrow">{context.direction.overlay}</span>
          <h2 id="kp-dialog-title">{titles[kind]}</h2>
        </div>
        <button
          type="button"
          className="kp-icon-button"
          aria-label="닫기"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </header>
      <div className="kp-dialog-body">
        {kind === "filter" && (
          <>
            <p>영역과 품목을 골라 결과를 좁혀요.</p>
            <fieldset>
              <legend>탐색 영역</legend>
              <div className="kp-choice-grid">
                {(
                  [
                    ["apparel", "의류"],
                    ["play", "놀이·학습"],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name="proposal-domain"
                      checked={draftDomain === value}
                      onChange={() => {
                        setDraftDomain(value);
                        setDraftCategory("전체");
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>품목</legend>
              <div className="kp-choice-grid">
                {(draftDomain === "play"
                  ? playCategories
                  : clothingCategories
                ).map((category) => (
                  <label key={category}>
                    <input
                      type="radio"
                      name="proposal-category"
                      checked={draftCategory === category}
                      onChange={() => setDraftCategory(category)}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="kp-evidence-note">
              브랜드·사이즈·소재 조건은 실제 데이터가 있을 때 제공됩니다.
              확인되지 않은 조건은 추가하지 않습니다.
            </p>
          </>
        )}
        {kind === "children" && (
          <>
            <p>여러 아이를 함께 선택하는 화면 예시입니다.</p>
            <fieldset>
              <legend>검토용 아이 선택</legend>
              {[1, 2].map((child) => (
                <label className="kp-child-option" key={child}>
                  <input
                    type="checkbox"
                    checked={draftChildren.includes(child)}
                    onChange={() =>
                      setDraftChildren((value) =>
                        value.includes(child)
                          ? value.filter((item) => item !== child)
                          : [...value, child],
                      )
                    }
                  />
                  <span>
                    <strong>아이 {child}</strong>
                    <small>이름·월령·키·몸무게 입력 전</small>
                  </span>
                </label>
              ))}
            </fieldset>
            <p className="kp-evidence-note">
              화면 예시만 선택합니다. 아이 개인정보를 입력하거나 저장하지
              않습니다. 공식 사이즈 근거가 없는 상품에 추천을 만들지 않습니다.
            </p>
          </>
        )}
        {kind === "category" && (
          <>
            <DomainSwitch context={context} />
            <CategoryBar context={context} vertical />
            <p className="kp-evidence-note">
              품목 선택은 현재 영역 안에 유지됩니다.
            </p>
          </>
        )}
        {kind === "brands" && <BrandIndex context={context} />}
        {kind === "saved" && (
          <>
            {savedProducts.length ? (
              <div className="kp-product-grid">
                {savedProducts.map((product, index) => (
                  <ProductCard
                    product={product}
                    key={product.id}
                    context={context}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="kp-empty">
                <Icon name="heart" size={40} />
                <h3>아직 담은 옷이 없어요.</h3>
                <p>사진을 열어 마음에 드는 상품을 찜해두세요.</p>
                <button
                  type="button"
                  className="kp-primary-button"
                  onClick={onClose}
                >
                  둘러보기
                </button>
              </div>
            )}
          </>
        )}
        {kind === "chapters" && <ChapterNav context={context} />}
        {kind === "product" && (
          <>
            <ImageGallery context={context} />
            <ProductFacts product={context.selected} />
            <DetailActions context={context} />
            <OfferTable product={context.selected} />
            <button
              type="button"
              className="kp-text-button"
              onClick={() => {
                context.onSurface("detail");
                onClose();
              }}
            >
              전체 상품 정보 보기
              <Icon name="arrow" size={17} />
            </button>
          </>
        )}
      </div>
      {(kind === "filter" || kind === "children") && (
        <footer>
          <button type="button" className="kp-outline-button" onClick={onClose}>
            닫기
          </button>
          <button
            type="button"
            className="kp-primary-button"
            onClick={() => {
              if (kind === "filter") {
                if (draftDomain !== context.domain)
                  context.onDomain(draftDomain);
                context.onCategory(draftCategory);
              } else context.onChildSelection(draftChildren);
              onClose();
            }}
          >
            {kind === "filter" ? "조건 적용" : "선택 예시 적용"}
          </button>
        </footer>
      )}
    </dialog>
  );
}

function DirectionSketch({ id }: { id: ProposalId }) {
  return (
    <span className={`kp-direction-sketch sketch-${id}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export function ProposalGallery({
  products = [],
  catalogStatus = "unavailable",
  catalogExpiresAt,
  heroImageUrl,
}: ProposalGalleryProps) {
  const initial = useRef(readReviewLocation()).current;
  const [directionId, setDirectionId] = useState<ProposalId>(initial.id);
  const [surface, setSurface] = useState<ProposalSurface>(initial.surface);
  const [device, setDevice] = useState<Device>(initial.device);
  const [overlay, setOverlay] = useState<OverlayKind | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [domain, setDomain] = useState<Domain>("apparel");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [saved, setSaved] = useState<string[]>([]);
  const [childSelection, setChildSelection] = useState<number[]>([]);
  const [now, setNow] = useState(Date.now());
  const direction = directions.find((item) => item.id === directionId)!;
  const hasFreshData =
    catalogStatus === "fresh" &&
    !!catalogExpiresAt &&
    Date.parse(catalogExpiresAt) > now;
  const safeProducts = hasFreshData ? products : [];
  const domainProducts = safeProducts.filter((product) =>
    domain === "play" ? isPlayProduct(product) : !isPlayProduct(product),
  );
  const filteredProducts = domainProducts.filter(
    (product) =>
      (category === "전체" || product.category === category) &&
      (!query ||
        `${product.name} ${product.brand || ""} ${product.category || ""}`
          .toLocaleLowerCase("ko-KR")
          .includes(query.toLocaleLowerCase("ko-KR"))),
  );
  const selected =
    (surface === "detail" ? domainProducts : filteredProducts).find(
      (product) => product.id === selectedId,
    ) || filteredProducts[0];
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!catalogExpiresAt || !Number.isFinite(Date.parse(catalogExpiresAt)))
      return;
    const delay = Math.max(0, Date.parse(catalogExpiresAt) - Date.now() + 1);
    const timer = window.setTimeout(
      () => setNow(Date.now()),
      Math.min(delay, 2147483647),
    );
    return () => window.clearTimeout(timer);
  }, [catalogExpiresAt]);
  useEffect(() => {
    const titles: Record<ProposalSurface, string> = {
      home: "홈·발견",
      search: "찾기·검색",
      detail: "상품 상세",
    };
    document.title = `꼬까픽 시안 ${direction.id} ${direction.name} · ${titles[surface]}`;
  }, [direction, surface]);
  useEffect(() => {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#/proposals?proposal=${directionId}&surface=${surface}&device=${device}`,
    );
  }, [directionId, surface, device]);
  const onDirection = (id: ProposalId) => {
    setDirectionId(id);
    setOverlay(null);
    setCategory("전체");
    setQuery("");
    setDomain("apparel");
    setSelectedId(undefined);
  };
  const context: SceneContext = {
    direction,
    products: filteredProducts,
    catalogProducts: safeProducts,
    catalogFresh: hasFreshData,
    hero: heroImageUrl,
    selected,
    onSelect: (product) => {
      setSelectedId(product?.id);
      if (product && (isPlayProduct(product) ? "play" : "apparel") !== domain) {
        setDomain(isPlayProduct(product) ? "play" : "apparel");
        setCategory("전체");
        setQuery("");
      }
      if (overlay === "saved" || ["02", "08"].includes(directionId))
        setOverlay("product");
      else if (["01", "07"].includes(directionId)) {
        const width =
          document.querySelector(".kp-proposal-screen")?.clientWidth || 390;
        if (width < 680) setOverlay("product");
        else
          window.requestAnimationFrame(() =>
            document
              .querySelector(".kp-selection-card")
              ?.scrollIntoView({ block: "nearest", behavior: "auto" }),
          );
      } else if (directionId === "03")
        window.requestAnimationFrame(() =>
          document
            .querySelector(".kp-desk-layout > aside")
            ?.scrollIntoView({ block: "nearest", behavior: "auto" }),
        );
      else {
        setSurface("detail");
        setOverlay(null);
        window.requestAnimationFrame(() =>
          document
            .querySelector(".kp-proposal-screen")
            ?.scrollIntoView({ block: "start", behavior: "auto" }),
        );
      }
    },
    onSurface: (value) => {
      setSurface(value);
      setOverlay(null);
    },
    onOverlay: setOverlay,
    category,
    onCategory: setCategory,
    domain,
    onDomain: (value) => {
      setDomain(value);
      setCategory("전체");
      setQuery("");
      setSelectedId(undefined);
    },
    saved,
    onSave: (id) =>
      setSaved((value) =>
        value.includes(id)
          ? value.filter((item) => item !== id)
          : [...value, id],
      ),
    query,
    onQuery: setQuery,
    childSelection,
    onChildSelection: setChildSelection,
  };
  const overlayKinds: Record<ProposalId, OverlayKind> = {
    "01": "filter",
    "02": "product",
    "03": "filter",
    "04": "children",
    "05": "category",
    "06": "brands",
    "07": "filter",
    "08": "saved",
    "09": "category",
    "10": "chapters",
  };
  return (
    <main className="kp-proposal-gallery">
      <header className="kp-review-header">
        <a className="kp-review-home" href="#/proposals">
          KKOKKAPICK <span>DESIGN REVIEW</span>
        </a>
        <span className="kp-review-status">
          제안 10개 · 아직 선택되지 않았습니다
        </span>
      </header>
      <section className="kp-review-intro">
        <div>
          <span className="kp-review-eyebrow">
            새 React 웹 / 제품 디자인 선택
          </span>
          <h1>
            사진을 발견하는
            <br />열 가지 방식.
          </h1>
          <p>
            같은 서비스, 서로 다른 탐색 흐름. 홈·찾기·상세와 열린 화면까지
            비교해 주세요.
          </p>
        </div>
        <div className="kp-review-recommendation">
          <span>팀 추천 · 선택 전</span>
          <strong>01 사진으로 쏙쏙</strong>
          <p>
            간격 없는 3×4 사진판과 선택 상품 카드가 요청하신 탐색 흐름에 가장
            가깝습니다.
          </p>
          <button type="button" onClick={() => onDirection("01")}>
            추천안 둘러보기 <Icon name="arrow" size={16} />
          </button>
        </div>
      </section>
      <nav className="kp-direction-picker" aria-label="디자인 제안 10개">
        {directions.map((item) => (
          <button
            key={item.id}
            type="button"
            className={directionId === item.id ? "is-current" : ""}
            onClick={() => onDirection(item.id)}
            aria-pressed={directionId === item.id}
            style={{ "--kp-sketch-accent": item.accent } as CSSProperties}
          >
            <DirectionSketch id={item.id} />
            <span className="kp-direction-number">{item.id}</span>
            <strong>{item.name}</strong>
            <span>{item.englishName}</span>
          </button>
        ))}
      </nav>
      <section
        className="kp-review-workspace"
        aria-label={`${direction.id}번 ${direction.name} 디자인 검토`}
      >
        <div className="kp-review-controls">
          <div className="kp-surface-picker" aria-label="검토할 화면">
            {(
              [
                { id: "home", label: "홈·발견" },
                { id: "search", label: "찾기·검색" },
                { id: "detail", label: "상품 상세" },
              ] as const
            ).map((item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={surface === item.id}
                onClick={() => {
                  setSurface(item.id);
                  setOverlay(null);
                }}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className="kp-open-pattern"
              onClick={() => setOverlay(overlayKinds[directionId])}
            >
              열린 화면 보기 <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="kp-device-picker" aria-label="미리보기 너비">
            <button
              type="button"
              aria-pressed={device === "mobile"}
              onClick={() => setDevice("mobile")}
            >
              휴대폰
            </button>
            <button
              type="button"
              aria-pressed={device === "desktop"}
              onClick={() => setDevice("desktop")}
            >
              데스크톱
            </button>
          </div>
        </div>
        <div className="kp-selected-direction">
          <div>
            <span>
              {direction.id} / {direction.englishName}
            </span>
            <h2>{direction.name}</h2>
            <p>{direction.thesis}</p>
          </div>
          <span className="kp-layout-note">{direction.surfaces[surface]}</span>
        </div>
        <div className={`kp-preview-mat device-${device}`}>
          <div
            className={`kp-proposal-screen direction-${directionId} screen-${surface}`}
            style={{ "--kp-accent": direction.accent } as CSSProperties}
          >
            <header className="kp-app-header">
              <button
                type="button"
                className="kp-brand"
                onClick={() => context.onSurface("home")}
                aria-label="꼬까픽 홈"
              >
                <span className="kp-brand-mark" aria-hidden="true">
                  <span />
                  <span />
                </span>
                꼬까픽
              </button>
              <nav aria-label="주요 화면">
                <button
                  type="button"
                  onClick={() => context.onSurface("search")}
                  aria-label="상품 찾기"
                >
                  <Icon name="search" />
                </button>
                <button
                  type="button"
                  onClick={() => context.onOverlay("saved")}
                  aria-label={`찜한 상품 ${saved.length}개`}
                >
                  <Icon name="heart" />
                </button>
                <button
                  type="button"
                  onClick={() => context.onOverlay("children")}
                  aria-label="아이 선택 화면"
                >
                  <Icon name="person" />
                </button>
              </nav>
            </header>
            <div className="kp-data-notice" role="status">
              {hasFreshData
                ? `현재 유효한 실제 카탈로그 · ${safeProducts.length}개 상품`
                : "최신 카탈로그 연결 전 · 캠페인으로 구성만 검토합니다. 상품·가격을 만들지 않습니다."}
            </div>
            <div className="kp-app-content">
              {surface === "home" ? (
                <HomeScene context={context} />
              ) : surface === "search" ? (
                <SearchScene context={context} />
              ) : (
                <DetailScene context={context} />
              )}
            </div>
            <nav className="kp-bottom-nav" aria-label="앱 주요 목적지">
              <button
                type="button"
                aria-current={surface === "home" ? "page" : undefined}
                onClick={() => context.onSurface("home")}
              >
                <Icon name={directionId === "10" ? "book" : "home"} />
                <span>{directionId === "10" ? "이야기" : "홈"}</span>
              </button>
              <button
                type="button"
                aria-current={surface === "search" ? "page" : undefined}
                onClick={() => context.onSurface("search")}
              >
                <Icon name="search" />
                <span>{directionId === "10" ? "상품 색인" : "찾기"}</span>
              </button>
              <button type="button" onClick={() => context.onOverlay("saved")}>
                <Icon name="heart" />
                <span>찜</span>
              </button>
              <button
                type="button"
                onClick={() => context.onOverlay("children")}
              >
                <Icon name="person" />
                <span>마이</span>
              </button>
            </nav>
          </div>
        </div>
        <div className="kp-review-notes">
          <div>
            <h3>왜 이 구조인가</h3>
            <p>{direction.rationale}</p>
            <h3>핵심 장면</h3>
            <p>{direction.signature}</p>
          </div>
          <dl>
            <dt>정보 순서</dt>
            <dd>{direction.hierarchy}</dd>
            <dt>이동 방식</dt>
            <dd>{direction.navigation}</dd>
            <dt>휴대폰과 데스크톱</dt>
            <dd>{direction.responsive}</dd>
            <dt>접근성</dt>
            <dd>{direction.accessibility}</dd>
            <dt>구현 시 확인할 점</dt>
            <dd>{direction.risk}</dd>
            <dt>열린 화면</dt>
            <dd>{direction.overlay}</dd>
          </dl>
        </div>
      </section>
      <footer className="kp-review-footer">
        검토 중인 안을 보는 것은 디자인 선택이 아닙니다. 선택된 제안 번호가
        확인된 뒤 제작 화면을 다듬습니다.
      </footer>
      {overlay && (
        <ReviewDialog
          kind={overlay}
          key={overlay}
          context={context}
          device={device}
          onClose={() => setOverlay(null)}
        />
      )}
    </main>
  );
}

export default ProposalGallery;
