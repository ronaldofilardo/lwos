/**
 * @description Valida o proxy local de documentos: autenticação, chave, vínculo
 * documental, isolamento familiar, ausência física e resposta segura de download.
 * @see server/_core/storageProxy.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({ authenticateRequest: vi.fn() }));
const storageMocks = vi.hoisted(() => ({ readStoredFile: vi.fn(), storedFileExists: vi.fn() }));
const documentMocks = vi.hoisted(() => ({ getDocumentVersionByStorageKey: vi.fn() }));
const accessMocks = vi.hoisted(() => ({ userHasFamilyAccess: vi.fn() }));
const leadMocks = vi.hoisted(() => ({ getLeadRecordByStorageKey: vi.fn() }));
vi.mock("./auth", () => authMocks);
vi.mock("../storage", () => storageMocks);
vi.mock("../features/documents/document-repository", () => documentMocks);
vi.mock("../features/access/family-access", () => accessMocks);
vi.mock("../features/leads/lead-repository", () => leadMocks);

import { registerStorageProxy } from "./storageProxy";

function handler() {
  const app = { get: vi.fn() };
  registerStorageProxy(app as never);
  return app.get.mock.calls[0][1] as (req: any, res: any) => Promise<void>;
}

function response() {
  return { status: vi.fn().mockReturnThis(), send: vi.fn(), set: vi.fn() };
}

describe("storage proxy", () => {
  beforeEach(() => vi.clearAllMocks());

  it("recusa requisição sem sessão e sem chave de storage", async () => {
    authMocks.authenticateRequest.mockRejectedValue(new Error("sem sessão"));
    const res = response();
    await handler()({ params: { 0: "familia/a.pdf" } }, res);
    expect(res.status).toHaveBeenCalledWith(401);

    authMocks.authenticateRequest.mockResolvedValue({ id: 1, role: "SOCIO" });
    const second = response();
    await handler()({ params: {} }, second);
    expect(second.status).toHaveBeenCalledWith(400);
  });

  it("não expõe chave órfã ou documento de família não autorizada", async () => {
    authMocks.authenticateRequest.mockResolvedValue({ id: 1, role: "CLIENTE" });
    documentMocks.getDocumentVersionByStorageKey.mockResolvedValueOnce(undefined).mockResolvedValueOnce({ familyId: "familia-2" });
    leadMocks.getLeadRecordByStorageKey.mockResolvedValue(null);
    accessMocks.userHasFamilyAccess.mockResolvedValue(false);

    const unknown = response();
    await handler()({ params: { 0: "familia/nao-existe.pdf" } }, unknown);
    expect(unknown.status).toHaveBeenCalledWith(404);

    const denied = response();
    await handler()({ params: { 0: "familia/restrito.pdf" } }, denied);
    expect(denied.status).toHaveBeenCalledWith(403);
    expect(storageMocks.readStoredFile).not.toHaveBeenCalled();
  });

  it("restringe arquivo de interessado ao time e serve para sócio", async () => {
    authMocks.authenticateRequest.mockResolvedValue({ id: 1, role: "CLIENTE" });
    documentMocks.getDocumentVersionByStorageKey.mockResolvedValue(undefined);
    leadMocks.getLeadRecordByStorageKey.mockResolvedValue({ id: "lead-1" });

    const cliente = response();
    await handler()({ params: { 0: "leads/identificacao.pdf" } }, cliente);
    expect(cliente.status).toHaveBeenCalledWith(403);
    expect(storageMocks.readStoredFile).not.toHaveBeenCalled();

    authMocks.authenticateRequest.mockResolvedValue({ id: 2, role: "SOCIO" });
    storageMocks.storedFileExists.mockResolvedValue(true);
    storageMocks.readStoredFile.mockResolvedValue(Buffer.from("pdf"));

    const socio = response();
    await handler()({ params: { 0: "leads/identificacao.pdf" } }, socio);
    expect(socio.send).toHaveBeenCalledWith(Buffer.from("pdf"));
    expect(socio.set).toHaveBeenCalledWith("Cache-Control", "no-store");
  });

  it("serve somente arquivo existente e autorizado com cache desabilitado", async () => {
    authMocks.authenticateRequest.mockResolvedValue({ id: 1, role: "CLIENTE" });
    documentMocks.getDocumentVersionByStorageKey.mockResolvedValue({ familyId: "familia-1" });
    accessMocks.userHasFamilyAccess.mockResolvedValue(true);
    storageMocks.storedFileExists.mockResolvedValue(true);
    storageMocks.readStoredFile.mockResolvedValue(Buffer.from("pdf"));
    const res = response();

    await handler()({ params: { 0: "familia-1/documento.pdf" } }, res);

    expect(res.set).toHaveBeenCalledWith("Content-Type", "application/pdf");
    expect(res.set).toHaveBeenCalledWith("Cache-Control", "no-store");
    expect(res.send).toHaveBeenCalledWith(Buffer.from("pdf"));
  });
});
