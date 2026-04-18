Context Management

Objetivo: Manter a qualidade do trabalho da IA ao longo de sessoes longas, prevenindo context rot e usando contextos frescos por tarefa.

Adaptado da metodologia get-shit-done (MIT). Fonte: https://github.com/gsd-build/get-shit-done

---

O QUE E CONTEXT ROT

Context rot e a degradacao progressiva da qualidade de respostas conforme o contexto da sessao cresce. Ocorre porque o modelo precisa processar e ponderar todo o historico ao gerar cada nova resposta.

Sintomas de context rot:
- Respostas repetem informacoes ja ditas anteriormente
- Erros introduzidos sao propagados sem correccao
- Qualidade de codigo decai: mais codigo comentado, variaveis mal nomeadas, logica redundante
- Instrucoes do inicio da sessao passam a ser ignoradas
- Tempo de resposta aumenta sem aumento de complexidade

---

NIVEIS DE QUALIDADE POR USO DE CONTEXTO

  0-30% usado: PICO
  Melhor momento para decisoes arquiteturais, planejamento, e trabalho criativo.
  IA tem acesso pleno a todo o conhecimento treinado sem interferencia do historico.

  30-50% usado: BOM
  Trabalho de execucao padrao. Boa qualidade, pequenas degradacoes possiveis.
  Revisoes de codigo, implementacao de tasks bem definidas.

  50-70% usado: DEGRADANDO
  Qualidade visivelmente menor. Repeticiones, falta de consistencia.
  Tarefas simples ainda funcionam; evite decisoes complexas.

  70%+ usado: RUIM
  Contexto rot ativo. Probabilidade alta de erros silenciosos.
  Pause e inicie contexto fresco.

---

ESTRATEGIA DE CONTEXTOS FRESCOS POR TAREFA

Principio: cada plano ou conjunto de tasks relacionadas merece seu proprio contexto.

  Uma sessao = um plano (PLAN.md)

  Fluxo recomendado:
  1. Sessao de planejamento: crie PLAN.md com goal-backward (ver goal-backward-planning.md)
  2. Encerre a sessao de planejamento
  3. Inicie nova sessao para executar o plano
  4. Ao completar o plano, encerre e inicie nova sessao para verificacao

Nunca carregue o historico completo de uma sessao de planejamento para uma de execucao.
O PLAN.md e o handover — ele contem tudo que a sessao de execucao precisa.

---

QUANDO PAUSAR E CRIAR CONTEXTO FRESCO

Pause quando qualquer uma das condicoes abaixo for verdadeira:

- [ ] Contexto acima de 50% e ainda ha trabalho complexo pela frente
- [ ] Resposta anterior contem erros que o modelo nao corrigiu espontaneamente
- [ ] Instrucoes explicitas do CLAUDE.md ou PLAN.md passaram a ser ignoradas
- [ ] Codigo gerado repete logica ja existente sem reconhecer a duplicacao
- [ ] Modelo comeca a "alucinar" nomes de funcoes, arquivos ou APIs do projeto

---

HANDOVER DE CONTEXTO

Ao pausar uma sessao com trabalho em andamento, gere um Handover Block antes de encerrar.
Cole o Handover Block no inicio da proxima sessao.

Formato do Handover Block:

  HANDOVER — [data e hora]

  Objetivo da sessao: [goal da fase ou task em execucao]

  Estado atual:
  - Arquivo de plano: [caminho para PLAN.md]
  - Tasks concluidas: [lista de tasks com status]
  - Task em andamento: [nome e descricao da task pausada]
  - Proximo passo imediato: [o que fazer ao retomar]

  Contexto critico:
  - [decisao importante tomada que afeta o codigo]
  - [restricao descoberta durante a sessao]
  - [arquivo ou funcao critica descoberta]

  Arquivos modificados:
  - [arquivo]: [o que foi mudado]

  Nao refaca:
  - [lista de coisas que ja foram feitas e nao precisam repetir]

---

OTIMIZACAO DO CONTEXTO AUTOMATICO

Antes de gerenciar o contexto durante a sessao, otimize o que e carregado automaticamente.
Arquivos como CLAUDE.md, AGENTS.md e MEMORY.md sao carregados em toda interacao — cada linha extra e multiplicada pelo numero de mensagens na sessao.

Ver: skills/ai/token-optimization.md (guia completo de otimizacao)

Resumo:
- Contexto automatico deve ter < 150 linhas no total
- Conteudo extenso (guias, exemplos, checklists) fica em arquivos de referencia
- Eliminar duplicacao entre CLAUDE.md, AGENTS.md e MEMORY.md
- Revisar MEMORY.md periodicamente — entradas obsoletas acumulam tokens

---

CARREGAMENTO CIRURGICO DE CONTEXTO

Ao iniciar uma sessao de execucao, carregue apenas o que e necessario:

  Sempre carregar:
  - CLAUDE.md do projeto (convencoes e skills referenciadas)
  - PLAN.md da fase atual
  - Handover Block da sessao anterior (se houver)

  Carregar apenas quando necessario:
  - Arquivo especifico a ser modificado (leia inline, nao todo o diretorio)
  - Schema de banco (apenas se a task envolve banco)
  - Arquivo de testes existente (apenas se a task inclui testes)

  Nunca carregar no inicio:
  - Todo o codebase "para ter contexto"
  - Historico de conversas anteriores copy-paste
  - Documentacao de bibliotecas completa (leia o trecho relevante quando precisar)

---

SINAIS DE SAUDE DO CONTEXTO

Verifique periodicamente durante a sessao:

  Sinal positivo (contexto saudavel):
  - Respostas referenciam corretamente arquivos e funcoes do projeto
  - Codigo gerado segue convencoes do projeto sem lembrar explicitamente
  - Erros identificados levam a correcoes precisas

  Sinal de alerta (considere pausar):
  - Resposta menciona funcao ou arquivo que nao existe no projeto
  - Codigo gerado duplica logica ja existente
  - Sugestao contradiz decisao tomada nesta sessao
  - Resposta generica, sem referencia ao projeto especifico

---

CHECKLIST DE INICIO DE SESSAO

- [ ] Handover Block da sessao anterior carregado (se aplicavel)
- [ ] PLAN.md da fase atual lido
- [ ] Apenas os arquivos necessarios para a primeira task carregados
- [ ] Contexto atual estimado: abaixo de 30% para trabalho complexo
- [ ] Goal da sessao claro antes de qualquer geracao de codigo
