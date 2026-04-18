---
name: nano-banana-claude-workflow
description: 'Fluxo Claude Code + Nano Banana + Canva: geracao e edicao de imagens via MCP com separacao de camadas no Canva'
---

## As três ferramentas

| Ferramenta | Papel no fluxo |
|---|---|
| **Claude Code** | Entende o contexto do projeto, da marca e dos arquivos. Escreve o prompt de edição automaticamente. |
| **Nano Banana (MCP)** | Executa a geração/edição da imagem via terminal (`mcp__nano-banana__edit_image`). |
| **Canva — Magic Layers** | Recebe a imagem gerada e permite separar e editar cada elemento individualmente com precisão. |

---

## Instalação do MCP Nano Banana

```bash
claude mcp add nano-banana
```

> Consulte a documentação oficial do Nano Banana para a URL e configuração do servidor MCP.
> O MCP expõe a ferramenta `mcp__nano-banana__edit_image` para uso direto no Claude Code.

---

## Fluxo completo

```
[Você descreve o que precisa visualmente]
          ↓
Claude Code lê o contexto do projeto (CLAUDE.md, brand files, assets)
          ↓
Claude Code escreve o prompt ideal para o Nano Banana
          ↓
Nano Banana gera/edita a imagem via MCP (mcp__nano-banana__edit_image)
          ↓
[Você recebe a imagem gerada no terminal]
          ↓
Imagem é levada para o Canva → Magic Layers
          ↓
[Separação e edição cirúrgica de cada elemento]
          ↓
[Asset final pronto]
```

---

## Prompt base para o Claude Code

Copie, cole e adapte no Claude Code com o MCP do Nano Banana configurado:

```
Você é meu assistente de design e edição de imagens.
O MCP do Nano Banana está configurado via `mcp__nano-banana__edit_image`.

Com base no contexto do projeto atual — incluindo @CLAUDE.md, arquivos de brand
e assets existentes que você já conhece:

1. Analise o que precisamos criar ou editar visualmente para esta tarefa.
2. Escreva o prompt ideal para o Nano Banana, garantindo alinhamento
   com a identidade visual do projeto.
3. Execute a edição/geração da imagem usando o Nano Banana.
4. Salve a imagem gerada e informe o caminho.

O próximo passo será levar essa imagem para o Canva e usar o
"Magic Layers" para separação e edição final dos elementos.
```

---

## Boas práticas

- Quanto mais contexto de marca estiver no `CLAUDE.md` (cores, fontes, tom), mais preciso o resultado
- Use `@` para injetar arquivos de referência visual diretamente no prompt
- Valide a imagem gerada antes de levar para o Canva — ajustes no terminal são mais rápidos
- No Canva, o **Magic Layers** funciona melhor com imagens que têm elementos bem definidos (fundo, texto, ícone)
- Combine com `paper-mcp-workflow.md` quando o objetivo final for um componente de UI

---

## Ver também

- `skills/design/paper-mcp-workflow.md` — design de interfaces via MCP no Paper
- `skills/mcp/ideias-de-mcp.md` — outros MCPs úteis no fluxo de desenvolvimento
- `skills/workflow/claude-code-productivity.md` — produtividade geral no Claude Code
- `exemplos/prompts-prontos.md` — prompts prontos para uso imediato

