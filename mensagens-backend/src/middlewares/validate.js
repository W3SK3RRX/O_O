import { ValidationError } from './errorClasses.js';

/**
 * Middleware para validar requisições usando Zod.
 * Em caso de falha, lança ValidationError (422) — o errorHandler central
 * responde no formato padrão { error: { code, message, details } }.
 * @param {import('zod').ZodSchema} schema - Schema Zod para validação
 * @param {'body' | 'query' | 'params'} source - Fonte dos dados a validar
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
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

    const result = schema.safeParse(data);

    if (!result.success) {
      // Zod v4 usa `error.issues`
      const issues = result.error.issues ?? [];
      const details = issues.map((e) => `${e.path.join('.')}: ${e.message}`);
      return next(new ValidationError('Dados inválidos', details));
    }

    // Não modifica objetos nativos do Express (somente leitura no Express 5).
    // Armazena os dados validados em uma propriedade separada.
    if (source === 'body') {
      req.body = result.data;
      req.validatedBody = result.data;
    } else if (source === 'query') {
      req.validatedQuery = result.data;
    } else {
      req.validatedParams = result.data;
    }

    next();
  };
};
