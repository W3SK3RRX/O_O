Unit Testing

Objetivo: Garantir cobertura e qualidade de testes unitarios com padrao AAA, isolamento correto e criterios de aceite verificaveis.

---

PADRAO AAA

Todo teste unitario segue tres blocos nomeados:

  Arrange — configura o estado inicial e dependencias (mocks, fixtures, inputs)
  Act     — executa a unidade sob teste (uma unica chamada)
  Assert  — verifica o resultado (um comportamento por teste)

Exemplo (Jest/Vitest):
  it('deve calcular pontuacao com bonus de capitao', () => {
    // Arrange
    const jogador = { nome: 'Hulk', pontos: 10, ehCapitao: true }

    // Act
    const resultado = calcularPontuacao(jogador)

    // Assert
    expect(resultado).toBe(20) // bonus 2x para capitao
  })

Regras do AAA:
- [ ] Um unico Act por teste (uma chamada, nao duas)
- [ ] Um comportamento por Assert (use multiplos testes, nao multiplos expects por comportamento)
- [ ] Arrange nao tem logica de negocios (configuracao pura)

---

NOMENCLATURA

Formato padrao: `deve [resultado esperado] quando [condicao]`

  Bom:  'deve retornar 0 quando lista de jogadores estiver vazia'
  Bom:  'deve lancar erro quando token estiver expirado'
  Ruim: 'test calcularPontuacao'
  Ruim: 'funciona corretamente'

Organizacao:
  describe('NomeDoModulo ou NomeDaFuncao') {
    describe('cenario ou condicao') {
      it('deve comportamento esperado') {}
    }
  }

---

COBERTURA

- [ ] Coverage minima: 80% de linhas e branches para modulos de negocio
- [ ] Coverage de 100% para funcoes financeiras, de autenticacao e validacao critica
- [ ] Arquivos de configuracao, migrations e boilerplate excluidos do threshold

Configurar threshold (Jest):
  "jest": {
    "coverageThreshold": {
      "global": { "lines": 80, "branches": 80 }
    }
  }

O que coverage nao garante:
- [ ] Coverage de 100% nao significa ausencia de bugs — testar comportamentos, nao linhas
- [ ] Evite testes que apenas executam o codigo sem assertions uteis (coverage falso)

---

MOCKING

- [ ] Mockar dependencias externas: banco, APIs, email, fila, sistema de arquivos, clock
- [ ] Nao mockar logica interna de negocio — se precisa mockar, o design pode estar errado
- [ ] Restaurar mocks apos cada teste (afterEach → jest.restoreAllMocks())

Boas praticas de mock:
  // BOM: mockar dependencia real
  jest.mock('../services/emailService')
  emailService.send.mockResolvedValue({ success: true })

  // RUIM: mockar a propria unidade sob teste
  jest.mock('../services/pontuacaoService') // nao faca isso no teste de pontuacaoService

---

CASOS DE BORDA

Para cada funcao, cubra:
- [ ] Input valido (caminho feliz)
- [ ] Input invalido ou malformado
- [ ] Input nos limites: zero, negativo, vazio, null/undefined
- [ ] Concorrencia: o que acontece se chamado duas vezes ao mesmo tempo (se relevante)
- [ ] Erros: o que a funcao lanca ou retorna quando dependencia falha

---

TESTES ASINCRONOS

- [ ] Sempre retornar a Promise ou usar async/await — nunca testar async sem await
- [ ] Testar tanto o caminho de sucesso quanto o de rejeicao
- [ ] Usar jest.useFakeTimers() para testar logica com setTimeout/setInterval

  // BOM
  it('deve rejeitar com erro quando API falha', async () => {
    apiClient.get.mockRejectedValue(new Error('timeout'))
    await expect(buscarDados()).rejects.toThrow('timeout')
  })

---

FERRAMENTAS

| Ecossistema | Framework | Coverage | Mocking |
|---|---|---|---|
| Node.js / JS | Jest ou Vitest | c8 (nativo) | jest.mock / vi.mock |
| Python | pytest | pytest-cov | unittest.mock / pytest-mock |
| Go | testing stdlib | go test -cover | interfaces + stubs |
| Java/Kotlin | JUnit 5 | JaCoCo | Mockito |

---

CHECKLIST PRE-MERGE

- [ ] `npm test` (ou equivalente) passa sem falhas
- [ ] Coverage acima do threshold configurado
- [ ] Nenhum `it.skip` ou `xit` sem issue rastreando o motivo
- [ ] Nenhum `console.log` em testes (use jest.spyOn se precisar verificar logs)
- [ ] Testes nao dependem de ordem de execucao (cada teste e isolado)
