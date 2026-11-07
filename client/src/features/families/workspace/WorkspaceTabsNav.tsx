import { useLocation } from "wouter";
import {
  Calculator,
  FileStack,
  Landmark,
  Layers,
  Presentation,
  ShieldCheck,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  { value: "due-diligence", label: "Due Diligence", icon: Layers },
  { value: "documentos", label: "Documentos e Certidões", icon: FileStack },
  { value: "patrimonio", label: "Patrimônio", icon: Landmark },
  { value: "calculos", label: "Cálculos", icon: Calculator },
  { value: "lwr-proposta", label: "LWR & Proposta Financeira", icon: Presentation },
  { value: "portal-auditoria", label: "Portal & Governança", icon: ShieldCheck },
  { value: "visao-unificada", label: "Visão Unificada Completa", icon: Layers },
] as const;

interface TabContent {
  value: (typeof TABS)[number]["value"];
  content: React.ReactNode;
}

interface Props {
  tabs: TabContent[];
}

export function WorkspaceTabsNav({ tabs }: Props) {
  const [pathname] = useLocation();
  const activeByPath = TABS.find(t => pathname.endsWith(t.value) || pathname === "/");
  const defaultValue = activeByPath?.value ?? TABS[0].value;
  return (
    <Tabs defaultValue={defaultValue} className="space-y-6">
      <TabsList
        className="bg-lucathi-mist/80 p-1 rounded-xl h-auto flex overflow-x-auto no-scrollbar whitespace-nowrap gap-1 border border-lucathi-line/60"
      >
        {TABS.map(tab => {
          const active = pathname.endsWith(tab.value) || pathname === "/";
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={`data-[state=active]:bg-white data-[state=active]:text-lucathi-navy data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-xs font-semibold gap-2 ${active ? "bg-lucathi-mist font-semibold text-lucathi-navy" : "text-lucathi-gray hover:bg-lucathi-mist/50"}`}
              aria-current={active ? "page" : undefined}
            >
              <tab.icon className="size-4" /> {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {tabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value} className="space-y-6">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
