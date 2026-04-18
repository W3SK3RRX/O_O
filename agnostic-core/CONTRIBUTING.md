# Contribuindo com o acervo

Quer adicionar uma boa ideia? Bem-vindo.

---

## O que é uma boa adição?

Qualquer padrão, prática ou referência que:

- Você já usou em um projeto real e funcionou
- Outros devs poderiam encontrar útil ao navegar o acervo
- Se aplica a mais de um contexto (não é específica demais a um único projeto)

---

## Como estruturar

Não existe template obrigatório. Escreva de forma que outra pessoa entenda rapidamente
o que é a ideia e por que ela pode ser útil. Um bom arquivo de ideia geralmente tem:

- O que é (1-2 linhas)
- Quando faz sentido usar
- Os pontos concretos da ideia (lista, checklist, ou texto livre — o que funcionar melhor)
- Referências externas se houver

---

## Onde colocar

| Domínio | Pasta |
|---|---|
| Segurança | `skills/security/` |
| Frontend (HTML/CSS/JS) | `skills/frontend/` |
| UX/UI | `skills/ux-ui/` |
| Banco de dados | `skills/database/` |
| Backend | `skills/backend/` |
| Revisão de código | `skills/audit/` |
| Infra / CI-CD | `skills/devops/` |
| Performance | `skills/performance/` |
| Cache | `skills/cache/` |
| Automações | `skills/automacao/` |
| MCP servers | `skills/mcp/` |
| IA e LLMs | `skills/ai/` |
| Padrões de agents (reviewers) | `agents/reviewers/` |
| Padrões de agents (generators) | `agents/generators/` |
| Padrões de agents (validators) | `agents/validators/` |
| Padrões de agents (specialists) | `agents/specialists/` |
| Templates de workflow | `commands/workflows/` |

Nota sobre tipos de agents:
  - Reviewers: auditam codigo existente e geram relatorios
  - Generators: criam artefatos (boilerplate, docs, roadmaps)
  - Validators: aprovam ou bloqueiam operacoes (migrations)
  - Specialists: fornecem expertise de dominio (DevOps, mobile, SEO, database)

Se a sua ideia não se encaixa em nenhuma dessas categorias, crie uma nova pasta.

---

## Fluxo

1. Fork do repositório
2. Crie um branch: `ideia/nome-da-contribuicao`
3. Escreva o arquivo com a ideia
4. Abra um PR descrevendo o que é e em que contexto você usaria
