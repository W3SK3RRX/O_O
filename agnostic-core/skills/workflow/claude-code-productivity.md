Claude Code Productivity

Objetivo: Extrair produtividade maxima do Claude Code usando recursos nativos validados — contexto cirurgico, historico, metricas, onboarding, paralelismo e inteligencia de IDE.

Baseado em diretivas validadas pela comunidade Claude Code.

---

PRINCIPIO

Claude Code nao e apenas um chat com LLM. E um ambiente de desenvolvimento assistido com ferramentas integradas que a maioria dos usuarios ignora. As 6 diretivas abaixo cobrem o ciclo completo: como fornecer contexto, como reaproveitar trabalho, como monitorar consumo, como iniciar projetos, como paralelizar tarefas e como aproveitar a inteligencia do editor.

Dominar essas diretivas e a diferenca entre usar Claude Code como um chatbot e usa-lo como um copiloto de engenharia.

Ver tambem: context-management.md (gestao de sessoes e context rot), model-routing.md (escolha de modelo por tarefa).

---

CONTEXTO INSTANTANEO (@MENTIONS)

A forma mais rapida de fornecer contexto. Use @nome-do-arquivo para injetar arquivos especificos diretamente no prompt.

  Por que usar:
  - Elimina descricoes vagas como "aquele arquivo de rotas"
  - O modelo recebe o conteudo exato, sem alucinacoes sobre estrutura
  - Reduz tokens desperdicados com explicacoes de contexto

  Exemplos praticos:
  - @src/routes/users.ts refatore esta rota para usar async/await
  - @package.json atualize as dependencias de teste
  - @schema.prisma adicione o campo status ao modelo Order
  - @.env.example quais variaveis de ambiente estao faltando?

  Quando usar:
  - Sempre que o prompt referenciar um arquivo especifico
  - Para code review pontual: @src/auth/login.ts revise seguranca
  - Para contexto de configuracao: @tsconfig.json @eslint.config.js verifique compatibilidade

  Quando NAO usar:
  - Nao injete arquivos grandes inteiros se so precisa de um trecho
  - Nao injete dezenas de arquivos de uma vez — causa context bloat

Ver: context-management.md secao CARREGAMENTO CIRURGICO DE CONTEXTO.

---

BUSCA DE HISTORICO (CTRL + R)

O historico de prompts e pesquisavel. Pressione Ctrl + R para fazer busca reversa e reaproveitar prompts complexos sem reescrever.

  Por que usar:
  - Prompts complexos (multi-step, com instrucoes detalhadas) levam tempo para compor
  - Reusar prompt validado e mais seguro que reescrever de memoria
  - Economiza tokens ao evitar tentativa-e-erro

  Dicas para historico eficiente:
  - Use prefixos consistentes em prompts importantes: [DEPLOY], [REVIEW], [REFACTOR]
  - Prompts frequentes se tornam templates naturais no historico
  - Combine com @mentions: o historico preserva a estrutura completa

  Exemplo de workflow:
  1. Compose um prompt complexo de code review com criterios especificos
  2. Dias depois, Ctrl+R e busque "review" ou o prefixo usado
  3. Prompt original aparece pronto para reutilizar com outro arquivo

---

METRICAS DE USO (/stats)

Use o comando /stats para visualizar um grafico de atividade (estilo GitHub), monitorando consumo de tokens e modelos utilizados.

  O que /stats mostra:
  - Grafico de atividade por dia (heatmap de uso)
  - Total de tokens consumidos no periodo
  - Distribuicao de modelos utilizados (opus, sonnet, haiku)
  - Historico de sessoes

  Por que monitorar:
  - Identificar picos de consumo inesperados
  - Validar se o roteamento de modelos esta correto (nao usar opus para tarefas mecanicas)
  - Planejar uso dentro de limites de API ou plano

  Quando consultar:
  - No inicio de cada semana para revisar consumo da semana anterior
  - Apos features complexas para avaliar custo real
  - Quando suspeitar de context rot (consumo alto, produtividade baixa)

Ver: model-routing.md para otimizar distribuicao entre tiers de modelos.
Ver: context-audit.md para diagnosticar consumo excessivo de tokens.

---

ONBOARDING AUTOMATICO (/init)

