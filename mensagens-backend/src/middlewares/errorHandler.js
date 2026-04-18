import log from '../config/logger.js';

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

  log.error({ requestId, err }, 'Erro não tratado');
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erro interno. Tente novamente em alguns instantes.',
    },
  });
};

export default errorHandler;
