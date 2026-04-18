# Automações Úteis

Ideias de automações que economizam tempo em tarefas repetitivas de desenvolvimento.
Avalie o que faz sentido para o seu projeto e stack.

---

## Git Hooks

Hooks são scripts que rodam automaticamente em eventos do git.
Ferramentas como `husky` (Node) ou `pre-commit` (Python) facilitam o setup.

### pre-commit
Roda antes de cada commit — bom para validações rápidas.

```bash
# Exemplos do que pode rodar no pre-commit:
npm run lint          # lint do código
npm run format:check  # checar formatação
npx tsc --noEmit      # typecheck sem compilar
```

### commit-msg
Valida a mensagem do commit antes de aceitar.
Útil para manter Conventional Commits: `feat:`, `fix:`, `docs:`, etc.

```bash
# commitlint com husky
npx commitlint --edit $1
```

### pre-push
Roda antes de fazer push — bom para testes mais pesados.

```bash
npm test
```

### post-commit — Auto-Push (Claude Code)

Hook `PostToolUse` do Claude Code que detecta commits e faz push automaticamente.
Ideal para manter o remoto sempre sincronizado durante sessões assistidas.

```json
// ~/.claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".agnostic-core/scripts/hooks/post-tool-use-autopush"
          }
        ]
      }
    ]
  }
}
```

O script está em `scripts/hooks/post-tool-use-autopush`.
Comportamento:
- Detecta se o comando Bash executado continha `git commit`
- Faz `git push` automático para a branch atual
- Retry de 1x em caso de falha de rede
- Nunca bloqueia o fluxo — se falhar, apenas avisa

Instalação automática via `scripts/install.sh` (passo 5/6).

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
