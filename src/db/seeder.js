// ============================================================
//  SISTEMA DE PATRIMONIO - Seeder de Usuarios Iniciales
//  Ejecutar: node src/db/seeder.js
// ============================================================

require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const { ROLES } = require('../constants/roles');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/patrimonio';

const USUARIOS_INICIALES = [
  {
    nombre: 'Carlos Ramírez',
    email: 'director@patrimonio.com',
    password: 'Director2024!',
    rol: ROLES.DIRECTOR,
    activo: true,
  },
  {
    nombre: 'María González',
    email: 'coordinador@patrimonio.com',
    password: 'Coord2024!',
    rol: ROLES.COORDINADOR,
    activo: true,
  },
  {
    nombre: 'Luis Hernández',
    email: 'auxiliar@patrimonio.com',
    password: 'Aux2024!',
    rol: ROLES.AUXILIAR,
    activo: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB conectado para seeding...\n');

    // Limpiar colección existente
    await Usuario.deleteMany({});
    console.log('Usuarios anteriores eliminados.');

    // Insertar usuarios (el hook pre-save hashea las contraseñas)
    for (const data of USUARIOS_INICIALES) {
      const usuario = new Usuario(data);
      await usuario.save();
      console.log(`Usuario creado: ${data.email} (${data.rol})`);
    }

    console.log('\nSeeder completado exitosamente.');
    console.log('\nCredenciales de prueba:');
    console.log('  director@patrimonio.com     → Director2024!');
    console.log('  coordinador@patrimonio.com  → Coord2024!');
    console.log('  auxiliar@patrimonio.com     → Aux2024!');
  } catch (err) {
    console.error('Error en seeder:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
