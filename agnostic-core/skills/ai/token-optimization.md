Token Optimization

Objetivo: Reduzir o consumo de tokens em sessoes de AI assistants (Claude Code, Cursor, Copilot) otimizando os arquivos de contexto carregados automaticamente.

Inspirado no artigo "Como criei uma Skill que Economiza 84% dos Tokens no Claude Code" (andersonlimadev).

---

POR QUE ISSO IMPORTA

Toda sessao de um AI assistant carrega automaticamente arquivos de configuracao antes do primeiro prompt:
- CLAUDE.md, AGENTS.md, MEMORY.md, hooks, skills registradas
- Esses tokens sao cobrados em TODA interacao da sessao (input tokens)
- Um projeto com 800 linhas de contexto automatico pode consumir milhares de tokens extras por mensagem

Cada token de contexto automatico e multiplicado pelo numero de interacoes na sessao.
Em uma sessao de 50 mensagens, 800 linhas de contexto automatico = 40.000 linhas processadas.

---

DIAGNOSTICO — MEDIR ANTES DE OTIMIZAR

Antes de otimizar, meça o estado atual:

  1. Listar todos os arquivos carregados automaticamente:
     - CLAUDE.md (raiz e .claude/)
     - AGENTS.md
     - MEMORY.md
     - hooks configurados
     - skills registradas

  2. Contar linhas por arquivo:
     wc -l CLAUDE.md .claude/CLAUDE.md AGENTS.md MEMORY.md

  3. Identificar duplicacao entre arquivos:
     - Informacao repetida em CLAUDE.md e AGENTS.md
     - Convencoes duplicadas entre CLAUDE.md e MEMORY.md
     - Regras em hooks que ja estao documentadas nos arquivos de contexto

  4. Registrar o total de linhas antes da otimizacao

---

PRINCIPIO DO CONTEXTO MINIMO

Carregar automaticamente apenas o essencial. Manter o resto como referencia sob demanda.

  Carregar automaticamente (CLAUDE.md):
  - Identidade do projeto (nome, stack, arquitetura em 3-5 linhas)
  - Convencoes criticas (nomes, padroes obrigatorios)
  - Referencias para arquivos de consulta (caminhos para skills, agents, docs)

  Manter como referencia (nao carregado automaticamente):
  - Guias completos com exemplos de codigo
  - Checklists extensos
  - Documentacao detalhada de padroes
  - Tutoriais e explicacoes longas

Regra pratica: contexto automatico < 150 linhas.
Se o total de linhas carregadas automaticamente passa de 150, ha espaco para otimizar.

---

TECNICAS DE CONSOLIDACAO

1. Eliminar duplicacao entre arquivos:
   - Escolher UM arquivo como fonte de verdade para cada informacao
   - CLAUDE.md: resumo conciso + referencias
   - AGENTS.md/docs detalhados: conteudo extenso consultado sob demanda

2. Converter conteudo extenso em referencias:
   Antes (carregado automaticamente, 50 linhas):
     Convencoes de commits:
     - Use conventional commits
     - feat: nova funcionalidade
     - fix: correcao de bug
     - refactor: refatoracao
     - docs: documentacao
     - test: testes
     - [... mais 40 linhas de exemplos ...]

   Depois (carregado automaticamente, 2 linhas):
     Commits: conventional commits. Ver skills/git/commit-conventions.md

3. Mover exemplos de codigo para arquivos de referencia:
   - CLAUDE.md nao precisa de code snippets — a IA sabe gerar codigo
   - Exemplos extensos ficam nos arquivos de skills/agents para consulta quando necessario

4. Comprimir informacao sem perder significado:
   Antes (5 linhas):
     O projeto usa TypeScript com strict mode habilitado.
     Todas as funcoes devem ter tipos explicitos.
     Interfaces devem ser preferidas a types quando possivel.
     Enums devem usar string values.
     Generics devem ter nomes descritivos.

   Depois (1 linha):
     TypeScript strict. Tipos explicitos, interfaces > types, enums com strings, generics descritivos.

---

OTIMIZACAO DE HOOKS

Hooks executam em toda chamada de ferramenta e tambem consomem tokens:

- [ ] Cada hook tem um proposito claro e nao duplica o que ja esta no CLAUDE.md
- [ ] Hooks que apenas lembram regras ja documentadas podem ser removidos
- [ ] Preferir hooks que executam acoes (lint, format) a hooks que apenas imprimem avisos
- [ ] Consolidar hooks redundantes em um unico hook quando possivel

---

MEMORY.MD — MANTER ENXUTO

MEMORY.md cresce organicamente e acumula informacao obsoleta:

- [ ] Revisar periodicamente e remover entradas que ja estao cobertas pelo CLAUDE.md
- [ ] Remover entradas temporarias que nao sao mais relevantes
- [ ] Mover informacoes permanentes para CLAUDE.md (e comprimir)
- [ ] Manter apenas anotacoes especificas da sessao ou decisoes recentes

---

COMO MEDIR O RESULTADO

Apos otimizar, compare:

  Metrica          | Antes | Depois
  Linhas auto      | ___   | ___
  % reducao        | -     | ___%
  Arquivos auto    | ___   | ___

Meta: reducao de 50%+ nas linhas carregadas automaticamente.
Resultado tipico: 70-85% de reducao quando AGENTS.md extenso e convertido em referencia.

---

CHECKLIST

- [ ] Total de linhas carregadas automaticamente foi medido
- [ ] Duplicacao entre CLAUDE.md, AGENTS.md e MEMORY.md foi eliminada
- [ ] Conteudo extenso foi movido para arquivos de referencia (skills, docs)
- [ ] CLAUDE.md contem apenas resumo + referencias (< 150 linhas)
- [ ] MEMORY.md foi revisado e entradas obsoletas removidas
- [ ] Hooks foram auditados: nenhum duplica informacao ja documentada
- [ ] Resultado medido: reducao de linhas documentada

---

REFERENCIA

- context-management.md: gerenciamento de contexto durante a sessao
- ai-integration-patterns.md: custos e limites de tokens em chamadas de API
- model-routing.md: escolha do modelo certo para cada tarefa (economia complementar)
