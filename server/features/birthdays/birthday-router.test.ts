import { beforeEach, describe, expect, it, vi } from "vitest";

const repositoryMocks = vi.hoisted(() => ({
  listProjectBirthdays: vi.fn(),
}));

vi.mock("./birthday-repository", () => repositoryMocks);

import { birthdayRouter } from "./birthday-router";

function caller(role: string) {
  return birthdayRouter.createCaller({
    req: { ip: "127.0.0.1" } as never,
    res: {} as never,
    user: { id: 1, role },
  } as never);
}

describe("birthday-router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repositoryMocks.listProjectBirthdays.mockResolvedValue([]);
  });

  it.each(["ADMIN", "ANALISTA", "CLIENTE"])(
    "denies access to %s",
    async role => {
      await expect(caller(role).list()).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
      expect(repositoryMocks.listProjectBirthdays).not.toHaveBeenCalled();
    }
  );

  it("lists project birthdays for Sócio", async () => {
    await expect(caller("SOCIO").list()).resolves.toEqual([]);
    expect(repositoryMocks.listProjectBirthdays).toHaveBeenCalledOnce();
  });
});
