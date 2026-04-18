# GitHub App do Claude Code

O comando `/install-github-app` conecta o Claude Code diretamente ao seu repositório GitHub.
Isso amplia o contexto disponível durante conversas — de arquivos locais para o projeto vivo
no GitHub (issues, PRs, branches, reviews, histórico).

---

## O que é

O `/install-github-app` é um comando nativo do Claude Code que instala o GitHub App da
Anthropic na sua conta pessoal ou organização do GitHub. Depois de instalado, o Claude Code
consegue acessar a API do GitHub sem configuração adicional de tokens ou MCP servers.

---

## O que ele desbloqueia

Com o GitHub App instalado, o Claude Code passa a ter acesso a:

- **Issues**: ler issues abertas, labels, comentários e histórico
- **Pull Requests**: ver PRs, diffs, reviews, comentários de linha
- **Branches**: listar branches, ver commits recentes, comparar diferenças
- **Histórico de commits**: entender a evolução do código ao longo do tempo
- **Discussões e reviews**: acompanhar decisões técnicas registradas no GitHub

Esse acesso é de leitura e escrita controlada — o Claude Code pode criar PRs,
comentar em issues e fazer push de branches quando solicitado.

---

## Como instalar

Na CLI do Claude Code, execute:

```
/install-github-app
```

O comando abre o navegador para autorizar a instalação do GitHub App.
Escolha a conta ou organização e selecione os repositórios que deseja conectar.

Após a autorização, o Claude Code já tem acesso — não precisa configurar tokens,
variáveis de ambiente ou MCP servers.

---

## Impacto no conhecimento

Sem o GitHub App, o Claude Code conhece apenas o que está no diretório local:
arquivos, histórico git e o que você colar no chat.

Com o GitHub App, o contexto se expande para o **projeto vivo**:

| Sem GitHub App | Com GitHub App |
|---|---|
| Lê arquivos locais | Lê arquivos locais **+ issues, PRs, reviews** |
| Vê git log local | Vê git log **+ contexto de PRs e discussões** |
| Não sabe o que está em andamento | Sabe quais PRs estão abertos e quais issues existem |
| Precisa que você copie contexto | Busca contexto diretamente no GitHub |

Para um acervo como o agnostic-core, isso significa que o Claude Code pode:
- Consultar issues abertas para entender prioridades
- Ler PRs anteriores para manter consistência de estilo
- Verificar discussões antes de propor mudanças

---

## GitHub App vs GitHub MCP Server

Ambos dão acesso ao GitHub, mas de formas diferentes:

| | GitHub App (nativo) | GitHub MCP Server |
|---|---|---|
| **Instalação** | `/install-github-app` | Configurar MCP server + token |
| **Autenticação** | OAuth via navegador | Personal Access Token |
| **Escopo** | Repositórios selecionados na instalação | Definido pelo token |
| **Customização** | Nenhuma — funciona out-of-the-box | Total — pode expor tools customizadas |
| **Quando usar** | Quer acesso rápido e simples ao GitHub | Precisa de operações específicas ou automações avançadas |

**Recomendação prática**: comece com o GitHub App. Se precisar de operações que ele
não cobre, adicione o MCP server como complemento.

---

## Boas práticas

- **Escopo mínimo**: instale apenas nos repositórios que você realmente usa com Claude Code
- **Revise permissões**: o GitHub App solicita permissões específicas — leia antes de autorizar
- **Organizações**: se for instalar em uma org, verifique se você tem permissão de admin
  ou se a org exige aprovação de um administrador

---

Ver também:
- `skills/mcp/ideias-de-mcp.md` — ideias de MCP servers, incluindo o GitHub MCP
