# Refactor Monolith — Decomposição Segura de Monolito

Guia para decompor aplicações monolíticas de forma incremental sem interromper
o funcionamento em produção. Útil ao planejar extração de serviços, modularização
de um codebase crescido demais, ou migração para arquitetura orientada a domínio.

Regra de Ouro: Um monolito funcionando é melhor que microsserviços quebrados.
Nunca decompor sem entender completamente os limites do domínio.

---

## Sinais de que o Monolito Precisa de Decomposição

- Um único deploy trava todas as equipes
- Mudanças em módulo A quebram módulo B sem relação aparente
- Tempos de build/test superiores a 15 minutos
- Banco de dados com mais de 150 tabelas sem separação clara de domínio
- Times diferentes modificando os mesmos arquivos constantemente
- Impossível escalar horizontalmente partes específicas do sistema

---

## Estratégias de Decomposição

### Strangler Fig (Recomendado)
Substituir gradualmente partes do monolito por serviços novos sem reescrever tudo:

```
[Cliente] → [API Gateway / Proxy]
               ├── /novo-dominio → [Serviço Novo]
               └── /resto        → [Monolito Legado]
```

- Novos endpoints vão direto ao serviço novo
- Endpoints antigos permanecem no monolito até migração completa
- Monolito vai "morrendo" gradualmente conforme serviços são extraídos

### Modularização Interna (Menos Risco)
Antes de extrair serviços, organizar o monolito por domínios dentro do mesmo processo:

```
src/
  modules/
    pagamentos/     # tudo de pagamentos: routes, services, models
    usuarios/       # tudo de usuários
    estoque/        # tudo de estoque
  shared/           # código genuinamente compartilhado
```

### Branch by Abstraction
Para substituir um componente interno sem fork de longa duração:

1. Criar interface/abstração sobre o componente a substituir
2. Fazer código existente usar a abstração
3. Implementar novo componente por trás da abstração
4. Migrar gradualmente para nova implementação
5. Remover implementação antiga

---

## As 6 Fases

### Fase 0 — Mapeamento de Domínio (Não Pular)
- [ ] Identificar os domínios de negócio principais (Domain-Driven Design bounded contexts)
- [ ] Entrevistar especialistas de negócio: o que muda junto? O que muda separado?
- [ ] Criar mapa de relacionamentos entre domínios
- [ ] Identificar domínio mais independente (candidato a primeira extração)
- [ ] Documentar o modelo de dados atual e quais tabelas pertencem a qual domínio

### Fase 1 — Análise de Acoplamento
- [ ] Gerar grafo de dependências entre módulos/pacotes
- [ ] Identificar dados compartilhados entre domínios (maior risco)
- [ ] Listar chamadas síncronas entre módulos candidatos à separação
- [ ] Identificar transações que cruzam os limites do domínio
- [ ] Medir frequência de mudanças por arquivo (git log --follow)

```bash
# Ver arquivos mais modificados nos últimos 6 meses
git log --since="6 months ago" --name-only --pretty=format: | \
  sort | uniq -c | sort -rn | head -30
```

### Fase 2 — Definir Contrato de Interface
Antes de separar qualquer código, definir como os domínios vão se comunicar:

- [ ] API REST ou mensageria (eventos)? Definir antes de codar
- [ ] Quais dados são compartilhados e como serão sincronizados?
- [ ] Contratos versionados e documentados (OpenAPI para REST, Avro/JSON Schema para eventos)
- [ ] Estratégia de consistência: síncrona (simples, acoplamento) ou eventual (resiliente, complexidade)

### Fase 3 — Separação do Banco de Dados (Crítico)
O banco compartilhado é o maior obstáculo. Opções em ordem de risco:

1. **Schema separation** (mais seguro): Tabelas do domínio em schema separado, mesmo banco
2. **Database-per-service** (ideal a longo prazo): Banco próprio por serviço, sem JOINs cross-service
3. **Shared database** (evitar): Manter compartilhado temporariamente, migrar depois

- [ ] Identificar tabelas que pertencem exclusivamente ao domínio extraído
- [ ] Identificar tabelas compartilhadas — decidir quem é "dono"
- [ ] Plano de migração de dados sem downtime (Blue/Green, shadow writes)
- [ ] Remover foreign keys cross-domínio (substituir por IDs com consistência eventual)

### Fase 4 — Extração Incremental
- [ ] Extrair uma função/responsabilidade por vez (nunca tudo de uma vez)
- [ ] Manter código original funcionando em paralelo durante transição
- [ ] Feature flag para redirecionar tráfego gradualmente (1% → 10% → 100%)
- [ ] Monitoramento comparativo: latência e erros antes/depois da extração
- [ ] Um commit por extração, PR separado por módulo

### Fase 5 — Validação e Operação
- [ ] Todos os testes passam para o domínio extraído
- [ ] Smoke tests dos fluxos críticos de negócio
- [ ] Observabilidade: traces distribuídos, logs correlacionados, métricas por serviço
- [ ] Runbook de operação do novo serviço documentado
- [ ] Plano de rollback testado (não apenas planejado)

### Fase 6 — Remoção do Código Legado
- [ ] 100% do tráfego no novo serviço por pelo menos 2 semanas
- [ ] Zero incidentes relacionados à migração no período
- [ ] Código antigo removido em PR separado e revisado
- [ ] Documentação atualizada

---

## Anti-Patterns

- **Big Bang Rewrite**: descartar o monolito e reescrever tudo — risco altíssimo, raramente funciona
- **Nanoserviços**: criar serviço para cada função — overhead de operação supera benefícios
- **Banco compartilhado indefinidamente**: maior fonte de acoplamento, inviabiliza deploy independente
- **Sem testes antes de extrair**: impossível garantir que o comportamento foi preservado
- **Extrair sem separar dados**: serviço novo que lê do banco do monolito não é independente
- **Migrar tudo de uma vez**: impossível de fazer rollback, alto risco

---

## Checklist de Prontidão para Extração

Antes de iniciar qualquer extração, confirmar:

- [ ] O domínio tem limites claros de responsabilidade
- [ ] Existe cobertura de testes adequada no código a ser extraído
- [ ] O time entende a lógica de negócio do domínio completamente
- [ ] A estratégia de banco de dados está definida
- [ ] O contrato de API está especificado e revisado
- [ ] Observabilidade (logs, métricas, traces) está planejada
- [ ] Plano de rollback está documentado
- [ ] Não há prazo de entrega de feature que conflite com a migração

---

## Referências

- Martin Fowler — Strangler Fig Application: https://martinfowler.com/bliki/StranglerFigApplication.html
- Sam Newman — "Building Microservices" (capítulos de decomposição)
- "Monolith to Microservices" — Sam Newman
- https://microservices.io/patterns/decomposition/
- Ver também: skills/audit/refactoring.md (decomposição segura em nível de arquivo)
- Ver também: skills/backend/domain-driven-design.md (definição de bounded contexts)
