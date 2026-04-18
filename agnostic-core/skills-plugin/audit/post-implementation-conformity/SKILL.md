---
name: post-implementation-conformity
description: 'Auditoria de consistencia cruzada: codigo vs documentacao vs regras do projeto'
---

CHECKLIST UNIVERSAL (6 dimensoes)

1 - Cross-References
- [ ] Docs referenciados no codigo existem e estao atualizados
- [ ] Links internos (entre docs, entre skills) sao validos e apontam para arquivos existentes
- [ ] Nomes em documentacao = nomes reais no codigo (funcoes, classes, arquivos, rotas)
- [ ] Exemplos em docs refletem a implementacao atual (nao versao anterior)

2 - Regras e Convencoes
- [ ] Novas regras adicionadas ao config principal do projeto (lint, CLAUDE.md, etc.)
- [ ] Sem contradicoes entre regras novas e regras existentes
- [ ] Rastreabilidade: licoes aprendidas geraram regras documentadas
- [ ] Convencoes do projeto foram seguidas (ver configs de lint/format)

3 - Indices e Mapas
- [ ] Catalogos e keywords atualizados para refletir novos artefatos
- [ ] Tabelas de referencia rapida incluem novos itens
- [ ] Workflows/pipelines incluem novas etapas quando aplicavel
- [ ] Indices de skills/docs listam os novos arquivos criados

4 - Versionamento de Assets
- [ ] Cache busting atualizado (hashes, versoes em query strings)
- [ ] Manifestos e registries refletem as mudancas (package.json, lockfiles, etc.)
- [ ] Assets estaticos versionados corretamente
- [ ] Changelog/release notes incluem as mudancas desta iteracao

5 - Consistencia de Nomenclatura
- [ ] Convencao de idioma respeitada (portugues ou ingles, nao misturado sem motivo)
- [ ] Casing consistente (kebab-case para arquivos, camelCase para funcoes, etc.)
- [ ] Sem sinonimos ambiguos (mesmo conceito = mesmo nome em todo lugar)
- [ ] Abreviacoes usadas de forma consistente no projeto

6 - Completude
- [ ] TODOs resolvidos ou registrados no backlog com issue linkada
- [ ] Sem arquivos temporarios commitados (*.tmp, *.bak, .DS_Store)
- [ ] Toda funcionalidade nova tem documentacao correspondente
- [ ] Toda documentacao nova tem funcionalidade correspondente (sem docs orfaos)
- [ ] Sem imports ou dependencias nao utilizadas adicionadas

---

COMO USAR

1. Rode apos concluir implementacao E documentacao
2. Percorra cada dimensao marcando os itens aplicaveis
3. Para cada item que falhar: corrija antes de considerar a tarefa completa
4. Itens nao aplicaveis ao contexto podem ser ignorados (nem todo projeto tem assets, cache, etc.)
5. Use como gate final: so marque a tarefa como concluida quando o checklist passar

---

SKILLS RELACIONADAS

  skills/audit/code-review.md            Revisao de codigo
  skills/audit/validation-checklist.md   Checklist de validacao pre-deploy
  skills/audit/pre-implementation.md     Verificacao pre-implementacao
  skills/devops/pre-deploy-checklist.md  Checklist de pre-deploy

