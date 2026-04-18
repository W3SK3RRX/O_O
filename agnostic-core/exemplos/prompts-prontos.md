# Prompts de exemplo

Exemplos de como usar as ideias do acervo em ferramentas de IA como Claude Code, Cursor,
GitHub Copilot ou qualquer assistente com suporte a contexto.

Adapte conforme o caminho real das skills no seu ambiente.

---

## Segurança

```
Revise os arquivos em src/routes/ e src/controllers/ consultando as ideias em
.agnostic-core/skills/security/api-hardening.md.
Liste o que for relevante para este projeto.
```

```
Usando .agnostic-core/skills/security/owasp-checklist.md como referência,
avalie os pontos que se aplicam a esta API.
```

---

## Frontend

```
Analise os arquivos CSS em src/styles/ considerando as ideias de governança em
.agnostic-core/skills/frontend/css-governance.md.
```

```
Revise os componentes em src/components/ com base nas ideias de
.agnostic-core/skills/ux-ui/principios-de-interface.md.
```

---

## Banco de dados

```
Revise as queries em src/repositories/ consultando
.agnostic-core/skills/database/query-compliance.md.
```

---

## Performance

```
Analise src/services/ em busca de oportunidades de melhoria.
Use .agnostic-core/skills/performance/performance-audit.md como referência.
```

```
Avalie as estratégias de cache do projeto considerando as ideias em
.agnostic-core/skills/cache/estrategias-de-cache.md.
```

---

## Revisão de código

```
Revise o PR consultando .agnostic-core/skills/audit/code-review.md.
Identifique o que for relevante para este contexto.
```

---

## Agents

```
Atue como o padrão de agent descrito em
.agnostic-core/agents/reviewers/security-reviewer.md
e analise os arquivos em src/.
```

```
Use o padrão em .agnostic-core/agents/reviewers/code-inspector.md
para inspecionar src/services/pagamento.js.
```

---

## Design com Paper MCP

```
Atue como o padrão de agent descrito em .agnostic-core/agents/generators/ui-designer.md
Consulte .agnostic-core/skills/design/paper-mcp-workflow.md para referência das ferramentas.

Crie uma tela de [DESCRIÇÃO DA TELA] no projeto Paper: [LINK DO PROJETO]
```

```
Com base no design no projeto Paper: [LINK DO PROJETO]
implemente o artboard "[NOME DO ARTBOARD]" como [React/Vue/HTML+CSS].

Consulte .agnostic-core/skills/frontend/html-css-audit.md e
.agnostic-core/skills/ux-ui/principios-de-interface.md durante a implementação.
Respeite cores, tipografia, espaçamentos e hierarquia visual do design.
```

---

## Automação e MCP

```
Consulte .agnostic-core/skills/automacao/automacoes-uteis.md
e sugira automações que façam sentido para o setup atual do projeto.
```

```
Leia .agnostic-core/skills/mcp/ideias-de-mcp.md e avalie
quais MCPs poderiam beneficiar o fluxo de desenvolvimento deste projeto.
```
