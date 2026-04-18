PR Template

Objetivo: Padronizar pull requests para facilitar code review, rastreabilidade e onboarding de novos contribuidores.

---

ARQUIVO .github/PULL_REQUEST_TEMPLATE.md

Crie o arquivo abaixo na raiz do repositorio:

---

## Contexto

<!-- O que motivou esta mudanca? Link para issue, requisito ou bug. -->
<!-- Closes #NNN | Fixes #NNN | Ref #NNN -->



## O que muda

<!-- Lista concisa do que foi adicionado, alterado ou removido. -->
<!-- Foco no IMPACTO, nao em listar arquivos modificados. -->

- [ ]
- [ ]

## Tipo de mudanca

- [ ] Nova funcionalidade (feat)
- [ ] Correcao de bug (fix)
- [ ] Refactoring sem mudanca de comportamento
- [ ] Documentacao
- [ ] Configuracao / infra
- [ ] Breaking change (requer atualizacao de consumidores)

## Como testar

<!-- Passos para o reviewer verificar a mudanca localmente. -->
<!-- Inclua: comandos, endpoints, cenarios de teste manual. -->

1.
2.

## Checklist

- [ ] Testes adicionados ou atualizados
- [ ] `npm test` (ou equivalente) passando
- [ ] Documentacao atualizada (README, CHANGELOG, JSDoc)
- [ ] Variaveis de ambiente novas documentadas em `.env.example`
- [ ] Sem segredos ou credenciais no codigo
- [ ] Breaking changes documentadas no CHANGELOG

## Screenshots (se aplicavel)

<!-- Para mudancas visuais: antes e depois. -->

---

TEMPLATE PARA HOTFIX

Versao simplificada para correcoes urgentes:

---

## Bug corrigido

<!-- Descricao em 1-2 linhas do problema. -->
<!-- Closes #NNN -->

## Causa raiz

<!-- Por que o bug ocorreu. -->

## Correcao

<!-- O que foi feito para corrigir. -->

## Testado em

- [ ] Ambiente de staging
- [ ] Producao (apos deploy)

---

BOAS PRATICAS DE PR

Tamanho:
- [ ] PR focado em uma unica mudanca logica
- [ ] Menos de 400 linhas adicionadas (PRs grandes tem menos revisao de qualidade)
- [ ] Se for maior, dividir em PRs menores e sequenciais

Titulo:
  Formato: `type(scope): descricao` (igual ao commit convencional)
  feat(auth): adicionar login via OAuth Google
  fix(api): corrigir 500 ao deletar usuario sem pedidos

Descricao:
- [ ] Contexto claro: link para issue ou PRD
- [ ] "O que muda" em bullets, nao em texto corrido
- [ ] "Como testar" com passos executaveis (nao vague "testar a funcionalidade")
- [ ] Screenshots para mudancas visuais

Draft PR:
  Abrir como draft quando o trabalho ainda nao esta pronto para review.
  Converte para "ready for review" ao terminar.
  Util para feedback antecipado em mudancas grandes.

---

PROCESSO DE REVIEW

Para quem revisa:
- [ ] Entender o contexto antes de comentar o codigo
- [ ] Distinguir: bloqueante (deve mudar) vs sugestao (pode ignorar com justificativa)
- [ ] Prefixar sugestoes: "nit:", "opcional:", "bloqueante:"
- [ ] Aprovar mesmo com comentarios nao-bloqueantes para nao travar o flow

Para quem recebe review:
- [ ] Responder ou resolver cada comentario antes de pedir re-review
- [ ] Nao fazer mudancas grandes sem alinhar com o reviewer
- [ ] Usar "Request changes" como feedback especifico, nao como veto generico

---

CHECKLIST DE ABERTURA DE PR

- [ ] Titulo segue formato de commit convencional
- [ ] Template preenchido completamente (sem campos em branco)
- [ ] Issue linkada no contexto
- [ ] Branch atualizado com main
- [ ] CI verde antes de pedir review
- [ ] Reviewer(s) assignados
- [ ] Labels aplicadas (feat, fix, docs, breaking, etc.)
