import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { AppShell } from "@/components/lucathi/AppShell";
import { AuthGate } from "@/components/lucathi/AuthGate";
import { FamilyPage } from "@/features/families/FamilyPage";
import { FamilyWorkspacePage } from "@/features/families/FamilyWorkspacePage";
import { ClientPortalPage } from "@/features/portal/ClientPortalPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import PrimeiroAcesso from "./pages/PrimeiroAcesso";
import Interesse from "./pages/Interesse";
import Leads from "./pages/Leads";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"}>{() => <AuthGate><AppShell><Home /></AppShell></AuthGate>}</Route>
      <Route path={"/primeiro-acesso"}>{() => <PrimeiroAcesso />}</Route>
      <Route path={"/interesse"}>{() => <Interesse />}</Route>
      <Route path={"/dashboard"}>{() => <AuthGate><AppShell><Dashboard /></AppShell></AuthGate>}</Route>
      <Route path={"/interessados"}>{() => <AuthGate><AppShell><Leads /></AppShell></AuthGate>}</Route>
      <Route path={"/portal/:token"} component={ClientPortalPage} />
      <Route path={"/familias/:familyId"}>{() => <AuthGate><AppShell><FamilyWorkspacePage /></AppShell></AuthGate>}</Route>
      <Route path={"/familias"}>{() => <AuthGate><AppShell><FamilyPage /></AppShell></AuthGate>}</Route>
      <Route path={"/patrimonio"}>{() => <AppShell><PlaceholderPage title="Patrimônio" description="Imóveis, gravames, sociedades e integralizações já possuem contratos de servidor e receberão a camada operacional nesta rota." /></AppShell>}</Route>
      <Route path={"/relatorios"}>{() => <AppShell><PlaceholderPage title="Relatórios Lucathi" description="O LWR eletrônico manterá a estrutura proposta e a proposta financeira em seções distintas." /></AppShell>}</Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
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
