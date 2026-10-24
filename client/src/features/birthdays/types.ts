import type { Vinculo } from "@/features/families/types";

export type BirthdayPerson = {
  id: string;
  fullName: string;
  birthDate: string | null;
  vinculo: Vinculo | null;
  projectName: string | null;
};
