SEO Checklist

Checklist consolidado de SEO tecnico, conteudo, Core Web Vitals e otimizacao para IA generativa.

Adaptado do antigravity-kit (MIT). Fonte: https://github.com/vudovn/antigravity-kit

---

CORE WEB VITALS

  LCP (Largest Contentful Paint) — meta: < 2.5s
    O que mede: tempo ate o maior elemento visivel ser renderizado
    Acoes:
      - [ ] Otimizar imagem LCP (WebP/AVIF, preload, srcset)
      - [ ] font-display: swap para fontes customizadas
      - [ ] Reduzir CSS blocking (inline critical CSS)
      - [ ] Server response time < 200ms (TTFB)

  INP (Interaction to Next Paint) — meta: < 200ms
    O que mede: latencia entre interacao do usuario e resposta visual
    Acoes:
      - [ ] Code splitting (carregar JS sob demanda)
      - [ ] Defer scripts nao-criticos
      - [ ] Evitar long tasks no main thread (> 50ms)
      - [ ] Simplificar DOM (menos nos = layout mais rapido)

  CLS (Cumulative Layout Shift) — meta: < 0.1
    O que mede: mudancas inesperadas de layout durante carregamento
    Acoes:
      - [ ] width/height explicito em imagens e videos
      - [ ] Reservar espaco para ads e embeds
      - [ ] font-display: optional para fontes que causam reflow
      - [ ] Nao inserir conteudo acima do fold apos load

---

SEO TECNICO

  Rastreabilidade
    - [ ] sitemap.xml gerado e atualizado automaticamente
    - [ ] robots.txt configurado (nao bloquear conteudo importante)
    - [ ] URLs canonicas (rel="canonical") em todas as paginas
    - [ ] Sem redirect chains (maximo 1 redirect)
    - [ ] Sem paginas orfas (toda pagina acessivel via link interno)

  Indexabilidade
    - [ ] HTTPS em todo o site
    - [ ] Mobile-friendly (viewport meta, responsive design)
    - [ ] Status 200 em paginas importantes (sem 404, 500)
    - [ ] Hreflang para conteudo multi-idioma
    - [ ] Sem conteudo duplicado (canonicals corretos)
    - [ ] Clean URLs (sem query params desnecessarios)

  Velocidade
    - [ ] Core Web Vitals dentro dos thresholds acima
    - [ ] Imagens: WebP/AVIF, lazy loading, srcset responsivo
    - [ ] CSS/JS: minificados, comprimidos (gzip/brotli)
    - [ ] CDN para assets estaticos
    - [ ] Preconnect para origens de terceiros criticas

---

SEO DE CONTEUDO

  Estrutura da pagina
    - [ ] Um unico H1 por pagina
    - [ ] Hierarquia H1 > H2 > H3 (sem pular niveis)
    - [ ] Title tag: 50-60 caracteres, keyword principal no inicio
    - [ ] Meta description: 150-160 caracteres, com call-to-action
    - [ ] URL slug descritivo e curto (/produto/camiseta-azul, nao /p?id=847)

  Imagens
    - [ ] Alt text descritivo em todas as imagens
    - [ ] Nomes de arquivo descritivos (camiseta-azul.webp, nao IMG_3847.jpg)
    - [ ] Dimensoes explicitas (width/height) para evitar CLS

  Links internos
    - [ ] Links para conteudo relacionado em cada pagina
    - [ ] Anchor text descritivo (nao "clique aqui" ou "saiba mais")
    - [ ] Breadcrumbs com schema markup

---

SCHEMA MARKUP (JSON-LD)

Tipos com maior impacto em rich snippets:

  Article         → posts, noticias, artigos tecnicos
  Organization    → dados da empresa (logo, social, contato)
  FAQPage         → perguntas frequentes (aparece expandido no Google)
  Product         → e-commerce (preco, disponibilidade, reviews)
  BreadcrumbList  → navegacao (melhora CTR no SERP)
  HowTo           → tutoriais passo-a-passo
  LocalBusiness   → negocios com endereco fisico

Onde colocar: <script type="application/ld+json"> no <head>.
Validar: Google Rich Results Test ou Schema.org Validator.

---

E-E-A-T (EXPERIENCE, EXPERTISE, AUTHORITATIVENESS, TRUSTWORTHINESS)

  Experience → conteudo baseado em experiencia real (case studies, exemplos)
  Expertise → credenciais do autor visiveis, profundidade tecnica
  Authoritativeness → backlinks de sites respeitados, mencoes no setor
  Trustworthiness → HTTPS, politica de privacidade, contato claro, conteudo atualizado

---

GEO (GENERATIVE ENGINE OPTIMIZATION)

Otimizacao para respostas de IA generativa (ChatGPT, Gemini, Perplexity):

  - [ ] FAQ sections com perguntas naturais e respostas diretas
  - [ ] Credenciais do autor visiveis na pagina
  - [ ] Estatisticas com fonte citada ("segundo [fonte], [dado]")
  - [ ] Definicoes claras no inicio de secoes
  - [ ] Timestamps atualizados (IA prioriza conteudo recente)
  - [ ] Estrutura: H2/H3 como perguntas, paragrafo como resposta

---

FERRAMENTAS DE MEDICAO

  Google Search Console → desempenho de busca, erros de indexacao
  PageSpeed Insights    → Core Web Vitals com dados de campo (CrUX)
  Lighthouse            → auditoria local (performance, SEO, acessibilidade)
  Schema Validator      → validar JSON-LD markup
  Ahrefs / Semrush      → backlinks, keywords, competidores

---

SKILLS A CONSULTAR

  skills/frontend/accessibility.md        Acessibilidade (complementa SEO)
  skills/frontend/html-css-audit.md       Semantica HTML
  skills/performance/performance-audit.md Performance e Core Web Vitals
  agents/specialists/seo-specialist.md    Agent de SEO
