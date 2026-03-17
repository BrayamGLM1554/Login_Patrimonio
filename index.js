// ============================================================
//  SISTEMA DE PATRIMONIO - Servidor Principal
// ============================================================

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./src/db/connection');

const authRoutes = require('./src/routes/auth.routes');
const protectedRoutes = require('./src/routes/protected.routes');

const app = express();
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;

// ── Seguridad y parseo ────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ── Rutas ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    ok: true,
    sistema: 'Área de Patrimonio - Auth API',
    version: '1.0.0',
    mongodb: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    codigo: 'RUTA_NO_ENCONTRADA',
    mensaje: `La ruta ${req.method} ${req.originalUrl} no existe.`,
  });
});

// ── Error global ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    ok: false,
    codigo: 'ERROR_INTERNO',
    mensaje: 'Ocurrió un error interno en el servidor.',
  });
});

// ── Inicio: primero BD, luego servidor ───────────────────────
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 API de Patrimonio corriendo en puerto ${PORT}`);
    console.log(`   Modo:    ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health:  http://localhost:${PORT}/health`);
    console.log(`   Login:   POST http://localhost:${PORT}/api/auth/login\n`);
  });
}

start();

module.exports = app;
