Context Audit

Objetivo: Diagnosticar e reduzir o volume de tokens consumidos automaticamente ao iniciar uma sessao de IA assistida, eliminando redundancia entre arquivos de configuracao.

Inspirado no artigo de andersonlimadev (TabNews, 2025). Complementa context-management.md (que foca em context rot durante a sessao — esta skill foca no setup inicial).

---

O PROBLEMA

Ferramentas como Claude Code, Cursor e Copilot carregam arquivos de contexto automaticamente ao iniciar cada sessao: CLAUDE.md, AGENTS.md, MEMORY.md, hooks, rules, etc.

Esses arquivos consomem tokens antes de qualquer prompt do usuario. Se nao forem auditados, acumulam redundancia e bloat silenciosamente.

Sintomas de contexto inicial inchado:
- Sessoes comecam lentas e consomem tokens caros sem necessidade
- Mesmo arquivos bem escritos se sobrepoe quando multiplos sao carregados juntos
- Hooks disparam leituras adicionais que multiplicam o consumo
- Documentacao de referencia e tratada como contexto operacional

---

DIAGNOSTICO — MEDIR ANTES

Antes de otimizar, medir o estado atual:

  1. Listar todos os arquivos carregados automaticamente por sessao
     - CLAUDE.md (raiz e .claude/)
     - AGENTS.md, MEMORY.md, CONVENTIONS.md
     - hooks.json e arquivos que os hooks referenciam
     - .cursorrules, .github/copilot-instructions.md
     - Skills registradas como auto-load

  2. Contar linhas totais
     wc -l de cada arquivo → soma = custo fixo por sessao

  3. Identificar sobreposicao
     Comparar conteudo entre arquivos. Perguntar para cada bloco:
     - Este conteudo aparece em mais de um arquivo?
     - Este conteudo e necessario em TODA sessao ou apenas em tarefas especificas?
     - Este conteudo e instrucao operacional ou documentacao de referencia?

---

CLASSIFICACAO DE CONTEUDO

Separar cada bloco de conteudo em uma de tres categorias:

  OPERACIONAL (deve carregar automaticamente):
  Instrucoes que a IA precisa seguir em toda sessao.
  Exemplos: convencoes de commit, stack do projeto, regras de seguranca, paths criticos.
  Caracteristica: curto, imperativo, sem explicacao detalhada.

  REFERENCIA (consultar sob demanda):
  Conteudo detalhado que so e relevante para tarefas especificas.
  Exemplos: guias completos de agents, checklists extensos, exemplos de codigo, patterns detalhados.
  Caracteristica: longo, explicativo, com exemplos.
  Acao: mover para arquivos separados, referenciar via path quando necessario.

  REDUNDANTE (eliminar):
  Conteudo que aparece em mais de um arquivo carregado automaticamente.
  Acao: manter em um unico lugar, remover dos demais.

---

ESTRATEGIA DE REDUCAO

  1. CLAUDE.md enxuto e autoritativo
     O CLAUDE.md principal deve conter apenas instrucoes operacionais.
     Formato ideal: linhas curtas, imperativas, sem exemplos longos.
     Meta: menos de 150 linhas para o arquivo principal.

  2. Referencia separada do contexto automatico
     Documentacao detalhada (guides, agents completos, patterns) deve existir
     em arquivos que NAO sao carregados automaticamente.
     A IA consulta esses arquivos quando a tarefa exige — nao em toda sessao.

  3. Hooks minimalistas
     Cada hook que dispara ao iniciar a sessao adiciona contexto.
     Auditar: o hook e necessario em toda sessao? Pode ser sob demanda?
     Remover hooks que apenas carregam mais contexto redundante.

  4. MEMORY.md consolidado
     Se o conteudo de MEMORY.md ja esta no CLAUDE.md, eliminar a duplicacao.
     MEMORY.md deve conter apenas decisoes e restricoes que nao cabem no CLAUDE.md.

---

EXEMPLO DE REDUCAO

  Antes (830 linhas de contexto automatico):
    CLAUDE.md raiz         → 116 linhas (convencoes + referencias a @AGENTS.md)
    AGENTS.md              → 713 linhas (guia completo com exemplos e checklists)
    MEMORY.md              → 70 linhas (decisoes, parcialmente duplicado com CLAUDE.md)
    hooks.json             → 5 hooks disparando leituras adicionais

  Diagnostico:
    AGENTS.md: 80% do conteudo e referencia, nao operacional
    MEMORY.md: 60% duplica conteudo do CLAUDE.md
    3 dos 5 hooks sao redundantes

  Depois (135 linhas de contexto automatico):
    CLAUDE.md unico        → 135 linhas (operacional puro)
    AGENTS.md              → mantido como referencia (nao carregado automaticamente)
    MEMORY.md              → eliminado (conteudo util absorvido pelo CLAUDE.md)
    hooks.json             → 2 hooks essenciais

  Resultado: ~84% de reducao em tokens por sessao.

---

CHECKLIST DE AUDITORIA

- [ ] Listar todos os arquivos carregados automaticamente ao iniciar sessao
- [ ] Contar linhas totais (custo fixo por sessao em tokens)
- [ ] Identificar blocos duplicados entre arquivos
- [ ] Classificar cada bloco: operacional, referencia ou redundante
- [ ] Mover conteudo de referencia para arquivos consultaveis sob demanda
- [ ] Eliminar duplicacoes entre arquivos
- [ ] Reduzir hooks ao minimo necessario
- [ ] Medir linhas totais apos otimizacao
- [ ] Validar que a IA ainda tem acesso ao conteudo de referencia quando requisitado
- [ ] Repetir auditoria periodicamente (a cada 2-4 semanas) conforme o projeto evolui
