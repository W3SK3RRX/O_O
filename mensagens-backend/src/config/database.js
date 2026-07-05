import mongoose from 'mongoose';
import log from './logger.js';

const connectDatabase = async () => {
  // Observabilidade de reconexão em runtime (não só na falha inicial).
  mongoose.connection.on('disconnected', () => log.warn('MongoDB desconectado'));
  mongoose.connection.on('reconnected', () => log.info('MongoDB reconectado'));
  mongoose.connection.on('error', (error) => log.error({ error: error.message }, 'Erro na conexão MongoDB'));

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 30_000,
      serverSelectionTimeoutMS: 5_000,
    });
    log.info('MongoDB conectado com sucesso');
  } catch (error) {
    log.fatal({ error: error.message }, 'Erro ao conectar no MongoDB');
    process.exit(1);
  }
};

export default connectDatabase;
