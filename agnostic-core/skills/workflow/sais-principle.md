# Princípio S.A.I.S — Mudança Cirúrgica

Framework de decisão para qualquer alteração em código existente.
Aplique antes de tocar em qualquer arquivo.

Fonte: padrão extraído do f1-pulse.

---

## O Framework

**S — Solicitar**
Leia o que existe. Nunca pergunte "onde fica o arquivo?" — busque sozinho.
Entenda o estado atual antes de qualquer análise.

**A — Analisar**
Por que o código funciona assim?
Qual foi a intenção original? O que pode estar dependendo disso?

**I — Identificar dependências**
O que quebra se eu mudar isso?
Mapeie: outros arquivos, outros módulos, testes, tipos, rotas.

**S — (A)lterar**
Faça a mudança mínima e cirúrgica.
Resolva o problema declarado. Nada além.

---

## Quando aplicar

- Qualquer mudança em código que já existe
- Bug fixes — especialmente quando a causa raiz não é óbvia
- Refactors — antes de mover qualquer coisa
- Adição de feature em módulo existente

## Quando não aplicar

- Arquivo novo do zero (não há estado anterior para ler)
- Tarefa trivial com 1 ação óbvia e sem dependências

---

## Anti-patterns que o S.A.I.S previne

| Pensamento | Problema real |
|---|---|
| "Sei como funciona, vou direto" | Conhecer o conceito ≠ entender esta implementação |
| "É uma mudança pequena" | Mudanças pequenas em lugares errados causam regressões |
| "Vou investigar depois de alterar" | Investigação vem antes da alteração, sempre |
| "Onde fica o arquivo?" | Leia o codebase — não transfira o custo para o usuário |

---

## Ver também

- `skills/audit/systematic-debugging.md` — quando o problema é um bug
- `skills/audit/pre-implementation.md` — planejamento antes de implementar
- `skills/audit/senior-verification-protocol.md` — verificação após alterar
