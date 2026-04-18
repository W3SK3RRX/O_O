# Security Review — Revisão de Segurança Focada em Diff

Revisão de segurança focada nas mudanças do branch atual.
Identifica vulnerabilidades de alta confiança com potencial real de exploração.

Adaptado de claude-code-security-review (MIT). Fonte: https://github.com/anthropics/claude-code-security-review

---

## Filosofia

- Foco apenas no código alterado (diff-aware), não no projeto inteiro
- Minimizar falsos positivos: só reportar com >80% de confiança de explorabilidade
- Priorizar impacto real: acesso não autorizado, vazamento de dados, comprometimento do sistema
- Cada finding deve ser acionável por um time de segurança

---

## Metodologia (3 Fases)

### Fase 1 — Contexto do Repositório

- Identificar frameworks e bibliotecas de segurança em uso
- Mapear padrões de sanitização e validação existentes
- Entender o modelo de segurança e superfície de ataque do projeto

### Fase 2 — Análise Comparativa

- Comparar código novo contra padrões de segurança já estabelecidos
- Identificar desvios das práticas seguras existentes
- Identificar implementações de segurança inconsistentes
- Sinalizar código que introduz novas superfícies de ataque

### Fase 3 — Avaliação de Vulnerabilidades

- Examinar cada arquivo modificado para implicações de segurança
- Rastrear fluxo de dados desde inputs do usuário até operações sensíveis
- Identificar cruzamentos inseguros de fronteiras de privilégio
- Mapear pontos de injeção e desserialização insegura

---

## Categorias de Vulnerabilidades

### Validação de Input

- SQL injection via input não sanitizado
- Command injection em chamadas de sistema ou subprocessos
- XXE injection em parsing de XML
- Template injection em engines de template
- NoSQL injection em queries de banco
- Path traversal em operações de arquivo

### Autenticação e Autorização

- Bypass de lógica de autenticação
- Caminhos de escalação de privilégio
- Falhas no gerenciamento de sessão
- Vulnerabilidades em tokens JWT
- Bypass de lógica de autorização

### Criptografia e Gerenciamento de Secrets

- API keys, senhas ou tokens hardcoded
- Algoritmos criptográficos fracos
- Armazenamento ou gerenciamento inadequado de chaves
- Problemas com aleatoriedade criptográfica
- Bypass de validação de certificados

### Injeção e Execução de Código

- RCE via desserialização
- Pickle injection (Python)
- Desserialização YAML insegura
- Eval injection em execução dinâmica de código
- XSS (reflected, stored, DOM-based)

### Exposição de Dados

- Logging ou armazenamento de dados sensíveis
- Violações no tratamento de PII
- Vazamento de dados em endpoints de API
- Exposição de informações de debug

---

## Classificação de Severidade

| Severidade | Critério |
|---|---|
| HIGH | Diretamente explorável → RCE, vazamento de dados, bypass de autenticação |
| MEDIUM | Requer condições específicas mas com impacto significativo |
| LOW | Defesa em profundidade ou impacto menor |

### Score de Confiança

- 0.9–1.0: Caminho de exploit identificado com certeza
- 0.8–0.9: Padrão claro de vulnerabilidade com métodos de exploração conhecidos
- 0.7–0.8: Padrão suspeito que requer condições específicas
- Abaixo de 0.7: Não reportar (especulativo demais)

---

## Filtragem de Falsos Positivos

### Exclusões Obrigatórias — NÃO reportar

1. Denial of Service (DoS) ou exaustão de recursos
2. Secrets armazenados em disco se protegidos por outros mecanismos
3. Rate limiting ou sobrecarga de serviço
4. Consumo de memória ou CPU
5. Falta de validação em campos sem impacto de segurança comprovado
6. Sanitização em workflows de GitHub Actions sem input não-confiável claro
7. Falta de medidas de hardening sem vulnerabilidade concreta
8. Race conditions teóricas (só reportar se concretamente problemáticas)
9. Bibliotecas terceiras desatualizadas (gerenciadas separadamente)
10. Memory safety em linguagens memory-safe (Rust, Go, etc.)
11. Arquivos de teste unitário ou usados apenas em testes
12. Log spoofing (output não-sanitizado em logs não é vulnerabilidade)
13. SSRF que só controla o path (só reportar se controla host ou protocolo)
14. Conteúdo controlado pelo usuário em prompts de IA
15. Regex injection e Regex DoS
16. Documentação insegura (não reportar findings em arquivos markdown)
17. Falta de audit logs

### Precedentes — Considerar

1. Logging de secrets de alto valor em plaintext É vulnerabilidade. Logging de URLs é seguro
2. UUIDs são considerados não-adivinháveis
3. Variáveis de ambiente e flags CLI são valores confiáveis
4. Vazamento de recursos (memória, file descriptors) não é válido
5. Vulnerabilidades web sutis (tabnabbing, XS-Leaks, prototype pollution, open redirect) só reportar se alta confiança
6. React e Angular são seguros contra XSS por padrão. Só reportar se usa `dangerouslySetInnerHTML`, `bypassSecurityTrustHtml` ou similares
7. Vulnerabilidades em GitHub Actions geralmente não são exploráveis na prática
8. Falta de permissão ou autenticação em código client-side não é vulnerabilidade (o backend é responsável)
9. Findings MEDIUM só se forem óbvios e concretos
10. Vulnerabilidades em notebooks (.ipynb) geralmente não são exploráveis na prática
11. Logging de dados não-PII não é vulnerabilidade, mesmo se sensíveis. Só reportar se expõe secrets, senhas ou PII
12. Command injection em shell scripts geralmente não é explorável (só reportar com path claro de input não-confiável)

---

## Formato do Relatório

```markdown
# Security Review Report

## Resumo
- Total de findings: N
- HIGH: N | MEDIUM: N | LOW: N
- Status: APROVADO / REQUER CORREÇÃO

---

## Finding 1: [Categoria]: `arquivo.py:42`

* Severidade: HIGH
* Confiança: 0.9
* Descrição: [o que está vulnerável e por quê]
* Cenário de Exploração: [como um atacante exploraria na prática]
* Correção Recomendada: [o que fazer para corrigir]

---

## Finding N: ...

---

## Conclusão
[Resumo executivo com top 3 ações prioritárias]
```

---

## Exemplo de Uso

```
Aplique a skill descrita em skills/security/security-review.md
Analise o diff do branch atual e gere o Security Review Report.
```

Para revisão de segurança geral (não focada em diff), consulte `agents/reviewers/security-reviewer.md`.

---

## Skills Relacionadas

- `skills/security/owasp-checklist.md` — OWASP Top 10 (checklist defensivo)
- `skills/security/api-hardening.md` — Hardening de endpoints
- `skills/security/penetration-testing.md` — Perspectiva ofensiva (pentest)
- `skills/audit/code-review.md` — Code review geral
- `agents/reviewers/security-reviewer.md` — Agent de revisão de segurança
