# Ideias de MCP Servers

MCP (Model Context Protocol) permite que IAs assistentes se conectem a ferramentas e fontes
de dados externas. Esta página reúne ideias de MCPs que podem beneficiar projetos de software.
Avalie o que faz sentido para o seu contexto.

---

## O que é um MCP Server?

Um servidor que expõe ferramentas, recursos ou prompts para que um modelo de linguagem
possa interagir com sistemas externos de forma estruturada e controlada.

Casos básicos:
- Dar à IA acesso de leitura ao seu banco (sem precisar copiar dados manualmente)
- Permitir que a IA consulte uma API externa durante uma conversa
- Expor operações de escrita controladas (criar ticket, enviar mensagem)

---

## Quando faz sentido criar um MCP

Considere criar um MCP quando:
- Você se pega copiando e colando os mesmos dados para a IA repetidamente
- A IA precisaria de contexto dinâmico que muda (dados de banco, status de API)
- Você quer automatizar uma ação repetitiva com supervisão da IA
- A integração com um serviço externo seria valiosa para vários fluxos de trabalho

## Quando NÃO vale a pena

- A necessidade é pontual e um copy-paste resolve
- O dado é estático e cabe bem num arquivo Markdown de contexto
- A complexidade de manter o MCP supera o benefício

---

## Categorias de MCPs úteis

### Leitura de dados
Permitem que a IA consulte dados sem que você precise copiar manualmente.

- **Banco de dados:** consultar schema, executar queries de leitura, explorar dados
- **Logs e métricas:** buscar erros recentes, métricas de performance, traces
- **Documentação interna:** base de conhecimento, ADRs, runbooks
- **Código:** buscar arquivos, funções, símbolos no codebase

### Integração com serviços
- **GitHub/GitLab:** listar PRs, issues, criar branches, comentar em reviews
- **Jira/Linear:** consultar e criar issues, mover cards
- **Slack:** enviar mensagens, buscar histórico de canal
- **Notion/Confluence:** ler e criar páginas de documentação
- **APIs do projeto:** endpoints internos que a IA pode consultar durante desenvolvimento
- **Design tools:** criar e ler designs diretamente no canvas
  - **Paper:** criação bidirecional — Claude Code desenha no Paper via MCP (write_html,
    create_artboard) e lê designs existentes para implementar o frontend
  - Ver: `skills/design/paper-mcp-workflow.md`

### Automação
- **Deploy:** acionar pipelines, verificar status de builds
- **Testes:** rodar suites de teste, reportar resultados
- **Ambiente:** setup de ambiente de desenvolvimento, seed de banco

---

## Padrões de segurança para MCPs

Independente do que o MCP faz, alguns cuidados valem:

- **Escopo mínimo:** exponha apenas o necessário. Um MCP de leitura de banco não precisa
  de permissão de escrita.
- **Sem credenciais hardcoded:** use variáveis de ambiente, nunca strings literais no código
- **Operações destrutivas com confirmação:** delete, drop, purge devem exigir confirmação
  explícita antes de executar
- **Rate limiting:** proteja operações que chamam APIs externas
- **Audit log:** registre o que foi chamado e quando, especialmente em MCPs de escrita

---

## MCPs públicos notáveis (referência)

Alguns MCPs mantidos pela comunidade que podem servir de referência ou uso direto:

- `@modelcontextprotocol/server-filesystem` — acesso ao sistema de arquivos local
- `@modelcontextprotocol/server-github` — integração com GitHub
  (alternativa nativa: `/install-github-app` do Claude Code — ver `skills/mcp/github-app-install.md`)
- `@modelcontextprotocol/server-postgres` — queries em PostgreSQL
- `@modelcontextprotocol/server-brave-search` — busca web via Brave
- `@modelcontextprotocol/server-memory` — memória persistente entre sessões

Busque em: https://github.com/modelcontextprotocol/servers

---

## Estrutura mínima de um MCP (referência)

Um MCP server em Node.js ou Python tipicamente tem:

```
mcp-server/
├── index.ts (ou main.py)  ← entrada do servidor
├── tools/                  ← definições das ferramentas expostas
├── resources/              ← fontes de dados acessíveis
└── README.md               ← como instalar e configurar
```

Cada ferramenta exposta define: nome, descrição, parâmetros (schema JSON) e a função
que executa quando chamada.

---

Ver também: `skills/automacao/automacoes-uteis.md`, `skills/security/api-hardening.md`, `skills/mcp/github-app-install.md`
