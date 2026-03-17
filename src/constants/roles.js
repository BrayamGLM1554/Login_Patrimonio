// ============================================================
//  SISTEMA DE PATRIMONIO - Roles y Jerarquía
// ============================================================

const ROLES = {
  DIRECTOR: 'director',
  COORDINADOR: 'coordinador',
  AUXILIAR: 'auxiliar',
};

// Jerarquía numérica: mayor número = mayor acceso
const ROLE_HIERARCHY = {
  [ROLES.DIRECTOR]: 3,
  [ROLES.COORDINADOR]: 2,
  [ROLES.AUXILIAR]: 1,
};

// Descripción de cada rol
const ROLE_DESCRIPTIONS = {
  [ROLES.DIRECTOR]: 'Acceso total al sistema. Rol más alto operativo.',
  [ROLES.COORDINADOR]: 'Acceso amplio al sistema. Restricciones pendientes de definir.',
  [ROLES.AUXILIAR]: 'Acceso básico. Restricciones específicas manejadas en el frontend.',
};

module.exports = { ROLES, ROLE_HIERARCHY, ROLE_DESCRIPTIONS };
