// pages/index.js or config.js
import ProductPage from "./components/product/product";
import StockPage from "./components/stock/stock";
import SalesPage from "./components/sales/sale";
import DailySalesPage from "./components/dailySale/dailySale";
import CategoryPage from "./components/category/category";

export const pageConfig = {
  main: [
    { path: "/stock", label: "Stock", component: StockPage },
    { path: "/product", label: "Product", component: ProductPage },
    { path: "/sales", label: "Sales", component: SalesPage },
    { path: "/dailysales", label: "Daily Sales", component: DailySalesPage },
    { path: "/category", label: "Category", component: CategoryPage },
  ],
  other: [
    { path: "/sales", label: "Sales", component: SalesPage },
    { path: "/dailysales", label: "Daily Sales", component: DailySalesPage },
  ],
};
