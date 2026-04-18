# Exemplo: como referenciar o acervo em um projeto com IA assistente

Este é um exemplo — não um template obrigatório.

Se você usa Claude Code (ou qualquer IA assistente com arquivo de contexto), pode referenciar
o agnostic-core no arquivo `CLAUDE.md` do seu projeto para que a IA saiba que essas ideias
existem e possa consultá-las quando fizer sentido.

---

## Exemplo de CLAUDE.md com referências ao acervo

```markdown
# Meu Projeto

## Acervo de referência

Este projeto tem acesso ao agnostic-core em `.agnostic-core/`.

Ideias que podem ser consultadas quando relevante:

- Segurança de API:   .agnostic-core/skills/security/api-hardening.md
- Governança CSS:     .agnostic-core/skills/frontend/css-governance.md
- Queries de banco:   .agnostic-core/skills/database/query-compliance.md
- Revisão de código:  .agnostic-core/skills/audit/code-review.md
- Performance:        .agnostic-core/skills/performance/performance-audit.md

Padrões de agents disponíveis no acervo:
- .agnostic-core/agents/reviewers/security-reviewer.md
- .agnostic-core/agents/reviewers/code-inspector.md
```

---

## Como apontar para o acervo

Qualquer método funciona — o importante é que a IA saiba onde estão os arquivos:

**Como submodule Git:**
```bash
git submodule add https://github.com/paulinett1508-dev/agnostic-core.git .agnostic-core
```

**Como clone direto:**
```bash
git clone https://github.com/paulinett1508-dev/agnostic-core.git .agnostic-core
```

**Ou simplesmente copiar os arquivos relevantes** para dentro do projeto — sem nenhuma
dependência de submodule. Use o que fizer mais sentido para o seu contexto.

---

Ver também: `exemplos/prompts-prontos.md` para exemplos de como referenciar uma skill num prompt.
