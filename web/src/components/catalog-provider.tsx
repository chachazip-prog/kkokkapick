import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";
import type { ChildProfileInput } from "@/domain";
import { useCatalog } from "@/hooks/use-catalog";
import { useLocalRecords } from "@/hooks/use-local-records";

type Drafts = {
  child: Record<string, ChildProfileInput>;
  price: Record<string, string>;
};
type CatalogContextValue = ReturnType<typeof useCatalog> & {
  records: ReturnType<typeof useLocalRecords>;
  drafts: Drafts;
  setDrafts: Dispatch<SetStateAction<Drafts>>;
};
const CatalogContext = createContext<CatalogContextValue | null>(null);
export function CatalogProvider({ children }: { children: ReactNode }) {
  const catalog = useCatalog();
  const records = useLocalRecords();
  const [drafts, setDrafts] = useState<Drafts>({ child: {}, price: {} });
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => {
      if (
        Object.keys(drafts.child).length ||
        Object.keys(drafts.price).length
      ) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", unload);
    return () => window.removeEventListener("beforeunload", unload);
  }, [drafts]);
  return (
    <CatalogContext.Provider value={{ ...catalog, records, drafts, setDrafts }}>
      {children}
    </CatalogContext.Provider>
  );
}
export function useKkokkapick() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("CatalogProvider is required");
  return value;
}
