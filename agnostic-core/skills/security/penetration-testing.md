Teste de Penetracao

Metodologia de pentest para avaliar seguranca de aplicacoes do ponto de vista ofensivo.

Adaptado do antigravity-kit (MIT). Fonte: https://github.com/vudovn/antigravity-kit

---

FILOSOFIA

"Pense como um atacante. Encontre fraquezas antes dos maliciosos."

Teste de penetracao complementa a seguranca defensiva (OWASP checklist, API hardening)
com a perspectiva de quem tenta quebrar. Entender ataques melhora a defesa.

IMPORTANTE: pentest so deve ser realizado com autorizacao escrita e escopo definido.

---

METODOLOGIA PTES (7 FASES)

1. Pre-engagement
   - Definir escopo (quais sistemas, quais testes permitidos)
   - Obter autorizacao escrita
   - Definir regras de engajamento (horarios, sistemas fora de escopo)
   - Estabelecer canais de comunicacao para vulnerabilidades criticas

2. Reconhecimento
   - Passivo: DNS records, WHOIS, subdominios, tecnologias (Wappalyzer)
   - Ativo: port scanning, service enumeration, directory brute-force
   - OSINT: informacoes publicas, GitHub leaks, pastes

3. Modelagem de ameacas
   - Identificar ativos criticos (dados sensiveis, funcionalidades core)
   - Mapear superficie de ataque (endpoints, inputs, autenticacao)
   - Priorizar por impacto de negocio

4. Analise de vulnerabilidades
   - Automatizada: scanners (Burp Suite, OWASP ZAP, Nuclei)
   - Manual: revisao de logica de negocio, access control, injection points
   - Correlacionar findings com contexto da aplicacao

5. Exploracao
   - Validar vulnerabilidades encontradas (proof of concept)
   - Documentar cada passo para reproducao
   - Minimo impacto: nao destruir dados, nao causar indisponibilidade

6. Pos-exploracao
   - Avaliar impacto real: que dados foram acessados? que acoes foram possiveis?
   - Persistencia: seria possivel manter acesso? (documentar, nao implementar)
   - Movimentacao lateral: outros sistemas acessiveis a partir deste?

7. Relatorio
   - Sumario executivo (para gestao)
   - Detalhes tecnicos (para equipe de desenvolvimento)
   - Priorizacao por severidade e acoes de remediacao

---

OWASP TOP 10 — PERSPECTIVA OFENSIVA

  A01: Broken Access Control
    Testes: IDOR (trocar IDs), escalacao de privilegio, acesso direto a URLs admin
    Exemplo: /api/users/123 → trocar para /api/users/124 e ver dados de outro usuario

  A02: Cryptographic Failures
    Testes: dados sensiveis em transito (HTTP), hashes fracos, tokens previsiveis
    Exemplo: JWT sem validacao de assinatura, MD5 para passwords

  A03: Injection
    Testes: SQL injection, XSS, command injection, template injection
    Exemplo: input com ' OR 1=1-- em campos de busca ou login

  A04: Insecure Design
    Testes: logica de negocio (comprar por preco negativo, bypassar steps de checkout)
    Exemplo: alterar quantidade para -1 no carrinho para obter credito

  A05: Security Misconfiguration
    Testes: headers ausentes, debug mode em producao, directory listing, default credentials
    Exemplo: /debug, /admin com senha admin/admin, stack traces expostos

  A06: Vulnerable Components
    Testes: bibliotecas com CVEs conhecidos (npm audit, Snyk)
    Exemplo: versao antiga de jQuery com XSS conhecido

  A07: Authentication Failures
    Testes: brute force, credential stuffing, session fixation, password reset flow
    Exemplo: nao tem rate limiting no /login, permite tentativas infinitas

  A08: Software and Data Integrity
    Testes: desserializacao insegura, CDN sem SRI, pipelines CI/CD manipulaveis
    Exemplo: <script src="cdn.example.com/lib.js"> sem integrity hash

  A09: Logging and Monitoring Failures
    Testes: acoes criticas sem log, logs com dados sensiveis, sem alerta de brute force
    Exemplo: 1000 tentativas de login falhas sem alerta

  A10: SSRF (Server-Side Request Forgery)
    Testes: inputs que geram requests no servidor (URL de avatar, webhook, import)
    Exemplo: input de URL com http://169.254.169.254 para acessar metadados cloud

---

PRIORIZACAO DE VULNERABILIDADES

Severidade baseada em:
  Explorabilidade → quao facil e explorar? (sem autenticacao vs autenticado vs rede interna)
  Impacto → o que um atacante consegue? (dados, controle, indisponibilidade)
  Criticidade do ativo → quao importante e o sistema afetado?
  Detectabilidade → e facil detectar a exploracao?

Classificacao:
  CRITICA → relatar imediatamente; risco de comprometimento total
  ALTA    → relatar no mesmo dia; dados sensiveis em risco
  MEDIA   → relatar na semana; impacto limitado ou mitigavel
  BAIXA   → relatar no relatorio final; melhoria recomendada

---

ESTRUTURA DE RELATORIO

  Sumario executivo (1 pagina)
    - Escopo do teste
    - Resumo de findings por severidade
    - Risco geral da aplicacao
    - Top 3 recomendacoes

  Findings detalhados (por vulnerabilidade)
    - Titulo e severidade
    - Descricao do problema
    - Passos de reproducao (proof of concept)
    - Impacto se explorada
    - Remediacao recomendada
    - Referencias (CWE, OWASP)

  Recomendacoes gerais
    - Melhorias de processo (code review, SAST/DAST no CI)
    - Treinamento da equipe
    - Proximos passos

---

LIMITES ETICOS

  - [ ] Autorizacao escrita antes de qualquer teste
  - [ ] Escopo definido e respeitado (nao testar fora do escopo)
  - [ ] Vulnerabilidades criticas relatadas imediatamente
  - [ ] Dados de usuarios reais nunca acessados ou expostos
  - [ ] Nao causar indisponibilidade ou destruicao de dados
  - [ ] Documentar todos os testes realizados

---

SKILLS A CONSULTAR

  skills/security/owasp-checklist.md   OWASP Top 10 (perspectiva defensiva)
  skills/security/api-hardening.md     Hardening de APIs
  agents/reviewers/security-reviewer.md  Revisao de seguranca
