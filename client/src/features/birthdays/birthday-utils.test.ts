import { describe, expect, it } from "vitest";
import {
  formatBirthdayDate,
  getBirthdayAge,
  hasBirthdaysThisWeek,
  isBirthdayThisWeek,
  sortBirthdayPeople,
} from "./birthday-utils";
import type { BirthdayPerson } from "./types";

describe("birthday-utils", () => {
  it("formats dates without changing the calendar day", () => {
    expect(formatBirthdayDate("1990-01-02")).toBe("02/01/1990");
    expect(formatBirthdayDate(null)).toBe("Não informada");
    expect(formatBirthdayDate("1990-02-30")).toBe("Data inválida");
  });

  it("calculates age in completed years", () => {
    expect(getBirthdayAge("2008-10-09", "2026-10-08")).toBe(17);
    expect(getBirthdayAge("2008-10-09", "2026-10-09")).toBe(18);
    expect(getBirthdayAge(null, "2026-10-09")).toBeNull();
  });

  it("marks birthdays from Monday through Sunday", () => {
    expect(isBirthdayThisWeek("1990-10-19", "2026-10-24")).toBe(true);
    expect(isBirthdayThisWeek("1990-10-25", "2026-10-24")).toBe(true);
    expect(isBirthdayThisWeek("1990-10-26", "2026-10-24")).toBe(false);
  });

  it("marks birthdays when the current week crosses a year boundary", () => {
    expect(isBirthdayThisWeek("1990-12-31", "2027-01-02")).toBe(true);
    expect(isBirthdayThisWeek("1990-01-03", "2027-01-02")).toBe(true);
  });

  it("reports whether any person has a birthday this week", () => {
    const people: BirthdayPerson[] = [
      { id: "1", fullName: "Ana", birthDate: null, projectName: "Projeto A" },
      { id: "2", fullName: "Bia", birthDate: "1990-10-19", projectName: "Projeto B" },
    ];
    expect(hasBirthdaysThisWeek(people, "2026-10-24")).toBe(true);
    expect(hasBirthdaysThisWeek(people, "2026-10-26")).toBe(false);
  });

  it("observes leap-day birthdays on March 1 in non-leap years", () => {
    expect(isBirthdayThisWeek("2000-02-29", "2026-02-28")).toBe(true);
  });

  it("sorts by birthday date and places missing dates last", () => {
    const people: BirthdayPerson[] = [
      { id: "2", fullName: "Bia", birthDate: null, projectName: "Projeto B" },
      { id: "1", fullName: "Ana", birthDate: "1990-03-10", projectName: "Projeto A" },
      { id: "3", fullName: "Caio", birthDate: "1980-01-20", projectName: "Projeto C" },
    ];
    expect(sortBirthdayPeople(people).map(person => person.id)).toEqual([
      "3",
      "1",
      "2",
    ]);
  });
});
