---
name: git-auto-push-hook
description: 'Hook PostToolUse para auto-push apos commit do Claude com backoff exponencial'
---

## Configuração

### 1. Criar o hook

Arquivo: `.claude/hooks/post-tool-use-autopush`

```bash
#!/bin/bash
# Hook PostToolUse — auto-push após git commit do Claude

# Só executa se a tool foi Bash com git commit
if [[ "$CLAUDE_TOOL_NAME" != "Bash" ]]; then
  exit 0
fi

if [[ "$CLAUDE_TOOL_INPUT" != *"git commit"* ]]; then
  exit 0
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
if [[ -z "$BRANCH" || "$BRANCH" == "HEAD" ]]; then
  exit 0
fi

# Retry com backoff exponencial: 4 tentativas (2s, 4s, 8s, 16s)
DELAYS=(2 4 8 16)
for i in "${!DELAYS[@]}"; do
  if git push origin "$BRANCH" 2>/dev/null; then
    echo "✓ Push automático: $BRANCH"
    exit 0
  fi
  echo "⚠ Push falhou, tentativa $((i+2))/4 em ${DELAYS[$i]}s..."
  sleep "${DELAYS[$i]}"
done

echo "✗ Auto-push falhou após 4 tentativas. Faça push manual."
exit 1
```

### 2. Registrar no settings

Arquivo: `.claude/settings.local.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/post-tool-use-autopush"
          }
        ]
      }
    ]
  }
}
```

### 3. Tornar executável

```bash
chmod +x .claude/hooks/post-tool-use-autopush
```

---

## Comportamento esperado

- Após `git commit` pelo Claude → push automático para a branch atual
- Falha de rede → 4 tentativas com espera crescente
- Falha definitiva → mensagem clara, sem silêncio

---

## Quando NÃO usar

- Branches de feature com PRs que exigem review antes do push
- Projetos com CI/CD que dispara deploy no push (verificar antes)
- Repos com branch protection que requer PR

---

## Ver também

- `skills/automacao/automacoes-uteis.md` — outros hooks e automações
- `skills/git/commit-conventions.md` — padrão de commits
- `skills/git/branching-strategy.md` — estratégia de branches

