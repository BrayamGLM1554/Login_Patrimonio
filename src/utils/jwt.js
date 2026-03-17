// ============================================================
//  SISTEMA DE PATRIMONIO - Utilidades JWT
// ============================================================

const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev_secret_cambiar_en_produccion';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Genera un access token (corta duración).
 * @param {object} payload - Datos a incluir en el token
 * @returns {string} JWT firmado
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

/**
 * Genera un refresh token (larga duración).
 * @param {object} payload
 * @returns {string} JWT firmado
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, SECRET + '_refresh', { expiresIn: REFRESH_EXPIRES_IN });
}

/**
 * Verifica y decodifica un access token.
 * @param {string} token
 * @returns {object} payload decodificado
 * @throws {Error} si el token es inválido o expirado
 */
function verifyAccessToken(token) {
  return jwt.verify(token, SECRET);
}

/**
 * Verifica y decodifica un refresh token.
 * @param {string} token
 * @returns {object} payload decodificado
 * @throws {Error} si el token es inválido o expirado
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, SECRET + '_refresh');
}

/**
 * Construye el payload estándar del sistema de patrimonio.
 * Contiene solo lo necesario (no datos sensibles).
 * @param {object} user
 * @returns {object}
 */
function buildPayload(user) {
  return {
    sub: user._id ? user._id.toString() : user.id, // Compatible MongoDB (_id) y objetos planos
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,          // 'director' | 'coordinador' | 'auxiliar'
    iat: Math.floor(Date.now() / 1000),
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  buildPayload,
};
