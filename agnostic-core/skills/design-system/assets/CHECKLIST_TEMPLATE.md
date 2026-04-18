# 🎨 Design Checklist — {NOME_DO_PROJETO}

> Preencher este checklist **antes** de qualquer código visual.
> Nenhum item pode ficar em aberto.

---

## 📌 CONTEXTO

| Campo | Resposta |
|-------|----------|
| **Projeto** | {nome} |
| **Tipo** | `[ ]` Landing Page `[ ]` App Web `[ ]` Mobile `[ ]` Dashboard `[ ]` Componente |
| **Mercado/Nicho** | {nicho} |
| **Público-alvo** | {publico} |
| **Tom da marca** | `[ ]` Sério/Corporativo `[ ]` Moderno/Tech `[ ]` Amigável `[ ]` Premium `[ ]` Outro: ___ |

---

## 🖼️ REFERÊNCIA VISUAL

```
Status: [ ] Pendente  [ ] Definida  [ ] Aprovada
```

| Campo | Resposta |
|-------|----------|
| **Fonte da referência** | `[ ]` Dribbble `[ ]` URL própria `[ ]` Screenshot `[ ]` Nome de produto |
| **Link/Arquivo** | {link_ou_arquivo} |
| **O que você gosta nela** | {o_que_gosta} |
| **O que NÃO quer replicar** | {o_que_nao_quer} |

> 💡 Sem referência? Sugestão: buscar no Dribbble por **"{nicho} landing page"** ou **"{nicho} design system"**

---

## 🎨 PALETA DE CORES

```
Status: [ ] Pendente  [ ] Definida  [ ] Aprovada
```

| Role | Hex | Uso |
|------|-----|-----|
| **Primary** | `#______` | CTAs, links, elementos principais |
| **Primary Dark** | `#______` | Hover states |
| **Secondary** | `#______` | Elementos de suporte |
| **Background** | `#______` | Fundo principal |
| **Surface** | `#______` | Cards, modais |
| **Text Primary** | `#______` | Títulos, corpo principal |
| **Text Secondary** | `#______` | Labels, captions |
| **Border** | `#______` | Divisores, bordas |
| **Success** | `#______` | Feedbacks positivos |
| **Error** | `#______` | Erros, alertas críticos |
| **Warning** | `#______` | Avisos |

> ⚠️ **Anti-padrão bloqueado:** Gradiente roxo genérico. Justificativa obrigatória se usado.

---

## 🔤 TIPOGRAFIA

```
Status: [ ] Pendente  [ ] Definida  [ ] Aprovada
```

| Campo | Resposta |
|-------|----------|
| **Fonte principal** | {fonte} — [verificar no Google Fonts] |
| **Fonte secundária** | {fonte_secundaria} (opcional, para headings ou mono) |
| **Fonte de código** | {fonte_mono} (se aplicável) |

### Escala Tipográfica

| Token | Tamanho | Peso | Line-height | Uso |
|-------|---------|------|-------------|-----|
| `display` | {px} | {weight} | {lh} | Hero headlines |
| `h1` | {px} | {weight} | {lh} | Títulos de página |
| `h2` | {px} | {weight} | {lh} | Seções |
| `h3` | {px} | {weight} | {lh} | Subseções |
| `body-lg` | {px} | {weight} | {lh} | Corpo grande |
| `body` | {px} | {weight} | {lh} | Corpo padrão |
| `body-sm` | {px} | {weight} | {lh} | Corpo pequeno |
| `caption` | {px} | {weight} | {lh} | Labels, captions |

> ⚠️ **Anti-padrão bloqueado:** Inter como única opção sem avaliação. Sempre considerar alternativas.

---

## 📐 ESPAÇAMENTO & GRID

```
Status: [ ] Pendente  [ ] Definido  [ ] Aprovado
```

| Campo | Valor |
|-------|-------|
| **Base unit** | `4px` (padrão recomendado) |
| **Container max-width** | {px} |
| **Colunas** | {n} colunas |
| **Gutter** | {px} |
| **Padding horizontal (mobile)** | {px} |
| **Border radius padrão** | {px} — `[ ]` Sharp `[ ]` Rounded `[ ]` Pill |

### Escala de Espaçamento

```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
3xl: 64px
4xl: 96px
```

---

## 🖼️ IMAGENS & ILUSTRAÇÕES

```
Status: [ ] Pendente  [ ] Definido  [ ] Aprovado
```

| Campo | Resposta |
|-------|----------|
| **Estilo visual** | `[ ]` Foto real `[ ]` Ilustração flat `[ ]` Ilustração 3D `[ ]` Abstrato/Gradiente `[ ]` Sem imagens |
| **Tom das imagens** | `[ ]` Claro `[ ]` Escuro `[ ]` Colorido `[ ]` Monocromático |
| **Fonte de imagens** | `[ ]` Gerar com AI `[ ]` Unsplash `[ ]` Pexels `[ ]` Assets próprios |
| **Mockups/devices** | `[ ]` Sim `[ ]` Não |

> ⚠️ **Anti-padrão bloqueado:** Só ícones sem nenhuma imagem real. Apps com imagens têm percepção de qualidade muito maior.

---

## ✍️ COPY DO PROJETO

```
Status: [ ] Pendente  [ ] Disponível  [ ] Aprovado
```

| Seção | Status | Conteúdo |
|-------|--------|----------|
| **Headline principal** | `[ ]` | {texto} |
| **Subheadline** | `[ ]` | {texto} |
| **CTA principal** | `[ ]` | {texto} |
| **CTA secundário** | `[ ]` | {texto} |
| **Seções adicionais** | `[ ]` | {lista} |

> 💡 Sem copy? Gerar placeholder contextual baseado no nicho antes de codar.

---

## 🚫 ANTI-PADRÕES DO PROJETO

> Listar o que está **proibido** neste projeto específico:

```
✗ {anti_padrao_1}
✗ {anti_padrao_2}
✗ {anti_padrao_3}
```

Padrões universais sempre bloqueados:
```
✗ Gradiente roxo genérico
✗ Fundo branco puro sem nuance (#FFFFFF em grandes áreas)
✗ Cards sem identidade (só borda cinza)
✗ Ausência total de imagens
✗ Tipografia sem hierarquia clara
```

---

## ✅ APROVAÇÃO FINAL

```
[ ] Contexto completo
[ ] Referência aprovada
[ ] Paleta completa (todos os roles preenchidos)
[ ] Tipografia definida
[ ] Espaçamento definido
[ ] Estilo de imagens decidido
[ ] Copy disponível (ou placeholder acordado)
[ ] Anti-padrões listados
```

**→ Quando todos os itens estiverem marcados: gerar o `design.json` e iniciar execução.**

---

*Checklist gerado pela skill `design-system` do agnostic-core*
*Baseado na técnica de Deborah Folloni — Referência → design.json → Execução*
