import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Landmark } from "lucide-react";
import { ItcmdPanel } from "./ItcmdPanel";

export function SetupPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-lucathi-navy font-display">
          Configurações Globais da Plataforma
        </h1>
        <p className="mt-1 text-sm text-lucathi-gray">
          Gerenciamento de parâmetros tributários, políticas estaduais e regras do escritório.
        </p>
      </div>

      <Tabs defaultValue="itcmd" className="space-y-6">
        <TabsList className="bg-lucathi-mist/80 p-1 rounded-xl h-auto border border-lucathi-line/60">
          <TabsTrigger
            value="itcmd"
            className="data-[state=active]:bg-white data-[state=active]:text-lucathi-navy data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-xs font-semibold gap-2"
          >
            <Landmark className="size-4" /> Políticas de ITCMD (27 UFs)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="itcmd">
          <ItcmdPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

