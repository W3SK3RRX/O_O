import log from '../config/logger.js';

/**
 * Middleware para validar requisições usando Zod
 * @param {import('zod').ZodSchema} schema - Schema Zod para validação
 * @param {'body' | 'query' | 'params'} source - Fonte dos dados a validar
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      if (!schema) {
        return next(); // Sem schema, pula validação
      }
      
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
        req.validatedBody = validated;
      } else if (source === 'query') {
        req.validatedQuery = validated;
      } else if (source === 'params') {
        req.validatedParams = validated;
      }

      next();
    } catch (error) {
      log.error({ error, source }, 'Erro na validação');

      // Zod v3 usa `error.errors`; Zod v4 usa `error.issues`
      const issues = error.issues ?? error.errors;
      if (error.name === 'ZodError' && Array.isArray(issues)) {
        const messages = issues.map(e => `${e.path.join('.')}: ${e.message}`);
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: messages
        });
      }

      // Retorna erro genérico se não for ZodError
      return res.status(400).json({
        message: 'Erro na validação dos dados'
      });
    }
  };
};
