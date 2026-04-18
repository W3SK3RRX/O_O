Generic Scripts

Scripts reutilizaveis para diagnostico, auditoria e manutencao de projetos.
Independentes de IDE ou CLI — funcionam em qualquer terminal.

---

AUDITORIA DE SEGURANCA

npm audit (Node.js):
  # Verificar vulnerabilidades conhecidas
  npm audit

  # Correcao automatica das seguras
  npm audit fix

  # Relatorio detalhado em JSON
  npm audit --json > audit-report.json

  # Falhar CI se houver HIGH ou CRITICAL
  npm audit --audit-level=high

pip-audit (Python):
  pip install pip-audit
  pip-audit

Buscar secrets no codigo:
  # Detectar possiveis API keys, passwords hardcoded
  grep -rn --include="*.js" --include="*.ts" --include="*.py" \
    -E "(api_key|apikey|api-key|password|secret|token)\s*=\s*['\"][^'\"]{8,}" \
    src/ --exclude-dir=node_modules

---

ANALISE DE QUALIDADE DE CODIGO

Buscar TODO/FIXME acumulados:
  # Listar todos com arquivo e linha
  grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.js" --include="*.ts" --include="*.py"

  # Contar por arquivo
  grep -rn "TODO\|FIXME" src/ | cut -d: -f1 | sort | uniq -c | sort -rn

Detectar arquivos grandes (candidatos a refactoring):
  # Arquivos acima de 200 linhas
  find src/ -name "*.js" -o -name "*.ts" -o -name "*.py" | \
    xargs wc -l | sort -rn | awk '$1 > 200' | head -20

Duplicacao de codigo (Node.js):
  npm install -g jscpd
  jscpd src/ --min-lines 10 --min-tokens 70

---

DIAGNOSTICO DE BANCO

MongoDB — queries lentas no log:
  # Ativar profiler para queries > 100ms
  db.setProfilingLevel(1, { slowms: 100 })

  # Ver queries lentas recentes
  db.system.profile.find().sort({ millis: -1 }).limit(20).pretty()

  # Indices existentes
  db.collection.getIndexes()

  # Analise de query (EXPLAIN)
  db.collection.find({ userId: "123" }).explain("executionStats")

PostgreSQL — queries lentas:
  # Ver queries mais lentas (requer pg_stat_statements)
  SELECT query, calls, mean_exec_time, total_exec_time
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC
  LIMIT 20;

  # Tabelas sem vacuum recente
  SELECT relname, last_vacuum, last_autovacuum, n_dead_tup
  FROM pg_stat_user_tables
  WHERE n_dead_tup > 10000
  ORDER BY n_dead_tup DESC;

  # Indices nao utilizados
  SELECT indexrelname, idx_scan, idx_tup_read, idx_tup_fetch
  FROM pg_stat_user_indexes
  WHERE idx_scan = 0
  ORDER BY pg_relation_size(indexrelid) DESC;

Redis:
  # Info geral
  redis-cli INFO memory

  # Chaves mais grandes (cuidado em producao com muitas chaves)
  redis-cli --bigkeys

  # Estatisticas de hit rate
  redis-cli INFO stats | grep -E "keyspace_hits|keyspace_misses"

---

GIT — ANALISE DE HISTORICO

Arquivos mais modificados (hotspots):
  git log --name-only --pretty=format: | grep -v "^$" | sort | uniq -c | sort -rn | head -20

Commits por autor:
  git shortlog -sn --no-merges

Tamanho de PRs por commit (para identificar commits grandes demais):
  git log --stat --no-merges | grep "changed" | awk '{print $1, $NF}' | sort -rn | head -20

Branches remotos sem merge:
  git branch -r --no-merged main | grep -v HEAD

---

MAKEFILE TEMPLATE

Adicione ao projeto para padronizar comandos de desenvolvimento:

  # Makefile
  .PHONY: install dev test lint audit clean

  install:
  	npm ci

  dev:
  	npm run dev

  test:
  	npm test

  test-coverage:
  	npm run test:coverage

  lint:
  	npm run lint

  audit:
  	npm audit --audit-level=high

  pre-deploy:
  	@echo "=== Pre-deploy checklist ==="
  	npm run lint
  	npm test
  	npm audit --audit-level=high
  	@echo "=== OK para deploy ==="

  clean:
  	rm -rf node_modules dist coverage

  # Python equivalent:
  # install: pip install -r requirements.txt -r requirements-dev.txt
  # test: pytest tests/ -v
  # lint: ruff check src/ && black --check src/
  # audit: pip-audit && bandit -r src/ -ll

---

GITHUB ACTIONS — SNIPPETS

CI basico (Node.js):
  name: CI
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: '20'
            cache: 'npm'
        - run: npm ci
        - run: npm run lint
        - run: npm test
        - run: npm audit --audit-level=high

Atualizar submodulo agnostic-core no CI:
  - name: Checkout com submodulos
    uses: actions/checkout@v4
    with:
      submodules: recursive

  # OU manualmente:
  - run: git submodule update --init --remote .agnostic-core
