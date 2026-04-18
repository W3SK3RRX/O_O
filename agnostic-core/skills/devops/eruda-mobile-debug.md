# Debug Mobile com Eruda em Projetos Vite

Adiciona console de debug mobile a qualquer projeto Vite via plugin.
Permite inspecionar erros, rede e DOM diretamente no dispositivo móvel.

Fonte: padrão extraído do f1-pulse.

---

## O problema

Ferramentas de dev (DevTools) não ficam disponíveis em browsers mobile.
Erros que só ocorrem em mobile ficam invisíveis sem um console alternativo.

---

## Instalação

```bash
npm install --save-dev vite-plugin-eruda
```

## Configuração no vite.config.ts

```ts
import eruda from 'vite-plugin-eruda'

export default defineConfig({
  plugins: [
    eruda({
      // Dev local: sempre ativo
      // Produção: ativar via ?debug=true na URL
      forceEnableInProduction: false,
    }),
  ],
})
```

---

## Uso

| Ambiente | Como ativar |
|---|---|
| Dev local | Automático — ícone Eruda aparece na tela |
| Produção | Adicionar `?debug=true` na URL |

---

## O que o Eruda expõe

- **Console** — logs, warnings, erros
- **Network** — requisições HTTP, status, payloads
- **Elements** — inspeção de DOM
- **Sources** — arquivos carregados
- **Report** (configurável) — copia relatório Markdown para colar no Claude Code

A aba **Report** é especialmente útil: gera um snapshot do estado atual
(erros, network, DOM) em formato Markdown pronto para diagnóstico assistido por IA.

---

## Boas práticas

- Inclua o plugin em todo projeto web com Vite desde o início — custo zero
- Use `?debug=true` em produção apenas para sessões de debug, nunca deixe ativo permanentemente
- Para reportar bug mobile ao Claude Code: abra Eruda → Report → copie e cole na conversa

---

## Ver também

- `skills/devops/observabilidade.md` — observabilidade em produção
- `skills/audit/systematic-debugging.md` — debugging sistemático
- `skills/backend/cdn-asset-validation.md` — debug de assets externos que falham silenciosamente
