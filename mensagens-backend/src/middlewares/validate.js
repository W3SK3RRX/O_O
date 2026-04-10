import log from '../config/logger.js';

/**
 * Middleware para validar requisições usando Zod
 * @param {import('zod').ZodSchema} schema - Schema Zod para validação
 * @param {'body' | 'query' | 'params'} source - Fonte dos dados a validar
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      let data;
      
      if (source === 'body') {
        data = req.body;
      } else if (source === 'query') {
        data = req.query;
      } else {
        data = req.params;
      }
      
      const validated = schema.parse(data);
      
      // Não modifica objetos nativos do Express (somente leitura no Express 5)
      // Armazena os dados validados em uma propriedade separada
      if (source === 'body') {
        req.body = validated;
      } else if (source === 'query') {
        req.validatedQuery = validated;
      } else if (source === 'params') {
        req.validatedParams = validated;
      }
      
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: messages 
        });
      }
      
      log.error({ error }, 'Erro na validação');
      next(error);
    }
  };
};
