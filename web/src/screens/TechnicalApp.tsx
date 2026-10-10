import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  Heart,
  Home,
  Search,
  UserRound,
  X,
  SlidersHorizontal,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Button as UiButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CommerceGallery, PhotoFeed } from "@/components/commerce-gallery";
import { useKkokkapick } from "@/components/catalog-provider";
import { useInfiniteCatalog } from "@/hooks/use-infinite-catalog";
import { evaluateFit, queryProducts } from "@/domain";
import type {
  ChildProfileInput,
  ClientProduct,
  DiscoveryProduct,
  QueryOptions,
} from "@/domain";
import { sellerUrl, sourceTime, won } from "@/lib/format";
import hero from "../../../assets/hero-proposals/hero-3.webp";

function readPriceBounds(
  minText: string,
  maxText: string,
): { min?: number; max?: number; error?: string; field?: "min" | "max" } {
  const values = { min: minText.trim(), max: maxText.trim() };
  for (const field of ["min", "max"] as const) {
    if (
      values[field] &&
      (!Number.isFinite(Number(values[field])) || Number(values[field]) < 0)
    )
      return { error: "가격은 0 이상의 숫자로 입력해 주세요.", field };
  }
  const min = Number(values.min) || undefined;
  const max = Number(values.max) || undefined;
  if (min && max && max < min)
    return { error: "최대 가격은 최소 가격 이상이어야 해요.", field: "max" };
  return { min, max };
}

