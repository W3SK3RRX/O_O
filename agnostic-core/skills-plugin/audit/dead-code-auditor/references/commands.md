# Dead Code Auditor — Commands by Phase

## Phase 1 — Unused npm dependencies

### Option A: depcheck (recommended, zero-config)

```bash
npx depcheck --ignores="@types/*,eslint-*" 2>/dev/null
```

Outputs: unused dependencies, unused devDependencies, missing dependencies.

### Option B: knip (modern, catches more)

```bash
npx knip 2>/dev/null
```

Catches unused exports, files, and deps in one pass (TypeScript-aware).

### Manual cross-check

```bash
# List all deps in package.json
node -e "const p=require('./package.json'); console.log([...Object.keys(p.dependencies||{}), ...Object.keys(p.devDependencies||{})].join('\n'))" \
  | while read pkg; do
      count=$(grep -r "$pkg" --include="*.{js,ts,mjs,cjs,jsx,tsx}" -l 2>/dev/null | grep -v node_modules | wc -l)
      echo "$count $pkg"
    done | sort -n | head -20
```

Packages with `0` or `1` file references deserve closer inspection.

---

## Phase 2 — Unreferenced files

### Find JS/TS files never imported by anyone

```bash
# List all source files
find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.mjs" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/build/*" \
  > /tmp/all_files.txt

# For each file, check if its basename is imported anywhere
while IFS= read -r file; do
  base=$(basename "$file" | sed 's/\.[^.]*$//')
  refs=$(grep -r "$base" --include="*.{js,ts,mjs,cjs,jsx,tsx}" \
    --exclude-dir=node_modules --exclude-dir=.git -l 2>/dev/null | grep -v "^$file$" | wc -l)
  if [ "$refs" -eq 0 ]; then
    echo "ORPHAN: $file"
  fi
done < /tmp/all_files.txt
```

### Option B: unimported (Node-specific)

```bash
npx unimported 2>/dev/null
```

Traces the import graph from the entry point(s) and lists files never reached.

---

## Phase 3 — Dead functions and variables

### ESLint no-unused-vars (JS/TS)

```bash
# Quick scan without modifying project config
npx eslint . --rule '{"no-unused-vars": "warn"}' \
  --ext .js,.ts,.jsx,.tsx \
  --ignore-pattern "node_modules" \
  --format compact 2>/dev/null | grep "no-unused-vars"
```

### TypeScript: ts-unused-exports

```bash
npx ts-unused-exports tsconfig.json 2>/dev/null
```

Reports exported symbols that are never imported elsewhere.

### Manual grep — functions defined but never called

```bash
# Find all function declarations
grep -rn "function \w\+" --include="*.js" --include="*.ts" \
  --exclude-dir=node_modules --exclude-dir=dist . \
  | grep -oP "function \K\w+" | sort | uniq > /tmp/defined_fns.txt

# Check which ones appear more than once (definition + at least one call)
while read fn; do
  count=$(grep -rn "\b$fn\b" --include="*.{js,ts}" \
    --exclude-dir=node_modules --exclude-dir=dist . 2>/dev/null | wc -l)
  if [ "$count" -le 1 ]; then
    echo "POSSIBLY DEAD (only $count refs): $fn"
  fi
done < /tmp/defined_fns.txt
```

---

## Phase 4 — Orphan scripts

### Scripts in package.json referencing non-existent files

```bash
node -e "
const p = require('./package.json');
const scripts = p.scripts || {};
const fs = require('fs');
Object.entries(scripts).forEach(([name, cmd]) => {
  const files = cmd.match(/[\w./\\\\-]+\.(js|ts|sh|py)/g) || [];
  files.forEach(f => {
    if (!fs.existsSync(f)) {
      console.log('MISSING FILE in script [' + name + ']: ' + f);
    }
  });
});
"
```

### Shell/Python scripts never referenced in package.json or other scripts

