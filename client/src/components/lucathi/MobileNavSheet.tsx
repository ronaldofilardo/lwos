"use client";

import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { navigationItems } from "./navigation";
import { isClient } from "@shared/domain/permissions";
import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/formatClasses";

export function MobileNavSheet({ user }: { user: { name: string | null; role: string } | null }) {
  const [, navigate] = useLocation();
  const [pathname] = useLocation();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const role = user?.role ?? "";
  const isClientRole = isClient(role as any);
  const items = isClientRole
    ? [
        { label: "Início", path: "/dashboard" },
        { label: "Minha família", path: "/minha-familia" },
      ]
    : navigationItems;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="lg:hidden w-80 border-l border-lucathi-line shadow-lg">
          <SheetClose className="top-4 right-4" />
          <SheetHeader className="pb-2">
            <SheetTitle className="text-sm font-semibold text-lucathi-navy">Navegação</SheetTitle>
          </SheetHeader>
          <nav className="p-4 space-y-1" aria-label="Menu mobile">
            {items.map(item => {
              const active = pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  onClick={() => { navigate(item.path); setOpen(false); }}
                  className={cn(
                    "w-full justify-start gap-3 text-sm",
                    active
                      ? "bg-lucathi-mist font-semibold text-lucathi-navy"
                      : "text-lucathi-gray hover:bg-lucathi-mist hover:text-lucathi-navy",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Button>
              );
            })}
          </nav>
          <div className="mt-auto p-4 border-t border-lucathi-line/50">
            <Button
              variant="destructive"
              onClick={() => { logout(); setOpen(false); }}
              className="w-full gap-2 text-sm"
              aria-label="Encerrar sessão"
            >
              <LogOut className="size-4" /> Sair
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
