import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppShell } from "@/components/lucathi/AppShell";
import { AuthGate } from "@/components/lucathi/AuthGate";

const NotFound = lazy(() => import("@/pages/NotFound"));
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FamilyPage = lazy(() => import("@/features/families/FamilyPage").then(m => ({ default: m.FamilyPage })));
const FamilyWorkspacePage = lazy(() => import("@/features/families/FamilyWorkspacePage").then(m => ({ default: m.FamilyWorkspacePage })));
const ClientPortalPage = lazy(() => import("@/features/portal/ClientPortalPage").then(m => ({ default: m.ClientPortalPage })));
const PlaceholderPage = lazy(() => import("./pages/PlaceholderPage").then(m => ({ default: m.PlaceholderPage })));
const PrimeiroAcesso = lazy(() => import("./pages/PrimeiroAcesso"));
const Interesse = lazy(() => import("./pages/Interesse"));
const Leads = lazy(() => import("./pages/Leads"));
const ClientFamilyPage = lazy(() => import("./pages/ClientFamilyPage"));
const ClientFamilyIndex = lazy(() => import("./pages/ClientFamilyPage").then(m => ({ default: m.ClientFamilyIndex })));
const BirthdaysPage = lazy(() => import("@/features/birthdays/BirthdaysPage").then(m => ({ default: m.BirthdaysPage })));

function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <span className="sr-only">Carregando...</span>
    </div>
  );
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"}>{() => <AuthGate><AppShell><Home /></AppShell></AuthGate>}</Route>
        <Route path={"/primeiro-acesso"}>{() => <PrimeiroAcesso />}</Route>
        <Route path={"/interesse"}>{() => <Interesse />}</Route>
        <Route path={"/dashboard"}>{() => <AuthGate><AppShell><Dashboard /></AppShell></AuthGate>}</Route>
        <Route path={"/interessados"}>{() => <AuthGate><AppShell><Leads /></AppShell></AuthGate>}</Route>
        <Route path={"/portal/:token"} component={ClientPortalPage} />
        <Route path={"/minha-familia/:familyId"}>{() => <AuthGate><AppShell><ClientFamilyPage /></AppShell></AuthGate>}</Route>
        <Route path={"/minha-familia"}>{() => <AuthGate><AppShell><ClientFamilyIndex /></AppShell></AuthGate>}</Route>
        <Route path={"/familias/:familyId"}>{() => <AuthGate><AppShell><FamilyWorkspacePage /></AppShell></AuthGate>}</Route>
        <Route path={"/familias"}>{() => <AuthGate><AppShell><FamilyPage /></AppShell></AuthGate>}</Route>
        <Route path={"/patrimonio"}>{() => <AppShell><PlaceholderPage title="Patrimônio" description="Imóveis, gravames, sociedades e integralizações já possuem contratos de servidor e receberão a camada operacional nesta rota." /></AppShell>}</Route>
        <Route path={"/aniversarios"}>{() => <AuthGate><AppShell><BirthdaysPage /></AppShell></AuthGate>}</Route>
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
