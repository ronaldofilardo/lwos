import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-lucathi-canvas p-6">
      <Card className="w-full max-w-lg mx-auto shadow-sm border-lucathi-line">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-status-danger-bg rounded-full animate-pulse" />
              <AlertCircle className="relative h-16 w-16 text-status-danger-text" />
            </div>
          </div>

          <h1 className="font-display text-5xl text-lucathi-navy mb-2">404</h1>

          <h2 className="text-xl font-semibold text-lucathi-ink mb-4">
            Página não encontrada
          </h2>

          <p className="text-lucathi-gray mb-8 leading-relaxed">
            Desculpe, a página que você procura não existe.
            <br />
            Pode ter sido movida ou removida.
          </p>

          <div
            id="not-found-button-group"
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              onClick={handleGoHome}
              className="w-full sm:w-auto"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao início
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}