import { type AppRole, APP_ROLES } from "./roles";

/**
 * Permissões granulares  cada uma é uma ação sobre uma entidade.
 * A matriz define qual papel pode executar cada ação.
 */
export const Permission = {
  // Pessoas
  PEOPLE_CREATE: "people.create" as const,
  PEOPLE_UPDATE: "people.update" as const,
  PEOPLE_REMOVE: "people.remove" as const,
  PEOPLE_ATTACH_DOCUMENTS: "people.attachDocuments" as const,
  PEOPLE_SET_PRIMARY_CONTACT: "people.setPrimaryContact" as const,
  
  // Propriedades
  PROPERTY_CREATE: "property.create" as const,
  PROPERTY_UPDATE: "property.update" as const,
  PROPERTY_REMOVE: "property.remove" as const,
  PROPERTY_ADD_OWNER: "property.addOwner" as const,
  PROPERTY_UPDATE_OWNER: "property.updateOwner" as const,
  PROPERTY_REMOVE_OWNER: "property.removeOwner" as const,
  
  // Documentos
  DOCUMENT_CREATE: "document.create" as const,
  DOCUMENT_GENERATE_REQUIREMENTS: "document.generateRequirements" as const,
  DOCUMENT_UPLOAD_VERSION: "document.uploadVersion" as const,
  DOCUMENT_UPLOAD_BALANCE: "document.uploadBalance" as const,
  DOCUMENT_REVIEW: "document.review" as const,
  DOCUMENT_DISPENSE: "document.dispense" as const,
  
  // Sociedades
  COMPANY_CREATE: "company.create" as const,
  COMPANY_REMOVE: "company.remove" as const,
  COMPANY_ADD_STAKEHOLDER: "company.addStakeholder" as const,
  COMPANY_UPDATE_STAKEHOLDER: "company.updateStakeholder" as const,
  COMPANY_REMOVE_STAKEHOLDER: "company.removeStakeholder" as const,
  COMPANY_UPSERT_DETAILS: "company.upsertDetails" as const,
  
  // Ativos
  ASSET_CREATE: "asset.create" as const,
  ASSET_UPDATE: "asset.update" as const,
  ASSET_REMOVE: "asset.remove" as const,
  
  // Certidões
  CERTIDAO_GENERATE: "certidao.generate" as const,
  CERTIDAO_UPDATE_STATUS: "certidao.updateStatus" as const,
  
  // Propostas
  PROPOSAL_CREATE: "proposal.create" as const,
  PROPOSAL_REVIEW_COUNTER: "proposal.reviewCounter" as const,
  
  // Portal
  PORTAL_CREATE_LINK: "portal.createLink" as const,
  PORTAL_LIST_LINKS: "portal.listLinks" as const,
  PORTAL_REVOKE_LINK: "portal.revokeLink" as const,
  
  // Famílias
  FAMILY_CREATE: "family.create" as const,
  FAMILY_UPDATE_STATUS: "family.updateStatus" as const,
  FAMILY_GRANT_CLIENT_ACCESS: "family.grantClientAccess" as const,
  FAMILY_GENERATE_FIRST_ACCESS_LINK: "family.generateFirstAccessLink" as const,
  FAMILY_GENERATE_PASSWORD_RESET_LINK: "family.generatePasswordResetLink" as const,
  FAMILY_GET_DASHBOARD: "family.getDashboard" as const,
  FAMILY_LIST_STORAGE: "family.listStorage" as const,
  
  // Auditoria
  AUDIT_LIST_BY_FAMILY: "audit.listByFamily" as const,
  
  // Interessados
  LEAD_LIST: "lead.list" as const,
  LEAD_ACCEPT: "lead.accept" as const,
  LEAD_REJECT: "lead.reject" as const,
  
  // Usuários
  USER_LIST: "user.list" as const,
  USER_CHANGE_ROLE: "user.changeRole" as const,
  
  // LWR
  LWR_CREATE: "lwr.create" as const,
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

/**
 * Matriz de permissões: papel -> conjunto de permissões permitidas.
 */
const PERMISSION_MATRIX: Record<AppRole, readonly Permission[]> = {
  SOCIO: [
    // Todas as permissões
    ...Object.values(Permission),
  ],
  ANALISTA: [
    // Pessoas
    Permission.PEOPLE_CREATE,
    Permission.PEOPLE_UPDATE,
    Permission.PEOPLE_REMOVE,
    Permission.PEOPLE_ATTACH_DOCUMENTS,
    Permission.PEOPLE_SET_PRIMARY_CONTACT,
    // Propriedades
    Permission.PROPERTY_CREATE,
    Permission.PROPERTY_UPDATE,
    Permission.PROPERTY_REMOVE,
    Permission.PROPERTY_ADD_OWNER,
    Permission.PROPERTY_UPDATE_OWNER,
    Permission.PROPERTY_REMOVE_OWNER,
    // Documentos
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_GENERATE_REQUIREMENTS,
    Permission.DOCUMENT_UPLOAD_VERSION,
    Permission.DOCUMENT_UPLOAD_BALANCE,
    // Sociedades
    Permission.COMPANY_CREATE,
    Permission.COMPANY_REMOVE,
    Permission.COMPANY_ADD_STAKEHOLDER,
    Permission.COMPANY_UPDATE_STAKEHOLDER,
    Permission.COMPANY_REMOVE_STAKEHOLDER,
    Permission.COMPANY_UPSERT_DETAILS,
    // Ativos
    Permission.ASSET_CREATE,
    Permission.ASSET_UPDATE,
    Permission.ASSET_REMOVE,
    // Certidões
    Permission.CERTIDAO_GENERATE,
    // Propostas
    Permission.PROPOSAL_CREATE,
    // LWR
    Permission.LWR_CREATE,
  ],
  ADMIN: [
    // Famílias
    Permission.FAMILY_GET_DASHBOARD,
    Permission.FAMILY_LIST_STORAGE,
    // Auditoria
    Permission.AUDIT_LIST_BY_FAMILY,
    // Interessados
    Permission.LEAD_LIST,
    // Pessoas
    Permission.PEOPLE_CREATE,
    Permission.PEOPLE_UPDATE,
    Permission.PEOPLE_REMOVE,
    Permission.PEOPLE_ATTACH_DOCUMENTS,
    Permission.PEOPLE_SET_PRIMARY_CONTACT,
    // Propriedades
    Permission.PROPERTY_CREATE,
    Permission.PROPERTY_UPDATE,
    Permission.PROPERTY_REMOVE,
    Permission.PROPERTY_ADD_OWNER,
    Permission.PROPERTY_UPDATE_OWNER,
    Permission.PROPERTY_REMOVE_OWNER,
    // Documentos
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_GENERATE_REQUIREMENTS,
    Permission.DOCUMENT_UPLOAD_VERSION,
    Permission.DOCUMENT_UPLOAD_BALANCE,
    // Sociedades
    Permission.COMPANY_CREATE,
    Permission.COMPANY_REMOVE,
    Permission.COMPANY_ADD_STAKEHOLDER,
    Permission.COMPANY_UPDATE_STAKEHOLDER,
    Permission.COMPANY_REMOVE_STAKEHOLDER,
    Permission.COMPANY_UPSERT_DETAILS,
    // Ativos
    Permission.ASSET_CREATE,
    Permission.ASSET_UPDATE,
    Permission.ASSET_REMOVE,
    // Certidões
    Permission.CERTIDAO_GENERATE,
    // Propostas
    Permission.PROPOSAL_CREATE,
    // LWR
    Permission.LWR_CREATE,
  ],
  CLIENTE: [],
};

/**
 * Verifica se um papel possui uma permissão específica.
 */
export function hasPermission(role: AppRole, permission: Permission): boolean {
  return PERMISSION_MATRIX[role].includes(permission);
}

/**
 * Verifica se o usuário autenticado possui uma permissão.
 */
export function userHasPermission(user: { role: AppRole } | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  return hasPermission(user.role, permission);
}

/**
 * Derivadores de UI  substituem os inline checks espalhados.
 */
export function canEdit(role: AppRole | null | undefined): boolean {
  return role === "SOCIO" || role === "ANALISTA";
}

export function canReview(role: AppRole | null | undefined): boolean {
  return role === "SOCIO";
}

export function canManage(role: AppRole | null | undefined): boolean {
  return role === "SOCIO" || role === "ANALISTA";
}

export function isTeam(role: AppRole | null | undefined): boolean {
  return role === "SOCIO" || role === "ANALISTA" || role === "ADMIN";
}

export function isSocio(role: AppRole | null | undefined): boolean {
  return role === "SOCIO";
}

export function isClient(role: AppRole | null | undefined): boolean {
  return role === "CLIENTE";
}

export function isAdmin(role: AppRole | null | undefined): boolean {
  return role === "SOCIO" || role === "ADMIN";
}

export function canCreate(role: AppRole | null | undefined): boolean {
  return role === "SOCIO" || role === "ANALISTA";
}
