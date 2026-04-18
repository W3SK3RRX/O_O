# Dead Code Checklist — Patterns by Category

Use this checklist to guide the audit. Check each item that applies to the project.

---

## npm / Package Manager

- [ ] Dependency in `package.json` with zero `require`/`import` references in source
- [ ] devDependency never used in scripts, config files, or build pipeline
- [ ] Package installed in multiple versions (`npm ls <pkg>` shows duplicates)
- [ ] Package replaced by a newer alternative already in the project (e.g., `moment` + `dayjs`)

---

## Files & Modules

- [ ] `.js` / `.ts` file never `import`ed or `require`d by any other file
- [ ] File only imported by other orphan files (transitive orphan)
- [ ] Entry points listed in `package.json#main` or `exports` that don't exist
- [ ] Test file for a module that was deleted
- [ ] Migration file for a table/collection that was dropped
- [ ] Backup / copy files: `file.old.js`, `file_v2.js`, `file-bkp.js`

---

## Functions & Variables

- [ ] Named function declared but never called
- [ ] Arrow function assigned to a variable that's never referenced
- [ ] Class method never called from outside the class
- [ ] Exported function/class with zero imports across the codebase
- [ ] Variable declared with `let`/`const` and never read after assignment
- [ ] Parameter accepted by a function but never used inside it
- [ ] Event listener registered but the event is never emitted

---

## Scripts

- [ ] Shell script (`.sh`) or Python script (`.py`) not referenced in `package.json` or any CI config
- [ ] `package.json` script that calls a file that no longer exists
- [ ] One-off migration script that already ran and was never removed
- [ ] Cron job pointing to a script that was moved or renamed

---

## CSS / Styles

- [ ] CSS class defined in a `.css` file but never used in HTML, JSX, or JS
- [ ] CSS variable (`--my-var`) declared but never consumed
- [ ] `@keyframes` animation defined but never referenced in any `animation` property
- [ ] Media query block that styles classes which no longer exist
- [ ] Entire stylesheet imported in HTML/JS but all its classes are unused
- [ ] Tailwind custom class in `safelist` that no longer appears in templates

---

## API Routes / Endpoints

- [ ] Express/Fastify/Hono route defined but never called from any frontend or integration
- [ ] Route handler function that always returns `501 Not Implemented` or `TODO`
- [ ] Router file imported in `app.js` but the router itself is empty
- [ ] API endpoint duplicated under two paths (one is the old, deprecated path)
- [ ] Middleware applied to a route that no longer exists

---

## Environment Variables

- [ ] `process.env.SOME_VAR` referenced in code but missing from `.env`, `.env.example`, and CI secrets
- [ ] Key in `.env` never accessed anywhere in source code
- [ ] Old service key still in `.env` for a service that was migrated away from
- [ ] Duplicate env vars with slightly different names (`DB_URL` vs `DATABASE_URL`)

---

## Configuration & Build

- [ ] Webpack/Vite alias pointing to a path that was moved or deleted
- [ ] ESLint rule for a pattern that no longer exists in the codebase
- [ ] Jest/Vitest `moduleNameMapper` pointing to a non-existent mock
- [ ] Docker `COPY` instruction for a directory that was removed
- [ ] CI/CD step that runs a command no longer valid (`npm run validate` → script deleted)

---

## Database / ORM

- [ ] Model/schema defined but never queried in the application
- [ ] Index defined on a field never used in a query filter
- [ ] Migration that creates a column never read by any query
- [ ] Seed file for a collection/table that was removed
- [ ] Mongoose/Prisma model with a field that has zero references in business logic

---

## Dynamic usage — Low confidence, flag for human review

These patterns CAN reference code that looks unreferenced — always assign Low confidence and let a human decide:

- `require(variable)` — dynamic CommonJS import resolves at runtime
- `import(expr)` — dynamic ESM import expression resolves at runtime
- Dynamic code execution patterns (runtime string evaluation)
- Plugin systems that auto-discover files by naming convention
- CLI tools that expose all exports as commands automatically
- Exported npm libraries — external consumers are invisible to local grep
