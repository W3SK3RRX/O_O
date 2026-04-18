# Fluxo de Design com Paper MCP

Fluxo bidirecional para criar e implementar interfaces usando o Paper MCP com Claude Code.
Aplique quando quiser ir do design ao código sem sair do terminal.

---

## O que é o Paper MCP

O [Paper](https://paper.design) é uma ferramenta de design que expõe um servidor MCP local.
Isso permite que o Claude Code desenhe diretamente no canvas do Paper via ferramentas MCP —
e, na direção inversa, leia o design existente para gerar o frontend correspondente.

---

## Instalação

```bash
claude mcp add paper --transport http http://127.0.0.1:29979/mcp --scope user
```

Depois, baixe e instale o app Paper no computador. O servidor MCP roda localmente
na porta `29979` enquanto o Paper estiver aberto.

> **Atenção — configuração por máquina**
> O servidor MCP do Paper roda localmente (`127.0.0.1`) sem autenticação — não há API key.
> Isso significa que **cada máquina precisa da própria configuração**:
> ao trocar de computador, rode o `claude mcp add` novamente e certifique-se de que
> o app Paper está instalado e aberto.
> O `--scope user` salva em `~/.claude/` (perfil local), não no repositório —
> portanto a configuração não é versionada nem compartilhada automaticamente.

---

## Ferramentas MCP disponíveis

| Ferramenta | O que faz |
|-----------|-----------|
| `find_placement` | Encontra um espaço livre no canvas para posicionar o artboard |
| `create_artboard` | Cria um novo artboard com nome, dimensões e cor de fundo |
| `get_font_family_info` | Verifica se uma família tipográfica está disponível |
| `write_html` | Escreve HTML/CSS dentro de um artboard (constrói o design como código) |
| `get_screenshot` | Captura screenshot do artboard criado |

---

## Fluxo 1: Design (Claude Code → Paper)

Use quando quiser criar ou prototipar uma tela diretamente no Paper.

### Regra principal

O Claude Code **não deve escrever arquivos de código**. A saída é exclusivamente operações
via MCP tools no canvas do Paper.

### Estrutura do prompt

Um prompt eficaz para criar uma tela tem estas seções em ordem:

**SETUP**
- Usar `find_placement` para encontrar posição livre no canvas
- Usar `create_artboard` com: nome, largura, altura, cor de fundo
- Verificar fontes com `get_font_family_info` antes de usar

**TYPOGRAPHY SYSTEM**
- Definir qual fonte para títulos/display (ex: Lora, serif)
- Definir qual fonte para corpo/labels/botões (ex: Geist, sans-serif)
- Especificar alternativas caso a fonte não esteja disponível

**PAGE LAYOUT**
- Dividir em colunas, seções ou grids com dimensões exatas em px
- Cor de fundo, padding e alinhamento por área
- Usar `write_html` para construir o layout completo

**COMPONENTES**
- Cada componente com: dimensões, cores exatas (hex), border-radius, padding
- Textos com: font-family, font-size, font-weight, color, letter-spacing
- Campos de input: width, height, background, border, placeholder, focus state
- Botões: gradiente ou cor sólida, box-shadow, border-radius

**SPACING**
- Gap entre grupos de elementos (ex: 20px entre label + input)
- Margin entre seções distintas (ex: 28px entre último campo e CTA)

**FINAL STEP**
- Usar `get_screenshot` no artboard criado e mostrar o resultado

### Exemplo de prompt

```
You are going to design a [NOME DA TELA] directly inside Paper using the Paper MCP tools.

Do not write any code files. Your only output should be changes made to the Paper canvas
via the MCP tools.

## SETUP
Use find_placement to find a good spot, then create_artboard:
- Name: "[NOME DO ARTBOARD]"
- Width: [LARGURA]px
- Height: [ALTURA]px
- Background: [COR HEX]

Before building, use get_font_family_info to verify "[FONTE 1]" and "[FONTE 2]" are available.

## TYPOGRAPHY SYSTEM
- Titles, headlines → font-family: "[FONTE 1]"
- Body, labels, buttons → font-family: "[FONTE 2]"

## PAGE LAYOUT
Use write_html to build the full page. [DESCREVER COLUNAS/SEÇÕES COM DIMENSÕES]

## COMPONENTS
[LISTAR CADA COMPONENTE COM SPECS COMPLETAS]

## SPACING
- Gap between label + input groups: [X]px
- Gap between CTA and divider: [X]px

## FINAL STEP
Use get_screenshot on the artboard and show me the result.
```

### Boas práticas

- Quanto mais contexto (cores, fontes, espaçamentos), mais preciso o resultado de primeira
- Defina cores em hex exato — evite termos como "azul escuro"
- Especifique dimensões em px — evite termos como "largo" ou "médio"
- Se não souber tudo, deixe explícito o que o Claude deve deduzir; ajuste depois no Paper
- Use `get_screenshot` ao final para validar antes de aprovar

---

## Fluxo 2: Implementação (Paper → Claude Code)

Use quando tiver um design no Paper e quiser gerar o frontend correspondente.

### Como funciona

O Claude Code usa as ferramentas MCP para **ler** o design existente no Paper
(artboards, estilos, componentes) e então implementa o frontend como código real.

### Prompt de implementação

```
Leia o design no projeto Paper: [LINK DO PROJETO]

Com base no artboard "[NOME DO ARTBOARD]", implemente a tela como [React/Vue/HTML+CSS].

Consulte .agnostic-core/skills/frontend/html-css-audit.md e
.agnostic-core/skills/ux-ui/principios-de-interface.md durante a implementação.

Respeite exatamente: cores, tipografia, espaçamentos e hierarquia visual do design.
```

---

## O ciclo completo

```
[Você descreve a tela]
       ↓
Claude Code → Paper   (cria o design via MCP tools)
       ↓
[Você valida e ajusta no Paper]
       ↓
Paper → Claude Code   (implementa o frontend como código)
       ↓
[Frontend funcional]
```

Você orquestra. As ferramentas executam.

---

Ver também:
- `skills/frontend/html-css-audit.md`
- `skills/frontend/accessibility.md`
- `skills/ux-ui/principios-de-interface.md`
- `skills/ux-ui/ui-ux-quality-gates.md`
- `skills/mcp/ideias-de-mcp.md`
