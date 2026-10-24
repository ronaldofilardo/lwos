import {
  hoje,
  idadeEmAnosCompletos,
  isDataIsoValida,
} from "@shared/validation";
import { formatDateOnlyBR } from "@shared/validation/datas";
import {
  vinculoLabels,
  type Vinculo,
} from "@/features/families/types";
import type { BirthdayPerson } from "./types";

export function formatBirthdayDate(birthDate: string | null): string {
  if (!birthDate) return "Não informada";
  return isDataIsoValida(birthDate)
    ? formatDateOnlyBR(birthDate)
    : "Data inválida";
}

export function formatBirthdayVinculo(vinculo: Vinculo | null): string {
  if (vinculo === "TITULAR" || vinculo === "CONJUGE") {
    return vinculoLabels[vinculo];
  }
  return "Outros";
}

export function getBirthdayAge(
  birthDate: string | null,
  referenceDate: string = hoje()
): number | null {
  if (!birthDate || !isDataIsoValida(birthDate)) return null;
  const age = idadeEmAnosCompletos(birthDate, referenceDate);
  return age >= 0 ? age : null;
}

export function isBirthdayThisWeek(
  birthDate: string | null,
  referenceDate: string = hoje()
): boolean {
  if (!birthDate || !isDataIsoValida(birthDate) || !isDataIsoValida(referenceDate)) {
    return false;
  }

  const [year, month, day] = referenceDate.split("-").map(Number);
  const reference = new Date(Date.UTC(year, month - 1, day));
  const mondayOffset = (reference.getUTCDay() + 6) % 7;
  const birthMonth = Number(birthDate.slice(5, 7));
  const birthDay = Number(birthDate.slice(8, 10));
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const birthdayMonth = birthMonth === 2 && birthDay === 29 && !isLeapYear
    ? 3
    : birthMonth;
  const birthdayDay = birthMonth === 2 && birthDay === 29 && !isLeapYear
    ? 1
    : birthDay;

  for (let offset = 0; offset < 7; offset += 1) {
    const weekDate = new Date(
      Date.UTC(year, month - 1, day - mondayOffset + offset)
    );
    if (
      weekDate.getUTCMonth() + 1 === birthdayMonth &&
      weekDate.getUTCDate() === birthdayDay
    ) {
      return true;
    }
  }
  return false;
}

export function hasBirthdaysThisWeek(
  people: readonly BirthdayPerson[],
  referenceDate: string = hoje()
): boolean {
  return people.some(person =>
    isBirthdayThisWeek(person.birthDate, referenceDate)
  );
}

export function sortBirthdayPeople(
  people: readonly BirthdayPerson[]
): BirthdayPerson[] {
  return [...people].sort((first, second) => {
    const firstDate =
      first.birthDate && isDataIsoValida(first.birthDate)
        ? first.birthDate.slice(5)
        : "99-99";
    const secondDate =
      second.birthDate && isDataIsoValida(second.birthDate)
        ? second.birthDate.slice(5)
        : "99-99";
    return (
      firstDate.localeCompare(secondDate) ||
      first.fullName.localeCompare(second.fullName, "pt-BR")
    );
  });
}
