// ============================================================
//  SISTEMA DE PATRIMONIO - Middleware de Autenticación
// ============================================================

const { verifyAccessToken } = require('../utils/jwt');
const { ROLES, ROLE_HIERARCHY } = require('../constants/roles');

/**
 * Middleware: verifica que el request tenga un Bearer token válido.
 * Si es válido, adjunta el payload decodificado en req.user.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      ok: false,
      codigo: 'TOKEN_REQUERIDO',
      mensaje: 'Se requiere un token de autenticación.',
    });
  }

  // Formato esperado: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({
      ok: false,
      codigo: 'TOKEN_FORMATO_INVALIDO',
      mensaje: 'El token debe enviarse como: Authorization: Bearer <token>',
    });
  }

  const token = parts[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { sub, nombre, email, rol, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        ok: false,
        codigo: 'TOKEN_EXPIRADO',
        mensaje: 'El token ha expirado. Por favor inicie sesión nuevamente.',
      });
    }
    return res.status(401).json({
      ok: false,
      codigo: 'TOKEN_INVALIDO',
      mensaje: 'Token inválido o malformado.',
    });
  }
}

/**
 * Middleware factory: restringe acceso a roles específicos.
 * Uso: authorizeRoles(ROLES.DIRECTOR, ROLES.COORDINADOR)
 *
 * @param {...string} rolesPermitidos - Roles que tienen acceso
 * @returns {function} middleware
 */
function authorizeRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        codigo: 'NO_AUTENTICADO',
        mensaje: 'Debe autenticarse primero.',
      });
    }

    const rolUsuario = req.user.rol;

    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({
        ok: false,
        codigo: 'ACCESO_DENEGADO',
        mensaje: `Acceso denegado. Tu rol (${rolUsuario}) no tiene permisos para este recurso.`,
        rol_requerido: rolesPermitidos,
      });
    }

    next();
  };
}

/**
 * Middleware factory: requiere un nivel mínimo de jerarquía.
 * Uso: authorizeMinLevel(2) → permite coordinador y director
 *
 * @param {number} nivelMinimo
 * @returns {function} middleware
 */
function authorizeMinLevel(nivelMinimo) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        codigo: 'NO_AUTENTICADO',
        mensaje: 'Debe autenticarse primero.',
      });
    }

    const nivelUsuario = ROLE_HIERARCHY[req.user.rol] ?? 0;

    if (nivelUsuario < nivelMinimo) {
      return res.status(403).json({
        ok: false,
        codigo: 'JERARQUIA_INSUFICIENTE',
        mensaje: `Acceso denegado. Se requiere un nivel de acceso mayor.`,
        tu_rol: req.user.rol,
        nivel_requerido: nivelMinimo,
        tu_nivel: nivelUsuario,
      });
    }

    next();
  };
}

module.exports = { authenticate, authorizeRoles, authorizeMinLevel };
