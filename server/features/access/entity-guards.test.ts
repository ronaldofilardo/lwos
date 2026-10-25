/**
 * @description Guarda de pertencimento à família: pessoa de outra família (ou
 * inexistente) é recusada, já que o banco não tem FK.
 * @see server/features/access/entity-guards.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const personMocks = vi.hoisted(() => ({ getPersonRecord: vi.fn() }));
vi.mock("../people/person-repository", () => personMocks);

import { assertPersonInFamily } from "./entity-guards";

describe("assertPersonInFamily", () => {
  beforeEach(() => vi.clearAllMocks());

  it("aceita pessoa da própria família", async () => {
    personMocks.getPersonRecord.mockResolvedValue({ id: "p1", familyId: "fam-1" });
    await expect(assertPersonInFamily("p1", "fam-1")).resolves.toMatchObject({ id: "p1" });
  });

  it("recusa pessoa de outra família ou inexistente", async () => {
    personMocks.getPersonRecord.mockResolvedValue({ id: "p1", familyId: "fam-2" });
    await expect(assertPersonInFamily("p1", "fam-1")).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });

    personMocks.getPersonRecord.mockResolvedValue(null);
    await expect(assertPersonInFamily("sumida", "fam-1")).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });
});
