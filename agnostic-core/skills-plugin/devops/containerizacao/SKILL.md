---
name: containerizacao
description: 'Containerizacao: Dockerfile, multi-stage, Docker Compose, seguranca'
---

IMAGENS

- [ ] Usar imagens base minimas: alpine, slim, distroless
- [ ] Fixar versao da imagem base (node:20.11-alpine, nao node:latest)
- [ ] Escanear imagens por vulnerabilidades antes de deploy
- [ ] Nao instalar ferramentas desnecessarias no runtime (curl, vim, git)
- [ ] Tamanho alvo: < 200MB para apps web (< 50MB para Go/Rust com distroless)

| Tipo | Imagem base recomendada | Tamanho tipico |
|---|---|---|
| Node.js | node:20-alpine | 50-150MB |
| Python | python:3.12-slim | 100-200MB |
| Go | gcr.io/distroless/static | 5-20MB |
| Java | eclipse-temurin:21-jre-alpine | 100-200MB |

---

DOCKER COMPOSE

- [ ] Servicos com nomes claros e descritivos
- [ ] Healthcheck definido para cada servico
- [ ] Volumes nomeados para dados persistentes (banco, uploads)
- [ ] Rede explicita para comunicacao entre servicos
- [ ] Variaveis de ambiente via .env ou env_file (nunca hardcoded)
- [ ] depends_on com condition: service_healthy (nao apenas service_started)
- [ ] Limits de recursos (memory, cpus) para evitar que um servico consuma tudo

  Bom:
    services:
      api:
        build: .
        ports: ["3000:3000"]
        env_file: .env
        depends_on:
          db:
            condition: service_healthy
        deploy:
          resources:
            limits:
              memory: 512M
      db:
        image: postgres:16-alpine
        volumes:
          - pgdata:/var/lib/postgresql/data
        healthcheck:
          test: ["CMD-SHELL", "pg_isready"]
          interval: 10s
          timeout: 5s
    volumes:
      pgdata:

---

AMBIENTE DE DESENVOLVIMENTO

- [ ] docker-compose.dev.yml separado (ou override) com:
  - Volume bind-mount do codigo fonte para hot reload
  - Portas de debug expostas
  - Banco com dados de seed
- [ ] Dev container inicia em < 30 segundos
- [ ] Documentar no README: como subir o ambiente (1 comando)
- [ ] Paridade com producao: mesma versao de banco, mesmas variaveis (valores diferentes)

---

SEGURANCA

- [ ] Nunca colocar secrets na imagem (senhas, tokens, chaves)
- [ ] Secrets via variaveis de ambiente ou secret manager (nao em arquivos commitados)
- [ ] Container roda como nao-root
- [ ] Filesystem read-only quando possivel (--read-only)
- [ ] Sem capabilities desnecessarias (--cap-drop ALL, adicionar apenas o necessario)
- [ ] Imagem escaneada por vulnerabilidades no CI
- [ ] Imagens base atualizadas regularmente (rebuild semanal ou quando CVE critico)

---

ANTI-PATTERNS

  ✗ Imagem fat (> 1GB) com ferramentas de build no runtime
  ✗ Rodar como root sem necessidade
  ✗ COPY . . sem .dockerignore (copia .git, node_modules, .env)
  ✗ Usar :latest em producao (nao e reproduzivel)
  ✗ Hardcodar secrets no Dockerfile ou docker-compose.yml
  ✗ Container com multiplos processos (app + cron + worker)
  ✗ Ignorar healthchecks (container "up" mas app nao respondendo)
  ✗ Volumes anonimos para dados importantes (perdem-se ao remover container)

---

CHECKLIST DE CONTAINERIZACAO

- [ ] Dockerfile com multi-stage build
- [ ] .dockerignore configurado
- [ ] Imagem base minima e com versao fixa
- [ ] Container roda como nao-root
- [ ] Healthcheck definido
- [ ] Secrets nao estao na imagem
- [ ] docker-compose com volumes nomeados e healthchecks
- [ ] Ambiente de dev documentado e funcional com 1 comando
- [ ] Imagem escaneada por vulnerabilidades
- [ ] Tamanho da imagem final revisado

---

SKILLS A CONSULTAR

  skills/devops/deploy-procedures.md        Estrategias de deploy (rolling, blue-green, canary)
  skills/devops/pre-deploy-checklist.md     Checklist de pre-deploy
  skills/security/api-hardening.md          Hardening de seguranca

