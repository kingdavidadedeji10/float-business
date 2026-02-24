import Theme1 from "@/themes/Theme1";
import Theme2 from "@/themes/Theme2";
import Theme3 from "@/themes/Theme3";
import Theme4 from "@/themes/Theme4";
import Theme5 from "@/themes/Theme5";
import { Product } from "@/types/product";
import { Store } from "@/types/store";

interface ThemeRendererProps {
  theme: string;
  store: Store;
  products: Product[];
}

export default function ThemeRenderer({ theme, store, products }: ThemeRendererProps) {
  switch (theme) {
    case "theme1":
      return <Theme1 store={store} products={products} />;
    case "theme2":
      return <Theme2 store={store} products={products} />;
    case "theme3":
      return <Theme3 store={store} products={products} />;
    case "theme4":
      return <Theme4 store={store} products={products} />;
    case "theme5":
      return <Theme5 store={store} products={products} />;
    default:
      return <Theme1 store={store} products={products} />;
  }
}
