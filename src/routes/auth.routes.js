// ============================================================
//  SISTEMA DE PATRIMONIO - Rutas de Autenticación
// ============================================================

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const { login, refresh, logout, me, cambiarPassword } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    ok: false,
    codigo: 'DEMASIADOS_INTENTOS',
    mensaje: 'Demasiados intentos de inicio de sesión. Intenta en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/login
router.post('/login', loginLimiter, login);

// POST /api/auth/refresh
router.post('/refresh', refresh);

// POST /api/auth/logout
router.post('/logout', authenticate, logout);

// GET /api/auth/me
router.get('/me', authenticate, me);

// PUT /api/auth/cambiar-password
router.put('/cambiar-password', authenticate, cambiarPassword);

module.exports = router;
