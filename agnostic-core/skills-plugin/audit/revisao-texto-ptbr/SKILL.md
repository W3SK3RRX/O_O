---
name: revisao-texto-ptbr
description: 'Revisao de textos PT-BR: ortografia, concordancia, acentuacao, consistencia factual'
---

# Revisao de Texto PT-BR

Framework reutilizavel para revisao de textos em portugues brasileiro.
Aplicavel a qualquer projeto com texto user-facing em PT-BR.

---

Quando Usar

- Revisao de apresentacoes e slides
- Labels de UI, botoes, menus, tooltips, empty states
- Relatorios e dashboards com texto visivel
- Documentacao tecnica e nao-tecnica
- Mensagens de erro, avisos e confirmacoes
- Paginas HTML, componentes React/Vue/Svelte com texto em PT-BR
- Qualquer texto institucional ou voltado ao usuario final

---

Checklist de Revisao (8 niveis, por ordem de prioridade)

1. Concordancia nominal (genero + numero)
   - Adjetivos concordam com o substantivo em genero e numero
   - Numerais exigem plural: "5 modelos de relatorios" (nao "relatorio")
   - Artigos e pronomes concordam com o nucleo do sintagma

2. Concordancia verbal
   - Sujeito composto = verbo no plural
   - Voz passiva sintetica: "vendem-se casas" (nao "vende-se casas")
   - Sujeito posposto ainda exige concordancia

3. Acentuacao e crase
   - Proparoxitonas sempre acentuadas: tecnico, memoria, relatorio
   - Crase obrigatoria antes de substantivo feminino regido por "a": "a prestacao"
   - Monossílabos tonicos: "ve", "tem" (3a pessoa plural "tem")
   - Nunca crase antes de verbo: "a partir de" (nao "a partir de" com crase)

4. Ortografia
   - Acentos graficos corretos (agudo, circunflexo, til)
   - Distincao ss/c/s (ex: "excecao" nao "excessao")
   - Hifen pos-acordo ortografico (auto-escola → autoescola, co-piloto → copiloto)

5. Consistencia factual
   - Numeros citados devem bater com itens listados: se diz "5 estados", listar exatamente 5
   - Nomes de features/modulos devem ser identicos em todos os arquivos
   - Dados numericos (percentuais, totais) devem ser verificaveis

6. Coesao e coerencia
   - Conectivos adequados entre paragrafos e secoes
   - Paralelismo em listas: todos os itens com mesma estrutura gramatical
   - Referentes claros: evitar pronomes ambiguos

7. Repeticao de palavras
   - Identificar palavras repetidas em sequencia ou no mesmo paragrafo
   - Sugerir sinonimos quando a repeticao for excessiva
   - Manter repeticao intencional quando necessaria para clareza tecnica

8. Adequacao de registro
   - Formal para textos institucionais e relatorios
   - Conciso para labels de UI e botoes
   - Claro e direto para mensagens de erro
   - Consistente dentro do mesmo contexto

---

Armadilhas Frequentes em PT-BR

| Errado | Correto | Regra |
|--------|---------|-------|
| N modelos de relatorio | N modelos de relatorios | Plural apos numeral |
| Despesas Detalhado | Despesas Detalhadas | Concordancia feminino plural |
| PDF profissional (N modelos) | PDF profissionais | Plural do adjetivo |
| Do X a prestacao | Do X a prestacao (com crase) | Crase obrigatoria |
| depende de memoria | depende de memoria (com acento) | Proparoxitona |
| quem ve | quem ve (com circunflexo) | Monossílabo tonico |
| Cada tecnico | Cada tecnico (com acento) | Proparoxitona |
| "5 itens" + lista com 4 | Listar exatamente 5 | Consistencia factual |
| a nivel de | em nivel de | Regencia |
| onde (para nao-lugar) | em que / no qual | "Onde" so para lugar fisico |
| atraves de (para meio) | por meio de | "Atraves" = atravessar |
| a partir de (com crase) | a partir de (sem crase) | Nunca crase antes de verbo |

---

Fluxo de Auditoria em 6 passos

1. Identificar arquivos com texto user-facing
   - HTML, JSX, TSX, Vue, Svelte
   - Arquivos de constantes, configs, i18n
   - Qualquer arquivo que contenha strings visiveis ao usuario

2. Extrair apenas texto visivel
   - Ignorar markup, atributos HTML, props, nomes de variaveis
   - Focar em conteudo textual renderizado

3. Aplicar checklist registrando cada ocorrencia
   - Arquivo, linha, texto errado, correcao proposta, regra violada

4. Verificar consistencia cross-file
   - Nomes de features e modulos devem ser identicos entre arquivos
   - Terminologia consistente em todo o projeto

5. Apresentar relatorio em formato tabular
   - Usar o formato de saida descrito abaixo

6. Aplicar correcoes com commits atomicos
   - Prefixo `fix:` no commit
   - Um commit por categoria de erro ou por arquivo

---

Formato de Saida da Auditoria

```
Auditoria de Texto — [arquivo]

| # | Linha | Erro | Correcao | Regra |
|---|-------|------|----------|-------|
| 1 | ...   | ...  | ...      | ...   |
| 2 | ...   | ...  | ...      | ...   |

Total: X erros encontrados
```

---

Dicas gerais

- Evitar gerundismo: "estamos fazendo" → "fazemos"
- Titulos: caixa de frase (so primeira palavra maiuscula, exceto nomes proprios)
- Verificar fonte canonica de nomes (constantes no codigo) antes de corrigir em textos derivados
- Ao corrigir nome de feature, comecar pela source of truth (constante/config) e propagar para todos os consumidores
- Em caso de duvida sobre grafia, consultar VOLP (Vocabulario Ortografico da Lingua Portuguesa)

