---
name: automacoes-uteis
description: 'Ideias de automacoes para tarefas repetitivas de desenvolvimento'
---

## Scripts de setup de ambiente

Um script `setup.sh` (ou `Makefile`) bem feito evita o "funciona na minha máquina".

Ideias do que incluir:
- Verificar versão de Node/Python/etc e avisar se incompatível
- Instalar dependências (`npm install`, `pip install -r requirements.txt`)
- Copiar `.env.example` → `.env` se `.env` não existir
- Rodar migrations do banco
- Seed de dados para desenvolvimento

```bash
#!/bin/bash
# Exemplo: setup.sh
set -e

echo "Verificando dependências..."
node -v || { echo "Node.js não encontrado"; exit 1; }

echo "Instalando pacotes..."
npm install

echo "Configurando ambiente..."
[ ! -f .env ] && cp .env.example .env && echo ".env criado"

echo "Rodando migrations..."
npm run db:migrate

echo "Setup concluído."
```

---

## Makefile como interface de comandos

Um `Makefile` na raiz centraliza os comandos do projeto — qualquer dev sabe o que está disponível.

```makefile
.PHONY: setup test lint build deploy

setup:
	./scripts/setup.sh

test:
	npm test

lint:
	npm run lint

build:
	npm run build

db-migrate:
	npm run db:migrate

db-seed:
	npm run db:seed
```

---

## CI/CD — automações de pipeline

Ideias de automações para GitHub Actions (ou equivalente):

### Lint e testes em todo PR
```yaml
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm test
```

### Comentário automático com cobertura de testes
Ferramentas como `jest-coverage-report-action` postam um resumo de coverage diretamente no PR.

### Dependency audit no CI
```yaml
- run: npm audit --audit-level=high
```

### Preview deploy automático por branch
Vercel, Netlify e Railway suportam deploy automático de previews a cada PR — nenhuma config manual.

---

## Watchers e hot-reload

- `nodemon` para reiniciar Node.js automaticamente ao salvar
- `watchexec` como alternativa mais leve e agnóstica de linguagem
- `vite`, `webpack-dev-server`, `next dev` já têm hot-reload embutido

```json
// package.json
"scripts": {
  "dev": "nodemon src/index.js"
}
```

---

## Geração automática de documentação

- **JSDoc + typedoc:** gera documentação HTML a partir de comentários no código TypeScript/JS
- **Swagger/OpenAPI auto-gerado:** `tsoa`, `fastify-swagger`, `nestjs/swagger`
- **Changelog automático:** `conventional-changelog` gera CHANGELOG.md a partir dos commits

```bash
# Gerar changelog a partir de commits convencionais
npx conventional-changelog -p angular -i CHANGELOG.md -s
```

---

## Testes de regressão visual

Para projetos de frontend, capturas de tela automatizadas detectam mudanças visuais não intencionais.

- **Playwright:** `expect(page).toHaveScreenshot()` com comparação automática
- **Storybook + Chromatic:** testa componentes em isolamento com diff visual
- **Percy:** integra com CI para revisão visual em PRs

---

## Automação de tarefas de banco

- Scripts de seed por ambiente (desenvolvimento diferente de staging)
- Migrations automáticas no startup da aplicação (quando faz sentido)
- Script de reset de banco para desenvolvimento: `npm run db:reset`

```bash
# Exemplo: db-reset.sh
npm run db:drop && npm run db:create && npm run db:migrate && npm run db:seed
```

---

Ver também: `skills/devops/pre-deploy-checklist.md`, `skills/mcp/ideias-de-mcp.md`

