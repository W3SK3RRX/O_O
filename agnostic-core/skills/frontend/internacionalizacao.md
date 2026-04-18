Internacionalizacao (i18n)

Objetivo: Preparar aplicacoes para suportar multiplos idiomas e formatos regionais de forma sustentavel.

---

SEPARACAO DE TEXTO

- [ ] Todo texto visivel ao usuario externalizado em arquivos de traducao (JSON, YAML, PO)
- [ ] Chave de traducao descreve o contexto, nao o conteudo:
  Bom:  "checkout.submit_button" → "Finalizar compra"
  Ruim: "finalizar_compra" → "Finalizar compra"
- [ ] Nunca concatenar strings traduzidas para formar frases

  Bom:  t("welcome_message", { name: "Maria" })  →  "Bem-vinda, Maria!"
  Ruim: t("welcome") + ", " + name + "!"  →  quebra em idiomas com ordem diferente

- [ ] Pluralizacao usando regras do idioma (nao apenas singular/plural — arabe tem 6 formas)
- [ ] Contexto de genero quando relevante (ex: "Voce esta conectado/conectada")
- [ ] Arquivos de traducao organizados por feature ou pagina, nao um arquivo gigante

---

FORMATACAO

Datas:
- [ ] Usar formatacao nativa do locale (Intl.DateTimeFormat, strftime com locale)
- [ ] Nunca assumir formato MM/DD/YYYY — varia por regiao
- [ ] Armazenar datas em UTC no banco; formatar no frontend conforme locale do usuario

Numeros e moedas:
- [ ] Separador decimal varia (1,234.56 vs 1.234,56) — usar Intl.NumberFormat
- [ ] Moeda formatada com simbolo e posicao do locale (R$ 10,00 vs $10.00 vs 10,00 €)
- [ ] Nunca hardcodar simbolo de moeda

Enderecos e telefones:
- [ ] Formato de endereco varia drasticamente entre paises
- [ ] Formato de telefone com codigo de pais (+55, +1)
- [ ] CEP/ZIP com validacao por pais

---

LAYOUT E UI

- [ ] Texto traduzido pode ser 30-50% mais longo (alemao, finlandes) — testar overflow
- [ ] Suporte a RTL (Right-to-Left) para arabe, hebraico:
  - CSS logical properties (margin-inline-start em vez de margin-left)
  - Atributo dir="rtl" no HTML
  - Icones direcionais (setas) invertidos
- [ ] Fontes suportam caracteres do idioma (CJK, ciriiico, arabe)
- [ ] Botoes, menus e tabelas acomodam textos de tamanhos variados
- [ ] Imagens com texto embutido precisam de versoes por idioma

---

BACKEND

- [ ] Detectar idioma do usuario: Accept-Language header → preferencia salva → default
- [ ] Content negotiation: retornar traducoes no idioma solicitado
- [ ] Schema de banco para conteudo multilingue:
  Opcao A (colunas): title_pt, title_en — simples, poucos idiomas
  Opcao B (tabela de traducao): product_translations(product_id, locale, title) — escalavel
  Opcao C (JSON): translations jsonb {"pt": "...", "en": "..."} — flexivel, menos relacional
- [ ] URLs internacionalizadas: /pt/produtos vs /en/products (ou Accept-Language sem URL)
- [ ] Mensagens de erro da API traduzidas (ou codigo de erro + traducao no cliente)

---

PROCESSO DE TRADUCAO

- [ ] Traducao por profissionais ou nativos — nunca apenas traducao automatica
- [ ] Traducao automatica como rascunho, revisada por humano
- [ ] Chaves sem traducao: exibir fallback (idioma default) + logar aviso
- [ ] Pseudo-localizacao em dev: substituir texto por caracteres acentuados para detectar strings nao externalizadas
  Ex: "Submit" → "[Šüƀɱîƭ !!!]" — se texto normal aparecer, faltou externalizar
- [ ] CI verifica chaves faltantes entre idiomas

---

ANTI-PATTERNS

  ✗ Hardcodar strings no codigo ("Salvar", "Cancel")
  ✗ Concatenar fragmentos traduzidos ("Voce tem " + n + " mensagens")
  ✗ Assumir que plural e sempre singular + "s"
  ✗ Formatar datas com formato fixo (DD/MM/YYYY) ignorando locale
  ✗ Ignorar RTL ("ninguem usa arabe" — 400 milhoes de falantes)
  ✗ Traduzir e nunca revisar (contexto muda significado)
  ✗ Um unico arquivo de traducao com 5000 chaves

---

CHECKLIST DE I18N

- [ ] Todas as strings visiveis ao usuario externalizadas
- [ ] Pluralizacao usando regras do idioma alvo
- [ ] Datas, numeros e moedas formatados com locale
- [ ] Layout testado com textos 50% mais longos
- [ ] RTL suportado (se aplicavel)
- [ ] Fallback definido para traducoes ausentes
- [ ] Pseudo-localizacao habilitada em dev
- [ ] CI verificando chaves faltantes
- [ ] Traducoes revisadas por falantes nativos

---

SKILLS A CONSULTAR

  skills/frontend/accessibility.md          Acessibilidade (complementar — lang attribute, ARIA)
  skills/frontend/ux-guidelines.md          Guidelines de UX (layouts adaptativos)
  skills/backend/rest-api-design.md         Content negotiation e headers
