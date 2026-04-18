Technical Documentation

Objetivo: Manter documentacao tecnica viva, util e sincronizada com o codigo — sem criar burocracia que ninguem le.

---

README

O README e o primeiro contato de qualquer pessoa com o projeto. Deve responder 5 perguntas em menos de 2 minutos de leitura:

1. O que e o projeto? (1-2 frases)
2. Para quem e? (usuario, desenvolvedor, ambos)
3. Como rodar localmente? (passos copiavel e colavel)
4. Como contribuir? (link para CONTRIBUTING.md)
5. Status e licenca

Estrutura minima:
  # Nome do Projeto
  Descricao em 1-2 linhas.

  ## Requisitos
  - Node.js 20+, Docker, etc.

  ## Instalacao
  git clone ...
  npm install
  cp .env.example .env
  npm run dev

  ## Como usar
  [Exemplo minimo funcional]

  ## Contribuindo
  Ver CONTRIBUTING.md

  ## Licenca
  MIT

Regras:
- [ ] Passos de instalacao testados em maquina limpa antes de publicar
- [ ] Badges de CI, coverage e versao no topo (GitHub Actions, Shields.io)
- [ ] Sem documentar coisas obvias (nao precisa explicar o que e o git)
- [ ] README atualizado a cada mudanca de interface externa (nova env var, novo comando)

---

ADR — ARCHITECTURE DECISION RECORDS

ADR documenta o POR QUE de decisoes arquiteturais importantes, nao o como.
Uma decisao vira ADR quando: e dificil reverter, afeta multiplos times, ou a motivacao nao e obvia.

Arquivo: `docs/adr/NNN-titulo-kebab-case.md`

Template:
  # NNN. Titulo da Decisao

  Data: YYYY-MM-DD
  Status: Proposto | Aceito | Depreciado | Substituido por ADR-NNN

  ## Contexto
  [Situacao que exigiu a decisao. Fatos, nao opiniao.]

  ## Decisao
  [O que foi decidido em uma frase clara.]

  ## Consequencias
  Positivas:
  - [beneficio]

  Negativas:
  - [custo ou limitacao aceita]

  Alternativas consideradas:
  - [opcao A]: [por que nao foi escolhida]
  - [opcao B]: [por que nao foi escolhida]

Exemplos de decisoes que viram ADR:
- Escolha de banco de dados
- Adocao de monorepo vs repos separados
- Estrategia de autenticacao
- Arquitetura de microservicos vs monolito
- ORM vs queries raw

---

COMENTARIOS E DOCSTRINGS

Comentario no codigo:
  // BOM: explica o POR QUE (o que nao e obvio pelo codigo)
  // Usamos timeout de 5s aqui porque o servico X tem SLA de 3s
  // e precisamos de margem para retry antes de falhar

  // RUIM: explica o QUE (o codigo ja diz isso)
  // Incrementa o contador
  counter++

JSDoc (JavaScript/TypeScript) — obrigatorio para funcoes publicas de library/SDK:
  /**
   * Calcula a pontuacao final do jogador considerando bonus de posicao e capitania.
   * @param {Object} jogador - Dados do jogador na rodada
   * @param {number} jogador.pontos - Pontuacao base da rodada
   * @param {boolean} jogador.ehCapitao - Se o jogador e o capitao do time
   * @param {'MEI'|'MED'|'ATA'} jogador.posicao - Posicao do jogador
   * @returns {number} Pontuacao final com todos os bônus aplicados
   */
  function calcularPontuacao(jogador) { ... }

Python docstrings (Google style):
  def calcular_pontuacao(jogador: dict) -> float:
      """Calcula pontuação com bônus de posição e capitania.

      Args:
          jogador: Dict com campos 'pontos' (float), 'eh_capitao' (bool), 'posicao' (str)

      Returns:
          Pontuação final com todos os bônus aplicados.

      Raises:
          ValueError: Se posição não for válida.
      """

---

CHANGELOG

Formato: Keep a Changelog (https://keepachangelog.com)
Arquivo: `CHANGELOG.md` na raiz

Template:
  # Changelog

  ## [Unreleased]
  ### Added
  - [nova funcionalidade]

  ## [1.2.0] - 2024-03-15
  ### Added
  - Autenticacao via OAuth Google

  ### Fixed
  - Corrigido calculo de pontuacao para jogadores reserva

  ### Changed
  - Limite de tarefas por usuario aumentado de 100 para 500

  ### Removed
  - Endpoint legado GET /api/v1/pontos removido (depreciado em v1.1.0)

Categorias: Added / Changed / Deprecated / Removed / Fixed / Security

Regras:
- [ ] Atualizar em cada PR com mudanca visivel ao usuario
- [ ] Versao semantica: MAJOR.MINOR.PATCH (breaking.feature.fix)
- [ ] Data de release no formato YYYY-MM-DD
- [ ] [Unreleased] sempre no topo para mudancas nao lancadas

---

CHECKLIST DE DOCUMENTACAO

- [ ] README com passos de instalacao testados em maquina limpa
- [ ] .env.example com todas as variaveis e descricao de cada uma
- [ ] ADR criado para cada decisao arquitetural relevante
- [ ] CHANGELOG atualizado a cada release
- [ ] JSDoc/docstrings em funcoes publicas de modulos compartilhados
- [ ] Comentarios de codigo explicam POR QUE, nao O QUE
- [ ] Documentacao de API gerada automaticamente (ver openapi-swagger.md)