```bash
find . -type f \( -name "*.sh" -o -name "*.py" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" | while read script; do
  base=$(basename "$script")
  refs=$(grep -r "$base" --include="*.json" --include="*.js" --include="*.ts" --include="*.sh" \
    --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null | grep -v "^$script" | wc -l)
  if [ "$refs" -eq 0 ]; then
    echo "ORPHAN SCRIPT: $script"
  fi
done
```

---

## Phase 5 — Unused CSS classes

### PurgeCSS (framework-agnostic)

```bash
npx purgecss \
  --css "**/*.css" \
  --content "**/*.html" "**/*.js" "**/*.ts" "**/*.jsx" "**/*.tsx" \
  --output /tmp/purged \
  2>/dev/null
```

Compare the output with originals — classes removed = never used.

### Manual grep for class names

```bash
# Extract all class names defined in CSS
grep -rho '\.[a-zA-Z_-][a-zA-Z0-9_-]*' --include="*.css" \
  --exclude-dir=node_modules . | sort | uniq > /tmp/css_classes.txt

# For each class, check if it appears in HTML/JS
while read cls; do
  bare="${cls#.}"  # remove leading dot
  refs=$(grep -r "\"$bare\"\|'$bare'\|class=\"[^\"]*$bare\|className.*$bare" \
    --include="*.html" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" \
    --exclude-dir=node_modules . 2>/dev/null | wc -l)
  if [ "$refs" -eq 0 ]; then
    echo "UNUSED CLASS: $cls"
  fi
done < /tmp/css_classes.txt
```

---

## Phase 6 — Dead routes

### Express.js: routes defined but never called client-side

```bash
# Extract route paths from router files
grep -rn "router\.\(get\|post\|put\|delete\|patch\)\|app\.\(get\|post\|put\|delete\|patch\)" \
  --include="*.js" --include="*.ts" --exclude-dir=node_modules . \
  | grep -oP "(?<=')[^']+(?=')|(?<=\")[^\"]+(?=\")" \
  | grep "^/" | sort | uniq > /tmp/defined_routes.txt

cat /tmp/defined_routes.txt

# Then manually search for each route in client code:
# grep -r "/api/users" --include="*.js" --include="*.ts" --exclude-dir=node_modules .
```

### Routes file vs controllers: find unimplemented handlers

```bash
# Check if route files import controllers that don't exist
grep -rn "require\|import" --include="*.js" --include="*.ts" \
  --exclude-dir=node_modules . \
  | grep -i "controller\|handler" \
  | grep -oP "(?<=')[./\w-]+(?=')|(?<=\")[./\w-]+(?=\")" \
  | while read mod; do
      # Resolve path relative to project root
      if [[ "$mod" == ./* ]] || [[ "$mod" == ../* ]]; then
        for ext in .js .ts ""; do
          [ -f "${mod}${ext}" ] && break
        done
        [ ! -f "${mod}${ext}" ] && echo "MISSING CONTROLLER: $mod"
      fi
    done
```

---

## Phase 7 — Env vars

### Vars in .env not used in code

```bash
# Extract keys from .env
grep -v "^#" .env 2>/dev/null | grep "=" | cut -d= -f1 | sort > /tmp/env_keys.txt

# Check usage in code
while read key; do
  refs=$(grep -rn "\b$key\b" --include="*.js" --include="*.ts" --include="*.mjs" \
    --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null | wc -l)
  if [ "$refs" -eq 0 ]; then
    echo "UNUSED ENV VAR: $key"
  fi
done < /tmp/env_keys.txt
```

### Vars referenced in code but missing from .env

```bash
grep -rn "process\.env\.\w\+" --include="*.js" --include="*.ts" \
  --exclude-dir=node_modules . \
  | grep -oP "(?<=process\.env\.)\w+" | sort | uniq > /tmp/used_env.txt

env_keys=$(grep -v "^#" .env 2>/dev/null | grep "=" | cut -d= -f1)

while read var; do
  if ! echo "$env_keys" | grep -q "^$var$"; then
    echo "MISSING FROM .env: $var"
  fi
done < /tmp/used_env.txt
```
