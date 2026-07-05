import log from '../config/logger.js';

// Normaliza erros comuns do Mongoose para respostas operacionais (4xx) em vez
// de 500 genérico: ObjectId inválido, validação de schema e chave duplicada.
const normalizeMongooseError = (err) => {
  if (err.name === 'CastError') {
    return { statusCode: 400, code: 'INVALID_ID', message: 'Identificador inválido' };
  }
  if (err.name === 'ValidationError') {
    return { statusCode: 422, code: 'VALIDATION_ERROR', message: 'Dados inválidos' };
  }
  if (err.code === 11000) {
    return { statusCode: 409, code: 'CONFLICT', message: 'Registro duplicado' };
  }
  return null;
};

const errorHandler = (err, req, res, next) => {
  const requestId = req.requestId || 'sem-id';

  if (err.isOperational) {
    log.warn({ requestId, code: err.code, message: err.message }, 'Erro operacional');
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  const mongoose = normalizeMongooseError(err);
  if (mongoose) {
    log.warn({ requestId, code: mongoose.code }, 'Erro de banco tratado');
    return res.status(mongoose.statusCode).json({
      error: { code: mongoose.code, message: mongoose.message },
    });
  }

  log.error({ requestId, err }, 'Erro não tratado');
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erro interno. Tente novamente em alguns instantes.',
    },
  });
};

export default errorHandler;
