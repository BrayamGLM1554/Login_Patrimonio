// ============================================================
//  SISTEMA DE PATRIMONIO - Rutas de Ejemplo (Protegidas por Rol)
//  Este archivo muestra cómo usar los middlewares en tus rutas reales.
//  Reemplaza los handlers con tu lógica de negocio.
// ============================================================

const express = require('express');
const router = express.Router();

const { authenticate, authorizeRoles, authorizeMinLevel } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');

// ─── Ejemplo: Bienes / Activos ───────────────────────────────────────────────

/**
 * GET /api/bienes
 * Todos los roles pueden consultar bienes.
 */
router.get(
  '/bienes',
  authenticate,
  (req, res) => {
    res.json({
      ok: true,
      mensaje: `Lista de bienes (acceso por rol: ${req.user.rol})`,
      datos: [
        { id: 1, descripcion: 'Laptop Dell XPS', serie: 'SN-001', valor: 25000 },
        { id: 2, descripcion: 'Proyector Epson', serie: 'SN-002', valor: 8000 },
      ],
    });
  }
);

/**
 * POST /api/bienes
 * Solo Director y Coordinador pueden registrar bienes.
 */
router.post(
  '/bienes',
  authenticate,
  authorizeRoles(ROLES.DIRECTOR, ROLES.COORDINADOR),
  (req, res) => {
    res.json({
      ok: true,
      mensaje: 'Bien registrado correctamente.',
      ejecutado_por: req.user.nombre,
      rol: req.user.rol,
    });
  }
);

/**
 * DELETE /api/bienes/:id
 * Solo el Director puede eliminar bienes.
 */
router.delete(
  '/bienes/:id',
  authenticate,
  authorizeRoles(ROLES.DIRECTOR),
  (req, res) => {
    res.json({
      ok: true,
      mensaje: `Bien ${req.params.id} eliminado.`,
      ejecutado_por: req.user.nombre,
    });
  }
);

// ─── Ejemplo: Reportes ───────────────────────────────────────────────────────

/**
 * GET /api/reportes
 * Solo Director y Coordinador (nivel >= 2).
 */
router.get(
  '/reportes',
  authenticate,
  authorizeMinLevel(2),
  (req, res) => {
    res.json({
      ok: true,
      mensaje: 'Reportes del sistema de patrimonio.',
      rol_acceso: req.user.rol,
      reportes: ['Inventario General', 'Bajas del periodo', 'Altas del periodo'],
    });
  }
);

/**
 * GET /api/reportes/auditoria
 * Solo el Director puede ver reportes de auditoría.
 */
router.get(
  '/reportes/auditoria',
  authenticate,
  authorizeRoles(ROLES.DIRECTOR),
  (req, res) => {
    res.json({
      ok: true,
      mensaje: 'Reporte de auditoría completo.',
      datos: { movimientos: 142, usuarios_activos: 3 },
    });
  }
);

// ─── Ejemplo: Usuarios del sistema ──────────────────────────────────────────

/**
 * GET /api/usuarios
 * Solo Director puede ver todos los usuarios.
 */
router.get(
  '/usuarios',
  authenticate,
  authorizeRoles(ROLES.DIRECTOR),
  (req, res) => {
    res.json({
      ok: true,
      mensaje: 'Lista de usuarios del sistema.',
      datos: [
        { id: 1, nombre: 'Carlos Ramírez', rol: ROLES.DIRECTOR },
        { id: 2, nombre: 'María González', rol: ROLES.COORDINADOR },
        { id: 3, nombre: 'Luis Hernández', rol: ROLES.AUXILIAR },
      ],
    });
  }
);

module.exports = router;
