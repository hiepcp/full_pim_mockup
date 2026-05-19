import { Refine } from "@refinedev/core";
import { RefineThemes, ThemedLayout, ThemedSider, useNotificationProvider, RefineSnackbarProvider } from "@refinedev/mui";
import { ThemeProvider, CssBaseline, GlobalStyles, Typography, Box } from "@mui/material";
import routerProvider, { NavigateToResource, UnsavedChangesNotifier, DocumentTitleHandler } from "@refinedev/react-router";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import dataProvider from "./dataProvider";

import { ProductList, ProductShow, ProductEdit, ProductCreate } from "./pages/products";
import { AssetList, AssetShow } from "./pages/assets";
import { VariantList } from "./pages/variants";
import { TextContentList, TextContentShow, TextContentCreate, TextContentEdit } from "./pages/text-contents";
import { Dashboard } from "./pages/dashboard";

import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import ImageIcon from "@mui/icons-material/ImageOutlined";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import CategoryIcon from "@mui/icons-material/CategoryOutlined";
import ArticleIcon from "@mui/icons-material/ArticleOutlined";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function RefineApp() {
  const notificationProvider = useNotificationProvider();

  return (
    <Refine
      routerProvider={routerProvider}
      dataProvider={dataProvider}
      notificationProvider={notificationProvider}
      resources={[
        {
          name: "dashboard",
          list: "/",
          meta: { label: "Dashboard", icon: <DashboardIcon /> },
        },
        {
          name: "products",
          list: "/products",
          show: "/products/show/:id",
          edit: "/products/edit/:id",
          create: "/products/create",
          meta: { icon: <InventoryIcon /> },
        },
        {
          name: "variants",
          list: "/variants",
          meta: { label: "Variants", icon: <CategoryIcon /> },
        },
        {
          name: "visual-assets",
          list: "/assets",
          show: "/assets/show/:id",
          meta: { label: "Visual Assets", icon: <ImageIcon /> },
        },
        {
          name: "text-contents",
          list: "/text-contents",
          show: "/text-contents/show/:id",
          edit: "/text-contents/edit/:id",
          create: "/text-contents/create",
          meta: { label: "Text Contents", icon: <ArticleIcon /> },
        },
      ]}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
      }}
    >
      <Routes>
        <Route
          element={
            <ThemedLayout
              Title={({ collapsed }) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
                  <InventoryIcon color="primary" />
                  {!collapsed && (
                    <Typography variant="h6" color="primary" noWrap>
                      PIM System
                    </Typography>
                  )}
                </Box>
              )}
              Sider={() => <ThemedSider />}
            >
              <Outlet />
            </ThemedLayout>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="/products">
            <Route index element={<ProductList />} />
            <Route path="show/:id" element={<ProductShow />} />
            <Route path="edit/:id" element={<ProductEdit />} />
            <Route path="create" element={<ProductCreate />} />
          </Route>
          <Route path="/assets">
            <Route index element={<AssetList />} />
            <Route path="show/:id" element={<AssetShow />} />
          </Route>
          <Route path="/variants">
            <Route index element={<VariantList />} />
          </Route>
          <Route path="/text-contents">
            <Route index element={<TextContentList />} />
            <Route path="show/:id" element={<TextContentShow />} />
            <Route path="edit/:id" element={<TextContentEdit />} />
            <Route path="create" element={<TextContentCreate />} />
          </Route>
          <Route path="*" element={<NavigateToResource resource="dashboard" />} />
        </Route>
      </Routes>
      <UnsavedChangesNotifier />
      <DocumentTitleHandler />
    </Refine>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={RefineThemes.Blue}>
        <CssBaseline />
        <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
        <RefineSnackbarProvider>
          <RefineApp />
        </RefineSnackbarProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
