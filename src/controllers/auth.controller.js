// ============================================================
//  SISTEMA DE PATRIMONIO - Controlador de Autenticación (MongoDB)
// ============================================================

const Usuario = require('../models/Usuario');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  buildPayload,
} = require('../utils/jwt');

// Almacén en memoria de refresh tokens invalidados (logout).
// En producción con múltiples instancias: usar Redis.
const tokenBlacklist = new Set();

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        codigo: 'CAMPOS_REQUERIDOS',
        mensaje: 'El email y la contraseña son obligatorios.',
      });
    }

    const user = await Usuario.findByEmailConPassword(email);

    const ERROR_CREDENCIALES = {
      ok: false,
      codigo: 'CREDENCIALES_INVALIDAS',
      mensaje: 'Email o contraseña incorrectos.',
    };

    if (!user) return res.status(401).json(ERROR_CREDENCIALES);

    if (!user.activo) {
      return res.status(403).json({
        ok: false,
        codigo: 'CUENTA_INACTIVA',
        mensaje: 'Tu cuenta está desactivada. Contacta al administrador.',
      });
    }

    const passwordValida = await user.compararPassword(password);
    if (!passwordValida) return res.status(401).json(ERROR_CREDENCIALES);

    user.ultimo_login = new Date();
    await user.save({ validateBeforeSave: false });

    const payload = buildPayload(user);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ sub: user._id.toString() });

    return res.status(200).json({
      ok: true,
      mensaje: `Bienvenido, ${user.nombre}.`,
      datos: {
        usuario: user.toPublic(),
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expira_en: process.env.JWT_EXPIRES_IN || '8h',
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ ok: false, codigo: 'ERROR_INTERNO', mensaje: 'Error al procesar el inicio de sesión.' });
  }
}

/**
 * POST /api/auth/refresh
 */
async function refresh(req, res) {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ ok: false, codigo: 'REFRESH_TOKEN_REQUERIDO', mensaje: 'Se requiere el refresh_token.' });
    }

    if (tokenBlacklist.has(refresh_token)) {
      return res.status(401).json({ ok: false, codigo: 'TOKEN_INVALIDADO', mensaje: 'El refresh token fue invalidado. Inicie sesión nuevamente.' });
    }

    const decoded = verifyRefreshToken(refresh_token);
    const user = await Usuario.findById(decoded.sub);

    if (!user || !user.activo) {
      return res.status(401).json({ ok: false, codigo: 'USUARIO_NO_ENCONTRADO', mensaje: 'El usuario no existe o está inactivo.' });
    }

    if (user.password_cambiado_en) {
      const tokenEmitidoEn = decoded.iat * 1000;
      if (tokenEmitidoEn < user.password_cambiado_en.getTime()) {
        return res.status(401).json({ ok: false, codigo: 'TOKEN_OBSOLETO', mensaje: 'La contraseña fue cambiada. Inicia sesión nuevamente.' });
      }
    }

    const payload = buildPayload(user);
    const newAccessToken = generateAccessToken(payload);

    return res.status(200).json({
      ok: true,
      mensaje: 'Token renovado exitosamente.',
      datos: { access_token: newAccessToken, token_type: 'Bearer', expira_en: process.env.JWT_EXPIRES_IN || '8h' },
    });
  } catch (err) {
    return res.status(401).json({ ok: false, codigo: 'REFRESH_TOKEN_INVALIDO', mensaje: 'El refresh token es inválido o ha expirado.' });
  }
}

/**
 * POST /api/auth/logout
 */
function logout(req, res) {
  const { refresh_token } = req.body;
  if (refresh_token) tokenBlacklist.add(refresh_token);
  return res.status(200).json({ ok: true, mensaje: 'Sesión cerrada correctamente.' });
}

/**
 * GET /api/auth/me
 */
async function me(req, res) {
  try {
    const user = await Usuario.findById(req.user.sub);
    if (!user) return res.status(404).json({ ok: false, codigo: 'USUARIO_NO_ENCONTRADO', mensaje: 'El usuario no fue encontrado.' });

    return res.status(200).json({
      ok: true,
      datos: {
        usuario: user.toPublic(),
        token_info: {
          rol: req.user.rol,
          emitido_en: new Date(req.user.iat * 1000).toISOString(),
          expira_en: new Date(req.user.exp * 1000).toISOString(),
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, codigo: 'ERROR_INTERNO', mensaje: 'Error al obtener el perfil.' });
  }
}

/**
 * PUT /api/auth/cambiar-password
 */
async function cambiarPassword(req, res) {
  try {
    const { password_actual, password_nueva } = req.body;

    if (!password_actual || !password_nueva) {
      return res.status(400).json({ ok: false, codigo: 'CAMPOS_REQUERIDOS', mensaje: 'Se requieren password_actual y password_nueva.' });
    }

    if (password_nueva.length < 8) {
      return res.status(400).json({ ok: false, codigo: 'PASSWORD_INSEGURA', mensaje: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    }

    const user = await Usuario.findById(req.user.sub).select('+password');
    const valida = await user.compararPassword(password_actual);

    if (!valida) {
      return res.status(401).json({ ok: false, codigo: 'PASSWORD_INCORRECTA', mensaje: 'La contraseña actual es incorrecta.' });
    }

    user.password = password_nueva;
    await user.save();

    return res.status(200).json({ ok: true, mensaje: 'Contraseña actualizada. Inicia sesión nuevamente.' });
  } catch (err) {
    return res.status(500).json({ ok: false, codigo: 'ERROR_INTERNO', mensaje: 'Error al cambiar la contraseña.' });
  }
}

module.exports = { login, refresh, logout, me, cambiarPassword };
