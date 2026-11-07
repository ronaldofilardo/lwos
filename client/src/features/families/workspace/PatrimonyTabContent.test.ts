import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";

vi.mock("@/lib/trpc", () => {
  const query = vi.fn().mockReturnValue({ data: [], isLoading: false });
  const mutation = vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false });
  const utils = vi.fn().mockReturnValue({});
  const deepMock = new Proxy({}, {
    get: (target, prop) => {
      if (prop === "useQuery") return query;
      if (prop === "useMutation") return mutation;
      if (prop === "useUtils") return utils;
      return deepMock;
    },
  });
  return { trpc: deepMock, useUtils: utils };
});

import { renderToStaticMarkup } from "react-dom/server";
import { PatrimonyTabContent } from "./PatrimonyTabContent";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PatrimonyTabContent", () => {
  it("renderiza resumo patrimonial e painéis de imóveis e sociedades", () => {
    const markup = renderToStaticMarkup(
      createElement(PatrimonyTabContent, { familyId: "fam-1" })
    );
    expect(markup).toContain("Imóveis");
    expect(markup).toContain("Sociedades");
    expect(markup).toContain("Demais ativos");
    expect(markup).toContain("Total patrimonial");
  });

  it("não usa grid de 2 colunas que comprime tabelas (layout empilhado)", () => {
    const markup = renderToStaticMarkup(
      createElement(PatrimonyTabContent, { familyId: "fam-1" })
    );
    expect(markup).not.toContain("xl:grid-cols-2");
  });
});
