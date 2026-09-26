import { z } from "zod";

export const stakeholderInputSchema = z
  .object({
    companyId: z.string().min(1),
    // Sócio membro da família (people) OU não-membro informado em externalName.
    personId: z.string().min(1).optional(),
    externalName: z.string().min(2).max(160).optional(),
    percentage: z.number().positive().max(100),
  })
  .refine(data => Boolean(data.personId || data.externalName?.trim()), {
    message: "Informe um membro da família ou o nome do não-membro.",
    path: ["personId"],
  });

export const stakeholderUpdateSchema = z
  .object({
    companyId: z.string().min(1),
    stakeholderId: z.string().min(1),
    personId: z.string().min(1).optional(),
    externalName: z.string().min(2).max(160).optional(),
    percentage: z.number().positive().max(100).optional(),
  })
  .refine(
    data =>
      data.percentage !== undefined ||
      data.personId !== undefined ||
      data.externalName !== undefined,
    { message: "Nada para atualizar.", path: ["percentage"] }
  );

export const stakeholderDeleteSchema = z.object({
  companyId: z.string().min(1),
  stakeholderId: z.string().min(1),
});
