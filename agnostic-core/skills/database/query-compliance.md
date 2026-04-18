# Banco de Dados — Queries e Schema

Boas práticas para queries e schema em segurança, performance e manutenibilidade.
Útil em code review de mudanças de banco, auditoria de performance ou ao revisar migrations.

---

Seguranca
- Sem SQL raw com interpolacao de string (usar parametros)
- Usuario do banco com permissoes minimas (least privilege)
- Dados sensiveis criptografados em repouso (senhas, CPF, cartao)
- Sem credenciais hardcoded no codigo

Performance
- Indexes criados para colunas usadas em WHERE, JOIN, ORDER BY
- Evitar SELECT * em queries de producao
- N+1 queries identificadas e resolvidas
- Paginacao implementada em listagens (LIMIT/OFFSET ou cursor)
- Queries lentas analisadas com EXPLAIN ANALYZE

Schema e Migrations
- Migrations reversiveis (up e down)
- Sem alteracao de coluna em producao sem migration testada em staging
- Foreign keys com ON DELETE definido explicitamente
- Timestamps (created_at, updated_at) em todas as tabelas principais
- Soft delete implementado onde necessario (deleted_at)

Backup e Disponibilidade
- Backup automatico configurado e testado
- Restore testado periodicamente
- Connection pool configurado adequadamente

Comandos uteis

PostgreSQL - queries lentas:
SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;

MongoDB - explain:
db.collection.find(query).explain("executionStats")
