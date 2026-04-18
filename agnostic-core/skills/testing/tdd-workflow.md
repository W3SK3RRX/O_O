TDD Workflow

Objetivo: Aplicar o ciclo Red-Green-Refactor para desenvolver logica de negocio com confianca, design emergente e cobertura nativa.

---

CICLO RED-GREEN-REFACTOR

  RED    → escreva um teste que falha (comportamento ainda nao implementado)
  GREEN  → implemente o minimo para o teste passar (sem otimizacao)
  REFACTOR → melhore o codigo sem mudar comportamento (testes continuam passando)

Regra fundamental: nunca refatore com teste vermelho. Nunca implemente sem teste vermelho primeiro.

---

QUANDO APLICAR TDD

TDD e obrigatorio:
- Logica de negocio com regras complexas (calculo de pontuacao, regras de desconto, estado de pedido)
- Algoritmos com multiplos casos de borda
- Servicos de dominio (sem I/O — servicos puros)
- Codigo que vai ser mantido por muito tempo

TDD e opcional (avaliar custo/beneficio):
- CRUD simples sem logica (apenas persistencia)
- Controllers de rota (testar via integracao e mais eficiente)
- Migrations de banco de dados

TDD nao faz sentido:
- Configuracao de infra (Dockerfile, CI config)
- Boilerplate de framework (express app setup)
- Codigo que muda muito rapido durante exploracao inicial

---

PASSO A PASSO COMPLETO

1. Entenda o comportamento antes de escrever qualquer codigo.
   Escreva a descricao do teste como especificacao:
     it('deve dobrar pontuacao quando jogador e capitao')
     it('deve retornar 0 quando jogador nao participou da rodada')
     it('deve lancar erro quando rodada nao existe')

2. Escreva o teste mais simples primeiro (RED):
     it('deve dobrar pontuacao quando jogador e capitao', () => {
       const resultado = calcularPontuacao({ pontos: 10, ehCapitao: true })
       expect(resultado).toBe(20)
     })
   Execute: `npm test` → deve falhar (funcao nao existe ainda)

3. Implemente o minimo para passar (GREEN):
     function calcularPontuacao({ pontos, ehCapitao }) {
       return ehCapitao ? pontos * 2 : pontos
     }
   Execute: `npm test` → deve passar

4. Refatore sem quebrar (REFACTOR):
   - Nomeie melhor? Extraia helper? Elimine duplicacao?
   - Testes continuam verdes apos cada mudanca

5. Repita para o proximo comportamento (RED novamente)

---

ESCREVENDO BONS TESTES TDD

Teste como especificacao — leia o nome do teste sem ver o codigo:
  Bom:  'deve aplicar desconto de 10% para compras acima de R$100'
  Bom:  'deve rejeitar transacao quando saldo e insuficiente'
  Ruim: 'teste do metodo calcular'

Um comportamento por teste:
  // RUIM: dois comportamentos em um teste
  it('deve calcular bonus e validar capitao', () => { ... })

  // BOM: separados
  it('deve aplicar bonus de 2x para capitao')
  it('deve rejeitar pontuacao negativa')

Teste o comportamento, nao o nome do metodo:
  // RUIM: acoplado ao nome interno
  it('deve chamar aplicarDesconto')

  // BOM: comportamento observavel
  it('deve reduzir preco em 10% para cliente premium')

---

TDD COM DEPENDENCIAS EXTERNAS

Quando a unidade depende de banco, API ou servico externo, mocke a dependencia no teste:

  // RED: defina o comportamento esperado
  it('deve salvar usuario e enviar email de boas-vindas', async () => {
    emailService.send = jest.fn().mockResolvedValue(true)

    await userService.register({ email: 'a@b.com', password: '123' })

    expect(emailService.send).toHaveBeenCalledWith({
      to: 'a@b.com',
      template: 'welcome'
    })
  })

Depois implemente o service para passar o teste.

---

REFACTORING SEGURO

Sinais de que o codigo precisa de refactoring (mesmo com testes verdes):
- [ ] Logica duplicada em dois lugares
- [ ] Funcao com mais de 20 linhas
- [ ] Nome que nao descreve o que faz
- [ ] Condicional encadeada com 3+ niveis
- [ ] Argumento boolean que muda o comportamento da funcao

Processo de refactoring:
1. Testes passando (verde)
2. Faca uma mudanca pequena
3. Execute os testes
4. Se verde, continue
5. Se vermelho, desfaca e tente diferente

---

CHECKLIST TDD POR FEATURE

- [ ] Comportamentos listados como descricoes de teste antes de codar
- [ ] Primeiro teste escrito falha (RED confirmado)
- [ ] Implementacao minima para verde (sem over-engineering)
- [ ] Refactoring feito com testes passando
- [ ] Casos de borda cobertos: zero, null, limite, erro
- [ ] Nenhum teste pulado (skip/xtest) sem issue rastreando
