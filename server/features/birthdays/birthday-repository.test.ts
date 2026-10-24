import { beforeEach, describe, expect, it, vi } from "vitest";

const repositoryMocks = vi.hoisted(() => ({
  asc: vi.fn((column: unknown) => ({ order: column })),
  eq: vi.fn((left: unknown, right: unknown) => ({ left, right })),
  requireDatabase: vi.fn(),
  people: {
    id: "people.id",
    fullName: "people.fullName",
    birthDate: "people.birthDate",
    vinculo: "people.vinculo",
    familyId: "people.familyId",
  },
  families: { id: "families.id", name: "families.name" },
}));

vi.mock("drizzle-orm", () => ({
  asc: repositoryMocks.asc,
  eq: repositoryMocks.eq,
}));
vi.mock("../../../drizzle/schema", () => ({
  people: repositoryMocks.people,
  families: repositoryMocks.families,
}));
vi.mock("../_shared/database", () => ({
  requireDatabase: repositoryMocks.requireDatabase,
}));

import { families, people } from "../../../drizzle/schema";
import { listProjectBirthdays } from "./birthday-repository";

describe("birthday-repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists every person with birth date and project name in name order", async () => {
    const rows = [
      {
        id: "person-1",
        fullName: "Ana Silva",
        birthDate: "1990-10-19",
        vinculo: "TITULAR",
        projectName: "Projeto A",
      },
    ];
    const orderBy = vi.fn().mockResolvedValue(rows);
    const leftJoin = vi.fn().mockReturnValue({ orderBy });
    const from = vi.fn().mockReturnValue({ leftJoin });
    const select = vi.fn().mockReturnValue({ from });
    repositoryMocks.requireDatabase.mockResolvedValue({ select });

    await expect(listProjectBirthdays()).resolves.toEqual(rows);
    expect(select).toHaveBeenCalledWith({
      id: people.id,
      fullName: people.fullName,
      birthDate: people.birthDate,
      vinculo: people.vinculo,
      projectName: families.name,
    });
    expect(from).toHaveBeenCalledWith(people);
    expect(leftJoin).toHaveBeenCalledWith(
      families,
      { left: people.familyId, right: families.id }
    );
    expect(repositoryMocks.asc).toHaveBeenCalledWith(people.fullName);
  });

  it("wraps database errors with the birthday query context", async () => {
    const databaseError = new Error("database unavailable");
    repositoryMocks.requireDatabase.mockRejectedValue(databaseError);

    let receivedError: unknown;
    try {
      await listProjectBirthdays();
    } catch (error) {
      receivedError = error;
    }

    expect(receivedError).toBeInstanceOf(Error);
    if (!(receivedError instanceof Error)) {
      throw new Error("A consulta deveria propagar um erro contextualizado.");
    }
    expect(receivedError.message).toBe(
      "Não foi possível consultar os aniversários dos projetos."
    );
    expect(receivedError.cause).toBe(databaseError);
  });
});