Execute /init em novos repositorios para que o Claude faca onboarding automatico no projeto.

  O que /init faz:
  - Analisa a estrutura do repositorio (stack, dependencias, patterns)
  - Cria o arquivo CLAUDE.md com convencoes detectadas
  - Estabelece contexto base para todas as sessoes futuras

  Quando usar:
  - Primeiro contato com qualquer repositorio novo
  - Ao integrar Claude Code em projeto existente
  - Apos mudancas significativas de stack ou estrutura

  Boas praticas pos-init:
  - Revise o CLAUDE.md gerado e ajuste convencoes do projeto
  - Adicione referencias ao agnostic-core se aplicavel
  - Commite o CLAUDE.md no repositorio para compartilhar com o time

Ver: project-workflow.md FASE 1 para o contexto de inicializacao de projetos.

---

PARALELISMO COM SUBAGENTS

Subagents sao processos que rodam em background. Cada um possui sua propria janela de contexto de 200k tokens, executa tarefas especializadas em paralelo, tem acesso a ferramentas MCP e mescla os resultados de volta ao agente principal.

  Caracteristicas dos subagents:
  - Contexto isolado de 200k tokens (nao polui o contexto principal)
  - Execucao em background (nao bloqueia o agente principal)
  - Acesso completo a ferramentas: leitura, escrita, busca, MCP servers
  - Resultado retorna ao agente principal para consolidacao

  Quando delegar para subagents:
  - Pesquisa ampla no codebase (buscar patterns em multiplos diretorio)
  - Tarefas independentes que podem rodar em paralelo
  - Analises que geram muito output (evita poluir contexto principal)
  - Execucao de testes ou validacoes em background

  Quando NAO usar subagents:
  - Tarefas simples e diretas (uma busca, uma leitura de arquivo)
  - Quando o resultado e necessario imediatamente para o proximo passo
  - Para tarefas que dependem de estado acumulado na conversa atual

  Exemplo de dispatch paralelo:
  - Agente 1: pesquisar todos os endpoints de API no projeto
  - Agente 2: mapear schema do banco de dados
  - Agente 3: listar testes existentes e coverage
  - Principal: consolida resultados e planeja a feature

Ver: model-routing.md secao DISPATCH PARALELO para combinar paralelismo com roteamento de modelos.

---

INTELIGENCIA DE IDE (LSP INTEGRATION)

A integracao com Language Server Protocol (LSP) fornece diagnosticos instantaneos, navegacao de codigo e consciencia profunda da linguagem utilizada.

  O que LSP habilita:
  - Diagnosticos em tempo real (erros de tipo, imports invalidos, variaveis nao usadas)
  - Go-to-definition e find-references para navegacao precisa
  - Autocompletar informado pelo tipo real das variaveis
  - Consciencia de todo o projeto, nao apenas do arquivo aberto

  Impacto na produtividade:
  - Menos alucinacoes: Claude ve os tipos e imports reais via LSP
  - Correcoes mais precisas: diagnosticos apontam o problema exato
  - Refatoracao segura: find-references garante que todas as ocorrencias sejam atualizadas
  - Feedback instantaneo: erros aparecem antes de rodar o codigo

  Como garantir LSP ativo:
  - Use Claude Code integrado ao VS Code ou JetBrains (LSP automatico)
  - Verifique que o language server da sua stack esta instalado
  - Para TypeScript: tsserver ativo. Para Python: pyright ou pylsp
  - Para Go: gopls. Para Rust: rust-analyzer

---

COMBINANDO DIRETIVAS

As 6 diretivas se potencializam quando combinadas. Um workflow tipico de feature complexa:

  1. /init no repositorio novo (onboarding)
  2. @CLAUDE.md + @src/models/ para contexto instantaneo da feature
  3. Delegar pesquisa de codebase para subagents em paralelo
  4. Implementar com LSP ativo para feedback instantaneo
  5. Ctrl+R para reusar prompt de review padronizado
  6. /stats para avaliar custo total da feature

O ganho nao e linear — cada diretiva reduz friccao que amplifica a eficiencia das demais.

---

CHECKLIST

- [ ] Usar @filename para injetar contexto especifico em vez de descrever arquivos verbalmente
- [ ] Ctrl+R para reutilizar prompts complexos em vez de reescrever
- [ ] Consultar /stats periodicamente para monitorar consumo de tokens e modelos usados
- [ ] Rodar /init ao iniciar trabalho em repositorio novo
- [ ] Delegar tarefas independentes para subagents em vez de executar sequencialmente
- [ ] Verificar que LSP esta ativo para diagnosticos e navegacao de codigo
- [ ] Combinar diretivas: @mention + subagent + /stats para features complexas
