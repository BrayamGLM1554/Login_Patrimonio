// ============================================================
//  SISTEMA DE PATRIMONIO - Modelo de Usuario (Mongoose)
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../constants/roles');

const UsuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio.'],
      trim: true,
      maxlength: [100, 'El nombre no puede superar 100 caracteres.'],
    },

    email: {
      type: String,
      required: [true, 'El email es obligatorio.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'El email no tiene un formato válido.'],
    },

    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria.'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres.'],
      select: false, // Nunca se devuelve en queries por defecto
    },

    rol: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: `El rol debe ser uno de: ${Object.values(ROLES).join(', ')}.`,
      },
      required: [true, 'El rol es obligatorio.'],
    },

    activo: {
      type: Boolean,
      default: true,
    },

    // Para invalidar todos los tokens si el usuario cambia su contraseña
    password_cambiado_en: {
      type: Date,
      default: null,
    },

    ultimo_login: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'creado_en', updatedAt: 'actualizado_en' },
    versionKey: false,
  }
);

// ── Índices ───────────────────────────────────────────────────
UsuarioSchema.index({ rol: 1 });

// ── Hook: hashear contraseña antes de guardar ─────────────────
UsuarioSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.password_cambiado_en = new Date();
});

// ── Método de instancia: comparar contraseña ─────────────────
UsuarioSchema.methods.compararPassword = async function (candidata) {
  return bcrypt.compare(candidata, this.password);
};

// ── Método de instancia: datos públicos (sin password) ───────
UsuarioSchema.methods.toPublic = function () {
  return {
    id: this._id,
    nombre: this.nombre,
    email: this.email,
    rol: this.rol,
    activo: this.activo,
    ultimo_login: this.ultimo_login,
    creado_en: this.creado_en,
  };
};

// ── Método estático: buscar con password incluido ────────────
UsuarioSchema.statics.findByEmailConPassword = function (email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

const Usuario = mongoose.model('Usuario', UsuarioSchema);

module.exports = Usuario;
