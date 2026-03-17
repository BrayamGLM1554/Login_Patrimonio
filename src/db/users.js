// ============================================================
//  SISTEMA DE PATRIMONIO - Base de datos simulada (usuarios)
//  En producción: reemplazar con conexión real (MySQL, PostgreSQL, etc.)
// ============================================================

const bcrypt = require('bcryptjs');
const { ROLES } = require('../constants/roles');

// Usuarios precargados (contraseñas hasheadas)
// Contraseñas en texto plano para referencia del dev:
//   director@patrimonio.com  → Director2024!
//   coordinador@patrimonio.com → Coord2024!
//   auxiliar@patrimonio.com  → Aux2024!

const USUARIOS = [
  {
    id: 1,
    nombre: 'Carlos Ramírez',
    email: 'director@patrimonio.com',
    // bcrypt hash de "Director2024!"
    password: bcrypt.hashSync('Director2024!', 10),
    rol: ROLES.DIRECTOR,
    activo: true,
    creado_en: new Date('2024-01-01'),
  },
  {
    id: 2,
    nombre: 'María González',
    email: 'coordinador@patrimonio.com',
    password: bcrypt.hashSync('Coord2024!', 10),
    rol: ROLES.COORDINADOR,
    activo: true,
    creado_en: new Date('2024-01-15'),
  },
  {
    id: 3,
    nombre: 'Luis Hernández',
    email: 'auxiliar@patrimonio.com',
    password: bcrypt.hashSync('Aux2024!', 10),
    rol: ROLES.AUXILIAR,
    activo: true,
    creado_en: new Date('2024-02-01'),
  },
];

/**
 * Busca un usuario por email.
 * @param {string} email
 * @returns {object|null}
 */
function findByEmail(email) {
  return USUARIOS.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Busca un usuario por ID.
 * @param {number} id
 * @returns {object|null}
 */
function findById(id) {
  return USUARIOS.find(u => u.id === id) || null;
}

/**
 * Devuelve el usuario sin el campo password.
 * @param {object} user
 * @returns {object}
 */
function sanitize(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

module.exports = { findByEmail, findById, sanitize };
