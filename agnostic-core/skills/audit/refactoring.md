# Refactoring — Decomposição Segura

Guia para refatorar código legado de forma incremental sem quebrar o que funciona.
Útil ao trabalhar em arquivo monolítico, ao adicionar feature em módulo com responsabilidades
misturadas, ou ao revisar um PR de refatoração.

Regra de Ouro
E melhor um monolito funcionando do que modulos quebrados.
Nunca refatorar sem entender 100% da logica de negocio.

As 7 Fases

Fase 0 - Pre-Analise (Antes de Ver Qualquer Codigo)
- [ ] Qual e o proposito do modulo/arquivo?
- [ ] E um arquivo critico (financeiro, autenticacao, dados do usuario)?
- [ ] Quando foi modificado pela ultima vez? Por que?
- [ ] Existe cobertura de testes atual?
- [ ] A refatoracao foi aprovada pelo time?

Fase 1 - Analise Estrutural
- [ ] Medir metricas: linhas totais, numero de funcoes, numero de classes
- [ ] Listar todas as funcoes com: nome, linhas, responsabilidade
- [ ] Identificar responsabilidades misturadas (ex: query + negocio + HTTP)
- [ ] Criar mapa: quais funcoes chamam quais

Fase 2 - Mapeamento de Dependencias
- [ ] Listar imports do arquivo (o que ele depende)
- [ ] Listar quem importa ou usa este arquivo (Grep no projeto)
- [ ] Identificar "costuras naturais" onde o codigo pode ser separado
- [ ] Verificar quais partes sao mais volateis (mudam com frequencia)

Fase 3 - Perguntas de Clarificacao
- [ ] Qual funcionalidade e mais critica (nao pode quebrar)?
- [ ] Quais partes mudam com mais frequencia?
- [ ] Existe dependencia circulara que precisara ser resolvida?
- [ ] Qual e o tempo disponivel para a refatoracao?

Fase 4 - Proposta de Arquitetura
- [ ] Definir novos modulos com responsabilidade unica cada
- [ ] Mapear fluxo de dependencias entre os novos modulos
- [ ] Sem dependencias circulares na proposta
- [ ] Proposta revisada e aprovada antes de qualquer codigo

Fase 5 - Extracao Incremental (Executar)
- [ ] Uma funcao por vez (nao mover tudo de uma vez)
- [ ] Um commit por extracao
- [ ] Testar apos cada extracao (nao acumular mudancas)
- [ ] Manter o arquivo original funcionando enquanto extrai
- [ ] Re-exportar do arquivo original enquanto migracao nao termina

Fase 6 - Validacao
- [ ] Todos os testes existentes passam apos cada fase
- [ ] Smoke test manual dos fluxos criticos
- [ ] Verificar que nenhum import quebrou em outros arquivos
- [ ] Verificar multi-tenant/multi-contexto se aplicavel

Fase 7 - Rollback
- [ ] Branch de feature separada (nao direto em main)
- [ ] Commits atomicos permitem revert por funcao
- [ ] Plano de rollback documentado antes de comecar
- [ ] Checkpoint: ponto seguro para voltar se algo quebrar

Anti-Patterns de Refatoracao
- Big bang: mover tudo de uma vez → nunca
- Refatorar sem entender: fazer split sem ler toda a logica → nunca
- Deletar imediatamente: remover codigo antigo antes de validar o novo → nunca
- Micro-modulos: criar arquivo para cada funcao → overengineering
- Refatorar + feature: misturar no mesmo PR → separar sempre
- Sem testes: refatorar sem cobertura de testes existente → risco alto

Sinais de que Refatoracao Esta Saindo do Controle
- PR com mais de 500 linhas alteradas
- Mais de 5 arquivos novos de uma vez
- Testes quebrados sem motivo claro
- "So mais um ajuste" acumulando infinitamente
- Sem conseguir explicar o que cada novo modulo faz

## Checklist de validação final
- [ ] Todos os testes passam
- [ ] Sem logica de negocio alterada (apenas estrutura)
- [ ] Sem funcionalidade nova misturada
- [ ] Todos os imports atualizados nos consumidores
- [ ] CHANGELOG atualizado descrevendo o que foi reorganizado

Referencias
- Martin Fowler, "Refactoring: Improving the Design of Existing Code"
- https://refactoring.guru/refactoring
- https://martinfowler.com/bliki/StranglerFigApplication.html (migracao incremental)
