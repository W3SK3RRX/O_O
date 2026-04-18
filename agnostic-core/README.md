# agnostic-core

> Acervo de boas ideias para desenvolvimento de software.
> Navegue livremente. Use o que fizer sentido para o seu projeto.

---

## O que é isso?

Um catálogo de ideias, padrões e referências escritas em Markdown puro.
Nenhuma instalação obrigatória. Nenhum lock-in. Nenhum fluxo imposto.

Você (ou a IA que te assiste) abre um arquivo, lê, e decide se aquela ideia
se aplica ao seu contexto. O projeto se adapta ao acervo — nunca o contrário.

---

## O que tem aqui?

### Skills — ideias por domínio

| Categoria | O que você vai encontrar |
|---|---|
| `skills/security/` | Hardening de API, OWASP Top 10, política de segurança, pentest |
| `skills/frontend/` | Governança CSS, auditoria HTML/CSS, Tailwind, SEO, i18n |
| `skills/ux-ui/` | Princípios de interface, hierarquia visual, acessibilidade |
| `skills/database/` | Queries seguras, migrations, schema design, seleção de ORM |
| `skills/backend/` | Operações financeiras, padrões de API, DDD, Event Sourcing, migração |
| `skills/devops/` | Deploy, observabilidade, containerização, monorepo, rollback |
| `skills/performance/` | Auditoria de performance, N+1, async |
| `skills/cache/` | Estratégias de cache, TTL, invalidação |
| `skills/testing/` | Unitários, integração, E2E, TDD |
| `skills/audit/` | Revisão de código, debugging sistemático, validação |
| `skills/automacao/` | Git hooks, CI/CD, scripts de setup |
| `skills/mcp/` | Ideias de MCP servers, quando e como criar |
| `skills/ai/` | Fact-checking, integração com LLMs |

### Agents — padrões de agentes especializados

| Agent | Para que serve |
|---|---|
| `agents/reviewers/security-reviewer.md` | Padrão de agent para revisão de segurança |
| `agents/reviewers/code-inspector.md` | Padrão de agent para inspeção de código (SPARC) |
| `agents/reviewers/architecture-reviewer.md` | Revisão de decisões arquiteturais (DDD, migração) |
| `agents/generators/boilerplate-generator.md` | Padrão de agent para geração de estrutura inicial |
| `agents/specialists/devops-engineer.md` | Especialista em deploy, infra e operações |
| `agents/specialists/database-architect.md` | Especialista em schema design e banco de dados |
| `agents/specialists/mobile-developer.md` | Especialista em desenvolvimento mobile |
| `agents/specialists/seo-specialist.md` | Especialista em SEO e Core Web Vitals |

### Workflows — templates de processo

| Workflow | Para que serve |
|---|---|
| `commands/workflows/brainstorm.md` | Explorar opções antes de implementar |
| `commands/workflows/create.md` | Criar app ou feature completa do zero |
| `commands/workflows/debug.md` | Investigação sistemática de bugs |
| `commands/workflows/deploy.md` | Processo de deploy seguro |

### Exemplos — como outros usam este acervo

| Exemplo | O que mostra |
|---|---|
| `exemplos/referencia-no-claude-code.md` | Como referenciar skills em um CLAUDE.md |
| `exemplos/prompts-prontos.md` | Prompts de exemplo para Claude Code, Cursor e similares |

---

## Como usar?

Não tem passo obrigatório. A forma mais direta:

1. Navegue pelas pastas acima
2. Abra o arquivo da categoria que te interessa
3. Leia e avalie se faz sentido para o que você está construindo
4. Use, adapte ou ignore

Se quiser referenciar uma skill em um projeto com IA assistente, veja
`exemplos/referencia-no-claude-code.md` para ideias de como fazer isso.

---

## Contribuindo

Ver [CONTRIBUTING.md](CONTRIBUTING.md)

## Licença

MIT