function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const choices =
    value && !options.includes(value) ? [...options, value] : options;
  return (
    <SelectRoot value={value || "전체"} onValueChange={onChange}>
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" className="select-popup">
        {choices.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}

function Favorite({ id }: { id: string }) {
  const { records } = useKkokkapick();
  const saved = records.favorites.includes(id);
  return (
    <UiButton
      type="button"
      size="icon"
      variant="outline"
      className="favorite-toggle"
      aria-label={saved ? "찜 해제" : "찜하기"}
      aria-pressed={saved}
      onClick={() => {
        if (records.toggleFavorite(id))
          toast(saved ? "찜을 해제했어요" : "상품을 찜했어요");
      }}
    >
      <Heart aria-hidden="true" fill={saved ? "currentColor" : "none"} />
    </UiButton>
  );
}

function ProductCard({
  product,
  onOpen,
}: {
  product: DiscoveryProduct;
  onOpen: (product: ClientProduct, photo?: boolean) => void;
}) {
  const sellerCount = new Set(
    product.offers.map((offer) => offer.merchant).filter(Boolean),
  ).size;
  return (
    <article className="commerce-card" data-product-card={product.id}>
      <CommerceGallery product={product} compact />
      <Favorite id={product.id} />
      <button
        type="button"
        className="product-open"
        data-product={product.id}
        onClick={() => onOpen(product)}
      >
        <span className="product-brand">
          {product.brand || product.merchant}
        </span>
        <span className="product-name">{product.displayName}</span>
        <span className="product-price">{won(product.price)}</span>
        <span className="product-note">
          {sellerCount > 1
            ? `${sellerCount}개 판매처 · 가격 비교`
            : "판매처에서 옵션 확인"}
        </span>
      </button>
    </article>
  );
}

function ChildManager({
  open,
  onOpenChange,
  returnFocus,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  returnFocus: () => void;
}) {
  const { records, drafts, setDrafts } = useKkokkapick();
  const [editing, setEditing] = useState(records.activeChild?.id || "new");
  const [formError, setFormError] = useState("");
  const [remove, setRemove] = useState<string | null>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) {
      setEditing(records.activeChild?.id || "new");
      setFormError("");
    }
    wasOpen.current = open;
  }, [open, records.activeChild?.id]);
  const base = records.children.find((child) => child.id === editing);
  const value: ChildProfileInput = drafts.child[editing] ||
    base || { name: "", months: "", height: "", weight: "" };
  const change = (field: keyof ChildProfileInput, next: string) =>
    setDrafts((saved) => ({
      ...saved,
      child: { ...saved.child, [editing]: { ...value, [field]: next } },
    }));
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="commerce-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocus();
          }}
        >
          <DialogHeader>
            <DialogTitle>우리 아이 정보</DialogTitle>
            <DialogDescription>
              선택한 아이를 기준으로 공식 사이즈표를 확인해요. 정보는 이
              기기에만 저장됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="child-pickers">
            {records.children.map((child) => (
              <UiButton
                key={child.id}
                variant={editing === child.id ? "default" : "outline"}
                onClick={() => {
                  if (records.selectChild(child.id)) {
                    setEditing(child.id);
                    setFormError("");
                  }
                }}
              >
                {child.name}
              </UiButton>
            ))}
            <UiButton
              variant="outline"
              onClick={() => {
                setEditing("new");
                setFormError("");
              }}
            >
              <Plus aria-hidden="true" />
              아이 추가
            </UiButton>
          </div>
          <form
            noValidate
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.nativeEvent.isComposing)
                event.preventDefault();
            }}
            onSubmit={(event) => {
              event.preventDefault();
              const rules = [
                { field: "months", min: 0, max: 180 },
                { field: "height", min: 30, max: 190 },
                { field: "weight", min: 1, max: 100 },
              ] as const;
              const invalid = rules.find((rule) => {
                const input = value[rule.field];
                return (
                  input === "" ||
                  input === null ||
                  input === undefined ||
                  (typeof input === "string" && input.trim() === "") ||
                  !Number.isFinite(Number(input)) ||
                  Number(input) < rule.min ||
                  Number(input) > rule.max ||
                  (rule.field === "months" && !Number.isInteger(Number(input)))
                );
              });
              if (invalid) {
                setFormError(
                  "월령은 0–180개월, 키는 30–190cm, 몸무게는 1–100kg 범위로 입력해 주세요.",
                );
                document.getElementById("child-" + invalid.field)?.focus();
                return;
              }
              if (
                records.saveChild(value, editing === "new" ? null : editing)
              ) {
                setDrafts((saved) => {
                  const child = { ...saved.child };
                  delete child[editing];
                  return { ...saved, child };
                });
                setFormError("");
                onOpenChange(false);
                toast("아이 정보를 저장했어요");
              }
            }}
          >
            <div className="form-field">
              <Label htmlFor="child-name">아이 별명</Label>
              <Input
                id="child-name"
                autoComplete="off"
                maxLength={20}
                value={value.name || ""}
                onChange={(event) => change("name", event.target.value)}
              />
            </div>
            {(
              [
                { field: "months", label: "월령 · 개월" },
                { field: "height", label: "키 · cm" },
                { field: "weight", label: "몸무게 · kg" },
              ] as const
            ).map((item) => (
              <div className="form-field" key={item.field}>
                <Label htmlFor={"child-" + item.field}>{item.label}</Label>
                <Input
                  id={"child-" + item.field}
                  type="number"
                  inputMode="decimal"
                  value={value[item.field] ?? ""}
                  aria-invalid={Boolean(formError)}
                  aria-describedby={formError ? "child-form-error" : undefined}
                  onChange={(event) => change(item.field, event.target.value)}
                />
              </div>
            ))}
            {formError || records.error ? (
              <p id="child-form-error" role="alert">
                {formError || records.error}
              </p>
            ) : null}
            <UiButton type="submit" className="full-width">
              아이 정보 저장
            </UiButton>
            {base ? (
              <UiButton
                type="button"
                variant="ghost"
                className="danger-link"
                onClick={() => setRemove(base.id)}
              >
                이 아이 정보 삭제
              </UiButton>
            ) : null}
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={Boolean(remove)}
        onOpenChange={(value) => {
          if (!value) setRemove(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>아이 정보를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              {records.children.find((child) => child.id === remove)?.name}의 이
              기기에 저장된 월령·키·몸무게가 삭제됩니다. 다시 입력할 수
              있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>돌아가기</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                if (remove && !records.removeChild(remove)) {
                  event.preventDefault();
                  return;
                }
                if (remove)
                  setDrafts((saved) => {
                    const child = { ...saved.child };
                    delete child[remove];
                    return { ...saved, child };
                  });
                setRemove(null);
                setEditing("new");
              }}
            >
              아이 정보 삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ProductDetail({
  product,
  photoOnly,
  onClose,
  onChild,
  opener,
}: {
  product: DiscoveryProduct | null;
  photoOnly: boolean;
  onClose: () => void;
  onChild: () => void;
  opener: RefObject<HTMLElement | null>;
}) {
  const { records, drafts, setDrafts } = useKkokkapick();
  const [priceError, setPriceError] = useState("");
  const priceRef = useRef<HTMLInputElement>(null);
  const lastProductId = useRef<string | null>(null);
  if (product) lastProductId.current = product.id;
  useEffect(() => setPriceError(""), [product?.id]);
  const value = product
    ? (drafts.price[product.id] ?? String(records.targets[product.id] || ""))
    : "";
  const offers =
    product?.offers
      .filter((offer) => Number(offer.price) > 0)
      .slice()
      .sort((a, b) => Number(a.price) - Number(b.price)) || [];
  const fit = product ? evaluateFit(records.activeChild, product) : null;
  const returnFocus = () => {
    requestAnimationFrame(() => {
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;
      const productOpener = Array.from(
        document.querySelectorAll<HTMLElement>("[data-product],[data-photo]"),
      ).find(
        (element) =>
          element.dataset.product === lastProductId.current ||
          element.dataset.photo === lastProductId.current,
      );
      (
        (opener.current?.isConnected ? opener.current : productOpener) ||
        document.querySelector<HTMLElement>(
          ".technical-nav a[aria-current='page']",
        )
      )?.focus({ preventScroll: true });
    });
  };
  return (
    <Dialog
      open={Boolean(product)}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent
        className="commerce-dialog product-dialog"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{photoOnly ? "사진 속 상품" : "상품 상세"}</DialogTitle>
          <DialogDescription>
            {product
              ? `${product.brand || product.merchant} · 판매처의 원본 정보와 가격을 확인하세요.`
              : "상품 원본을 확인해 주세요."}
          </DialogDescription>
        </DialogHeader>
        {product ? (
          <>
            <CommerceGallery product={product} />
            <p className="product-brand">{product.brand || product.merchant}</p>
            <h2>{product.displayName}</h2>
            <p className="detail-price">{won(product.minPrice)}</p>
            {fit && fit.status !== "not_applicable" ? (
              <section className="fit-information">
                <h3>
                  꼬까핏{" "}
                  {records.activeChild ? `· ${records.activeChild.name}` : ""}
                </h3>
                <p>{fit.label}</p>
                <p className="product-note">{fit.reason}</p>
                <UiButton variant="outline" onClick={onChild}>
                  아이 정보 {records.activeChild ? "수정" : "등록"}
                </UiButton>
              </section>
            ) : null}
            <section>
              <h3>판매처 가격 비교</h3>
              <ul className="seller-list">
                {offers.map((offer, index) => (
                  <li
                    key={`${offer.externalProductId || offer.merchant}-${index}`}
                  >
                    <div>
                      <span>{offer.merchant}</span>
                      <strong>{won(offer.price)}</strong>
                    </div>
                    {sellerUrl(offer.affiliateUrl) ? (
                      <UiButton variant="outline" asChild>
                        <a
                          href={sellerUrl(offer.affiliateUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          판매처 보기
                          <ArrowUpRight aria-hidden="true" />
                        </a>
                      </UiButton>
                    ) : (
                      <span>판매처 링크 확인 필요</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3>상품 정보</h3>
              <dl className="product-facts">
                <div>
                  <dt>브랜드</dt>
                  <dd>{product.brand || "판매처 확인"}</dd>
                </div>
                <div>
                  <dt>카테고리</dt>
                  <dd>{product.cat}</dd>
                </div>
                <div>
                  <dt>소재</dt>
                  <dd>
                    {product.materialConflict
                      ? "판매처별 정보가 달라요 · 각 판매처 상세페이지 확인"
                      : product.material ||
                        "정보 미제공 · 판매처 상세페이지 확인"}
                  </dd>
                </div>
                {product.domain === "apparel" ? (
                  <div>
                    <dt>실제 판매 사이즈</dt>
                    <dd>
                      {product.availableSizes.length
                        ? product.availableSizes.join(", ")
                        : "정보 미제공 · 판매처 옵션 및 실측 확인"}
                    </dd>
                  </div>
                ) : (
                  <div>
                    <dt>대상 연령</dt>
                    <dd>
                      {product.ageEvidence
                        ? `${product.ageEvidence.rawText} (${product.ageEvidence.source === "provider" ? "공급자 제공" : "상품명에 명시된 연령"}) · 실제 사용 연령 및 안전 안내는 판매처 확인`
                        : "정보 미제공 · 판매처의 사용 연령 및 안전 안내 확인"}
                    </dd>
                  </div>
                )}
              </dl>
              <details>
                <summary>판매처 원본 상품명</summary>
                <p>{product.name}</p>
              </details>
            </section>
            <form
              noValidate
              onKeyDown={(event) => {
                if (event.key === "Enter" && event.nativeEvent.isComposing)
                  event.preventDefault();
              }}
              onSubmit={(event) => {
                event.preventDefault();
                if (
                  value !== "" &&
                  (!Number.isFinite(Number(value)) || Number(value) <= 0)
                ) {
                  setPriceError(
                    "0보다 큰 희망 가격을 입력하거나 값을 비워 해제해 주세요.",
                  );
                  priceRef.current?.focus();
                  return;
                }
                if (records.saveTarget(product.id, value)) {
                  setDrafts((saved) => {
                    const price = { ...saved.price };
                    delete price[product.id];
                    return { ...saved, price };
                  });
                  setPriceError("");
                  toast(
                    value ? "희망 가격을 저장했어요" : "희망 가격을 해제했어요",
                  );
                }
              }}
            >
              <Label htmlFor="target-price">희망 가격</Label>
              <div className="target-controls">
                <Input
                  ref={priceRef}
                  id="target-price"
                  type="number"
                  inputMode="numeric"
                  aria-invalid={Boolean(priceError)}
                  aria-describedby="price-help"
                  value={value}
                  onChange={(event) => {
                    setDrafts((saved) => ({
                      ...saved,
                      price: {
                        ...saved.price,
                        [product.id]: event.target.value,
                      },
                    }));
                    setPriceError("");
                  }}
                />
                <UiButton type="submit">저장</UiButton>
              </div>
              <p
                id="price-help"
                className="product-note"
                role={priceError ? "alert" : undefined}
              >
                {priceError ||
                  "이 기기에 저장해요. 알림 발송은 로그인·백엔드 연동 후 제공됩니다."}
              </p>
            </form>
            <div className="detail-actions">
              <Favorite id={product.id} />
              {sellerUrl(offers[0]?.affiliateUrl) ? (
                <UiButton asChild>
                  <a
                    href={sellerUrl(offers[0]?.affiliateUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    판매처에서 구매하기
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </UiButton>
              ) : null}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function TechnicalApp() {
  const { state, refreshing, refreshFailed, refresh, records } =
    useKkokkapick();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const page = location.pathname.split("/").pop() || "home";
  const [childOpen, setChildOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const minParam = params.get("min") || "";
  const maxParam = params.get("max") || "";
  const [priceBounds, setPriceBounds] = useState({
    min: minParam,
    max: maxParam,
  });
  const [filterError, setFilterError] = useState("");
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);
  const childOpener = useRef<HTMLElement | null>(null);
  const productOpener = useRef<HTMLElement | null>(null);
  const openChild = () => {
    childOpener.current = document.activeElement as HTMLElement | null;
    setChildOpen(true);
  };
  const returnChildFocus = () => {
    requestAnimationFrame(() => {
      const element = childOpener.current?.isConnected
        ? childOpener.current
        : document.querySelector('.technical-nav a[aria-current="page"]');
      (element as HTMLElement | null)?.focus({ preventScroll: true });
    });
  };
  const composing = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchDraft, setSearchDraft] = useState(params.get("q") || "");
  const filter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== "전체") next.set(key, value);
    else next.delete(key);
    setParams(next);
  };
  const resetFilters = (clearSearch = false) => {
    const next = new URLSearchParams(params);
    for (const key of [
      "stage",
      "cat",
      "brand",
      "fit",
      "size",
      "seller",
      "min",
      "max",
    ])
      next.delete(key);
    if (clearSearch) next.delete("q");
    setPriceBounds({ min: "", max: "" });
    setFilterError("");
    return next;
  };
  const savedBounds = readPriceBounds(minParam, maxParam);
  const products = state?.status === "ready" ? state.products : [];
  const options: QueryOptions = {
    domain:
      params.get("domain") === "play"
        ? "play"
        : page === "wishlist" && !params.get("domain")
          ? "all"
          : "apparel",
    query: params.get("q") || "",
    stage: params.get("stage") || "전체",
    category: params.get("cat") || "전체",
    brand: params.get("brand") || "전체",
    fitOnly: params.get("fit") === "1",
    size: params.get("size") || "",
    seller: params.get("seller") || "",
    min: savedBounds.min,
    max: savedBounds.max,
    sort: ["low", "high", "drop"].includes(params.get("sort") || "")
      ? (params.get("sort") as QueryOptions["sort"])
      : "recommended",
    months: records.activeChild?.months,
    priceHistory: state?.history,
    favoritesOnly: page === "wishlist",
    favoriteIds: new Set(records.favorites),
  };
  const list = queryProducts(products, options);
  const mode = params.get("mode") === "photos" ? "photos" : "products";
  const listParams = new URLSearchParams(params);
  listParams.delete("product");
  listParams.delete("photo");
  const route = (destination: string) => ({
    pathname: `/technical/${destination}`,
    search: listParams.toString() ? `?${listParams}` : "",
  });
  const signature = `${page}|${listParams.toString()}|${records.activeChild?.id || ""}`;
  const { amount, sentinel } = useInfiniteCatalog(
    list.length,
    mode === "photos" ? 12 : 20,
    signature,
  );
  const openProduct = (product: ClientProduct, photoOnly = false) => {
    productOpener.current = document.activeElement as HTMLElement | null;
    const next = new URLSearchParams(params);
    next.set("product", product.id);
    if (photoOnly) next.set("photo", "1");
    else next.delete("photo");
    setParams(next);
    records.recordRecent(product.id);
  };
  const closeProduct = () => {
    const next = new URLSearchParams(params);
    next.delete("product");
    next.delete("photo");
    setParams(next, { replace: true });
  };
  const selected =
    products.find((product) => product.id === params.get("product")) || null;
  const domainProducts = products.filter(
    (product) =>
      options.domain === "all" ||
      (options.domain === "play"
        ? product.domain !== "apparel"
        : product.domain === "apparel"),
  );
  const categories = [
    "전체",
    ...new Set(domainProducts.map((product) => product.cat)),
  ];
  const brands = [
    "전체",
    ...new Set(
      domainProducts
        .map((product) => product.brand)
        .filter((brand): brand is string => Boolean(brand)),
    ),
  ];
  const sellers = [
    "전체",
    ...new Set(
      domainProducts.flatMap((product) =>
        product.offers.map((offer) => offer.merchant),
      ),
    ),
  ];
  const sizes = [
    "전체",
    ...new Set(domainProducts.flatMap((product) => product.availableSizes)),
  ];
  const nav = useMemo(
    () => [
      { path: "home", label: "홈", icon: Home },
      { path: "search", label: "검색", icon: Search },
      { path: "wishlist", label: "찜", icon: Heart },
      { path: "my", label: "마이", icon: UserRound },
    ],
    [],
  );

  const queryParam = params.get("q") || "";
  useEffect(() => {
    setSearchDraft(queryParam);
  }, [queryParam]);
  useEffect(() => {
    setPriceBounds({ min: minParam, max: maxParam });
    setFilterError("");
  }, [minParam, maxParam]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [signature]);
  useEffect(() => {
    document.title = `${nav.find((item) => item.path === page)?.label || "화면"} · 꼬까픽 React 전환 검토`;
  }, [nav, page]);

  if (!nav.some((item) => item.path === page))
    return (
      <main className="route-loading">
        <h1>화면을 찾을 수 없어요.</h1>
        <Link to={route("home")}>홈으로 이동</Link>
      </main>
    );

  return (
    <div className="technical-frame">
      <a className="skip-link" href="#technical-main">
        본문으로 이동
      </a>
      <header className="technical-header">
        <Link to={route("home")} className="wordmark">
          꼬까픽!
        </Link>
        <Link to="/proposals">
          새 디자인 10안 비교
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </header>
      <p className="technical-review-note">
        React 기능 전환 확인용 · 새 디자인 방향 선택 전
      </p>
      {records.error ? (
        <div className="persistent-alert" role="alert">
          {records.error}
          <UiButton
            variant="ghost"
            size="icon-sm"
            aria-label="저장 안내 닫기"
            onClick={records.clearError}
          >
            <X />
          </UiButton>
        </div>
      ) : null}
      {refreshFailed && state?.status === "ready" ? (
        <p className="persistent-alert" role="status">
          갱신에 실패했어요. 아직 표시 기한 내의 원본을 보고 있어요.
          <UiButton variant="outline" onClick={() => void refresh()}>
            다시 확인
          </UiButton>
        </p>
      ) : null}
      <main id="technical-main">
        {page === "my" ? (
          <>
            <h1>마이</h1>
            <section className="local-information">
              <h2>우리 아이 정보</h2>
              <p>
                {records.activeChild
                  ? `${records.activeChild.name} · ${records.activeChild.months}개월 · ${records.activeChild.height}cm`
                  : "아이 월령·키·몸무게로 공식 사이즈표를 확인해요."}
              </p>
              <UiButton onClick={openChild}>
                아이 정보 {records.children.length ? "관리" : "등록"}
              </UiButton>
            </section>
            <dl className="shopping-counts">
              <div>
                <dt>찜한 상품</dt>
                <dd>{records.favorites.length}</dd>
              </div>
              <div>
                <dt>최근 본 상품</dt>
                <dd>{records.recent.length}</dd>
              </div>
              <div>
                <dt>희망 가격</dt>
                <dd>{Object.keys(records.targets).length}</dd>
              </div>
            </dl>
            <section>
              <h2>나의 쇼핑</h2>
              <Link to={route("wishlist")}>찜한 상품 보기</Link>
              <h3>최근 본 상품</h3>
              {records.recent.map((id) => {
                const product = products.find(
                  (candidate) => candidate.id === id,
                );
                return product ? (
                  <UiButton
                    variant="ghost"
                    key={id}
                    onClick={() => openProduct(product)}
                  >
                    {product.displayName}
                  </UiButton>
                ) : (
                  <p key={id} className="product-note">
                    저장된 상품 · 현재 확인할 수 있는 원본이 없어요.
                  </p>
                );
              })}
              <h3>저장한 희망 가격</h3>
              {Object.entries(records.targets).map(([id, target]) => (
                <p key={id}>
                  {products.find((product) => product.id === id)?.displayName ||
                    "현재 확인할 수 없는 상품"}{" "}
                  · {won(target)}
                </p>
              ))}
            </section>
            <p className="product-note">
              찜·아이 정보·희망 가격은 이 브라우저에 저장됩니다.
            </p>
          </>
        ) : (
          <>
            {page === "home" ? (
              <section className="migration-hero">
                <img src={hero} alt="밝게 웃는 두 한국 아이" />
                <div>
                  <h1>
                    우리 아이 옷,
                    <br />
                    한곳에서 골라요.
                  </h1>
                  <Link to={route("search")}>
                    상품 둘러보기
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </div>
              </section>
            ) : (
              <h1>{page === "wishlist" ? "찜한 상품" : "상품 탐색"}</h1>
            )}
            <form
              noValidate
              className="catalog-search"
              role="search"
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  (composing.current ||
                    event.nativeEvent.isComposing ||
                    event.nativeEvent.keyCode === 229)
                )
                  event.preventDefault();
              }}
              onSubmit={(event) => {
                event.preventDefault();
                if (!composing.current) filter("q", searchDraft);
              }}
            >
              <Label htmlFor="catalog-search" className="sr-only">
                상품·브랜드·판매처 검색
              </Label>
              <Input
                ref={searchRef}
                id="catalog-search"
                type="search"
                value={searchDraft}
                placeholder="상품이나 브랜드를 검색해 보세요"
                onCompositionStart={() => {
                  composing.current = true;
                }}
                onCompositionEnd={(event) => {
                  composing.current = false;
                  filter("q", event.currentTarget.value);
                }}
                onChange={(event) => {
                  setSearchDraft(event.target.value);
                  if (!composing.current) filter("q", event.target.value);
                }}
              />
              {searchDraft ? (
                <UiButton
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="검색어 지우기"
                  onClick={() => {
                    composing.current = false;
                    setSearchDraft("");
                    filter("q", "");
                    searchRef.current?.focus();
                  }}
                >
                  <X />
                </UiButton>
              ) : null}
            </form>
            <div className="catalog-toolbar">
              <div className="mode-switch">
                {page === "wishlist" ? (
                  <UiButton
                    variant={options.domain === "all" ? "default" : "ghost"}
                    onClick={() => {
                      const next = new URLSearchParams(params);
                      next.delete("domain");
                      setParams(next);
                    }}
                  >
                    전체
                  </UiButton>
                ) : null}
                <UiButton
                  variant={options.domain === "apparel" ? "default" : "ghost"}
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    next.set("domain", "apparel");
                    next.delete("cat");
                    next.delete("stage");
                    next.delete("fit");
                    next.delete("size");
                    setParams(next);
                  }}
                >
                  옷
                </UiButton>
                <UiButton
                  variant={options.domain === "play" ? "default" : "ghost"}
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    next.set("domain", "play");
                    next.delete("cat");
                    next.delete("stage");
                    next.delete("fit");
                    next.delete("size");
                    setParams(next);
                  }}
                >
                  놀이 · 교구
                </UiButton>
              </div>
              <UiButton variant="outline" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal aria-hidden="true" />
                필터
              </UiButton>
            </div>
            <div className="catalog-toolbar">
              <div className="mode-switch">
                <UiButton
                  variant={mode === "products" ? "default" : "ghost"}
                  onClick={() => filter("mode", "products")}
                >
                  상품 목록
                </UiButton>
                <UiButton
                  variant={mode === "photos" ? "default" : "ghost"}
                  onClick={() => filter("mode", "photos")}
                >
                  사진 피드
                </UiButton>
              </div>
              <Choice
                label="정렬"
                value={
                  options.sort === "low"
                    ? "낮은 가격순"
                    : options.sort === "high"
                      ? "높은 가격순"
                      : options.sort === "drop"
                        ? "가격 하락순"
                        : "추천순"
                }
                options={[
                  "추천순",
                  "낮은 가격순",
                  "높은 가격순",
                  "가격 하락순",
                ]}
                onChange={(value) =>
                  filter(
                    "sort",
                    (
                      {
                        추천순: "recommended",
                        "낮은 가격순": "low",
                        "높은 가격순": "high",
                        "가격 하락순": "drop",
                      } as Record<string, string>
                    )[value],
                  )
                }
              />
            </div>
            <p className="product-note">
              {options.domain === "play"
                ? "명시된 사용 연령이 있는 상품만 월령으로 좁힐 수 있어요."
                : records.activeChild
                  ? `${records.activeChild.name} 기준 · ${records.activeChild.months}개월`
                  : "아이 정보를 등록하면 공식 사이즈표를 확인할 수 있어요."}
            </p>
            {!state ? (
              <div className="catalog-state" role="status">
                상품 원본을 확인하고 있어요.
              </div>
            ) : state.status !== "ready" ? (
              <div className="catalog-state">
                <h2>
                  {state.status === "expired"
                    ? "상품 사진 표시 기한이 지났어요."
                    : "상품 원본을 불러오지 못했어요."}
                </h2>
                <p>찜과 아이 정보는 이 기기에 보존되어 있어요.</p>
                <p className="product-note">
                  수집 {sourceTime(state.catalog?.syncedAt)} · 내부 사진 표시
                  기한 {sourceTime(state.expiresAt)}
                </p>
                <UiButton onClick={() => void refresh()} disabled={refreshing}>
                  {refreshing ? "원본 확인 중" : "원본 다시 확인"}
                </UiButton>
              </div>
            ) : (
              <>
                <div className="catalog-result-heading">
                  <h2>{page === "home" ? "오늘의 꼬까픽" : "검색 결과"}</h2>
                  <span>{list.length}개</span>
                </div>
                {list.length ? (
                  mode === "photos" ? (
                    <PhotoFeed
                      products={list.slice(0, amount)}
                      onOpen={(product) => openProduct(product, true)}
                    />
                  ) : (
                    <div className="commerce-grid">
                      {list.slice(0, amount).map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onOpen={openProduct}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="catalog-state">
                    <p>
                      {page === "wishlist" && !records.favorites.length
                        ? "마음에 드는 상품을 찜해 보세요."
                        : options.domain === "play" && options.stage !== "전체"
                          ? "사용 연령 근거가 없는 상품은 월령 검색에 포함하지 않아요."
                          : "조건에 맞는 상품이 없어요."}
                    </p>
                    <UiButton
                      variant="outline"
                      onClick={() => {
                        const next = resetFilters(true);
                        if (page === "wishlist")
                          navigate({
                            pathname: "/technical/search",
                            search: next.toString() ? `?${next}` : "",
                          });
                        else setParams(next);
                      }}
                    >
                      상품 둘러보기
                    </UiButton>
                  </div>
                )}
                <div ref={sentinel} className="catalog-sentinel" role="status">
                  {amount < list.length
                    ? "스크롤하면 상품을 더 불러와요."
                    : list.length
                      ? "상품을 모두 확인했어요."
                      : ""}
                </div>
              </>
            )}
          </>
        )}
        <footer className="technical-footer">
          <Link to="/proposals">디자인 시안 비교</Link>
          <a href={new URL("../privacy.html", document.baseURI).href}>
            개인정보 안내
          </a>
          <a href={new URL("../support.html", document.baseURI).href}>
            고객센터
          </a>
        </footer>
      </main>
      <nav className="technical-nav" aria-label="주요 메뉴">
        {nav.map((item) => (
          <NavLink to={route(item.path)} key={item.path}>
            <item.icon aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent className="filter-sheet">
          <SheetHeader>
            <SheetTitle>상세 필터</SheetTitle>
            <SheetDescription>
              판매처가 제공한 옵션을 기준으로 상품을 좁혀요.
            </SheetDescription>
          </SheetHeader>
          <div className="filter-fields">
            <Label>월령</Label>
            <Choice
              label="월령"
              value={options.stage || "전체"}
              options={
                options.domain === "play"
                  ? [
                      "전체",
                      "아이월령",
                      "신생아",
                      "베이비",
                      "유아",
                      "토들러",
                      "키즈",
                    ]
                  : ["전체", "신생아", "베이비", "유아", "토들러", "키즈"]
              }
              onChange={(value) => filter("stage", value)}
            />
            <Label>카테고리</Label>
            <Choice
              label="카테고리"
              value={options.category || "전체"}
              options={categories}
              onChange={(value) => filter("cat", value)}
            />
            <Label>브랜드</Label>
            <Choice
              label="브랜드"
              value={options.brand || "전체"}
              options={brands}
              onChange={(value) => filter("brand", value)}
            />
            {options.domain === "apparel" ? (
              <>
                <Label>실제 판매 사이즈</Label>
                <Choice
                  label="실제 판매 사이즈"
                  value={options.size || "전체"}
                  options={sizes}
                  onChange={(value) => filter("size", value)}
                />
                <p className="product-note">
                  공식 브랜드 사이즈표는 판매 중인 상품 옵션이 아닙니다.
                </p>
                <Label className="checkbox-label">
                  <Checkbox
                    checked={options.fitOnly}
                    onCheckedChange={(checked) =>
                      filter("fit", checked ? "1" : "")
                    }
                  />
                  꼬까핏 지원 상품만
                </Label>
              </>
            ) : null}
            <Label>판매처</Label>
            <Choice
              label="판매처"
              value={options.seller || "전체"}
              options={sellers}
              onChange={(value) => filter("seller", value)}
            />
            <form
              noValidate
              className="filter-fields"
              onKeyDown={(event) => {
                if (event.key === "Enter" && event.nativeEvent.isComposing)
                  event.preventDefault();
              }}
              onSubmit={(event) => {
                event.preventDefault();
                const bounds = readPriceBounds(
                  priceBounds.min,
                  priceBounds.max,
                );
                if (bounds.error) {
                  setFilterError(bounds.error);
                  (bounds.field === "min" ? minRef : maxRef).current?.focus();
                  return;
                }
                const next = new URLSearchParams(params);
                for (const key of ["min", "max"] as const) {
                  if (bounds[key]) next.set(key, String(bounds[key]));
                  else next.delete(key);
                }
                setParams(next);
                setFilterError("");
                setFiltersOpen(false);
              }}
            >
              <Label htmlFor="price-min">최소 가격</Label>
              <Input
                ref={minRef}
                id="price-min"
                type="number"
                inputMode="numeric"
                value={priceBounds.min}
                aria-invalid={Boolean(filterError)}
                aria-describedby="price-bounds-help"
                onChange={(event) => {
                  setPriceBounds((saved) => ({
                    ...saved,
                    min: event.target.value,
                  }));
                  setFilterError("");
                }}
              />
              <Label htmlFor="price-max">최대 가격</Label>
              <Input
                ref={maxRef}
                id="price-max"
                type="number"
                inputMode="numeric"
                value={priceBounds.max}
                aria-invalid={Boolean(filterError)}
                aria-describedby="price-bounds-help"
                onChange={(event) => {
                  setPriceBounds((saved) => ({
                    ...saved,
                    max: event.target.value,
                  }));
                  setFilterError("");
                }}
              />
              <p
                id="price-bounds-help"
                className="product-note"
                role={filterError ? "alert" : undefined}
              >
                {filterError || "0 또는 빈칸은 가격 제한 없음으로 적용해요."}
              </p>
              <UiButton type="submit">상품 보기</UiButton>
              <UiButton
                type="button"
                variant="ghost"
                onClick={() => setParams(resetFilters())}
              >
                필터 초기화
              </UiButton>
            </form>
          </div>
        </SheetContent>
      </Sheet>
      <ProductDetail
        product={selected}
        photoOnly={params.get("photo") === "1"}
        opener={productOpener}
        onClose={closeProduct}
        onChild={() => {
          closeProduct();
          openChild();
        }}
      />
      <ChildManager
        open={childOpen}
        onOpenChange={setChildOpen}
        returnFocus={returnChildFocus}
      />
    </div>
  );
}
