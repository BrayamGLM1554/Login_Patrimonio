// ============================================================
//  SISTEMA DE PATRIMONIO - Conexión a MongoDB
// ============================================================

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/patrimonio';

/**
 * Conecta a MongoDB usando Mongoose.
 * Reintenta automáticamente si falla al arrancar.
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB conectado: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err.message);
    console.error('   URI usada:', MONGO_URI.replace(/:\/\/.*@/, '://***@')); // oculta credenciales
    process.exit(1); // Si no hay BD, no tiene sentido seguir
  }
}

// Eventos de conexión
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB desconectado.');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconectado.');
});

module.exports = connectDB;
