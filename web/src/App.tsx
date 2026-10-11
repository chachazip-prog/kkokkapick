import { lazy, Suspense } from "react";
import { HashRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { CatalogProvider, useKkokkapick } from "@/components/catalog-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import type { ProposalProduct } from "@/proposals/ProposalGallery";
import hero from "../../assets/hero-proposals/hero-3.webp";

const ProposalGallery = lazy(() => import("@/proposals/ProposalGallery"));
const TechnicalApp = lazy(() =>
  import("@/screens/TechnicalApp").then((module) => ({
    default: module.TechnicalApp,
  })),
);

function Proposals() {
  const { state } = useKkokkapick();
  const fresh = state?.status === "ready";
  const products: ProposalProduct[] = fresh
    ? state.products.map((product) => ({
        id: product.id,
        name: product.displayName,
        brand: product.brand,
        category: product.cat,
        domain: product.domain,
        imageUrls: product.imageUrls,
        minPrice: product.minPrice ?? undefined,
        material: product.material,
        availableSizes: product.availableSizes,
        fitStatus: product.fitStatus,
        fitSource: product.fitSource,
        ageEvidence: product.ageEvidence,
        offers: product.offers
          .filter((offer) => Number(offer.price) > 0)
          .map((offer) => ({
            merchant: offer.merchant,
            price: Number(offer.price),
            url: offer.affiliateUrl || undefined,
          })),
      }))
    : [];
  return (
    <>
      <div className="preview-switch">
        <Link to="/technical/home">React 기능 전환 확인</Link>
        <span>새 디자인은 시안 선택 후 적용합니다.</span>
      </div>
      <ProposalGallery
        products={products}
        catalogStatus={
          fresh
            ? "fresh"
            : state?.status === "expired"
              ? "expired"
              : "unavailable"
        }
        catalogExpiresAt={
          state?.expiresAt ? new Date(state.expiresAt).toISOString() : undefined
        }
        heroImageUrl={hero}
      />
    </>
  );
}

export function App() {
  return (
    <HashRouter>
      <CatalogProvider>
        <TooltipProvider>
          <Suspense
            fallback={
              <main className="route-loading" role="status">
                화면을 준비하고 있어요.
              </main>
            }
          >
            <Routes>
              <Route path="/" element={<Navigate to="/proposals" replace />} />
              <Route path="/proposals" element={<Proposals />} />
              <Route path="/technical/:page" element={<TechnicalApp />} />
              <Route
                path="*"
                element={
                  <main className="route-loading">
                    <h1>화면을 찾을 수 없어요.</h1>
                    <Link to="/proposals">디자인 시안으로 이동</Link>
                  </main>
                }
              />
            </Routes>
          </Suspense>
          <Toaster
            theme="light"
            position="top-center"
            containerAriaLabel="꼬까픽 안내"
          />
        </TooltipProvider>
      </CatalogProvider>
    </HashRouter>
  );
}
