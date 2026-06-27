import pino from 'pino';

const log = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' 
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
  // Serializa objetos Error (message, stack, code...) — sem isto o pino logava {}.
  // Cobre tanto a chave `err` (padrão) quanto `error`, usada pelos controllers.
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
});

export default log;
