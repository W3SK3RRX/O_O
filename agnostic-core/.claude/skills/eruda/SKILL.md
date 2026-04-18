---
name: eruda
description: Inject Eruda mobile DevTools with Debug Report plugin into any web project. Use when the user wants mobile debugging, DevTools on phone/tablet, debug report for Claude Code, or mentions Eruda. Works with Vite (React, Vue, Svelte), Next.js, plain HTML, Django, Flask, PHP, or any web stack.
---

# Eruda Debug Report — Mobile DevTools + Claude Code Pipeline

Injects Eruda mobile DevTools with a custom "Report" tab for generating Markdown debug reports optimized for pasting into Claude Code conversations.

## Behavior

- **Dev server** (`vite dev`): Eruda loads automatically
- **Production builds**: Eruda loads only when URL has `?debug=true`
- **Zero overhead**: Without the flag, CDN is never fetched

## What the plugin does

1. **Intercepts** console.log/warn/error/info from page load
2. **Captures** unhandled errors and promise rejections
3. **Captures** resource load failures (img, script, link) via capture phase
4. **Registers** a custom Eruda "Report" tab with a copy button
5. **Generates** a Markdown report with: URL, device, viewport, errors, warnings, logs
6. **Copies** to clipboard for pasting into Claude Code

## Instructions for Vite Projects

### Step 1: Read the project's vite.config.ts (or .js, .mjs)

Identify where plugins: [...] is defined and whether Eruda is already injected.
If Eruda is already present, inform the user and stop.

### Step 2: Add the plugin

Add this import at the top (after existing imports):

```ts
import type { Plugin } from 'vite'
```

Then add this function BEFORE export default defineConfig(...):

```ts
function erudaPlugin(): Plugin {
  return {
    name: 'inject-eruda',
    transformIndexHtml(html, ctx) {
      const isDev = ctx.server != null
      return html.replace(
        '</body>',
        `<script>
    (function() {
      var isDev = ${isDev};
      if (!(isDev || new URLSearchParams(location.search).has('debug'))) return;
      var _logs = [];
      var _origConsole = {};
      ['log','warn','error','info'].forEach(function(type) {
        _origConsole[type] = console[type];
        console[type] = function() {
          var args = Array.prototype.slice.call(arguments);
          _logs.push({
            type: type,
            time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit',second:'2-digit'}),
            msg: args.map(function(a) {
              if (a instanceof Error) return a.stack || a.message;
              if (typeof a === 'object') { try { return JSON.stringify(a, null, 2); } catch(e) { return String(a); } }
              return String(a);
            }).join(' ')
          });
          _origConsole[type].apply(console, arguments);
        };
      });
      window.addEventListener('error', function(e) {
        _logs.push({ type: 'error', time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit',second:'2-digit'}), msg: (e.error && e.error.stack) || e.message || 'Unknown error' });
      });
      window.addEventListener('unhandledrejection', function(e) {
        var reason = e.reason;
        _logs.push({ type: 'error', time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit',second:'2-digit'}), msg: (reason && reason.stack) || String(reason) || 'Unhandled promise rejection' });
      });
      // Capture resource load failures (img, script, link) — capture phase
      window.addEventListener('error', function(e) {
        var t = e.target;
        if (t && t !== window && (t.tagName === 'IMG' || t.tagName === 'SCRIPT' || t.tagName === 'LINK')) {
          _logs.push({ type: 'warn', time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit',second:'2-digit'}), msg: '[Resource] Failed to load ' + t.tagName + ': ' + (t.src || t.href || 'unknown') });
        }
      }, true);
      function buildReport() {
        var now = new Date();
        var ua = navigator.userAgent;
        var device = /iPhone/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /iPad/.test(ua) ? 'iPad' : 'Desktop';
        var browser = /Chrome\\/([\\d.]+)/.test(ua) ? 'Chrome ' + RegExp.$1 : /Safari\\/([\\d.]+)/.test(ua) ? 'Safari' : /Firefox\\/([\\d.]+)/.test(ua) ? 'Firefox ' + RegExp.$1 : 'Unknown';
        var errors = _logs.filter(function(l) { return l.type === 'error'; });
        var warnings = _logs.filter(function(l) { return l.type === 'warn'; });
        var infos = _logs.filter(function(l) { return l.type === 'log' || l.type === 'info'; });
        var lines = [];
        lines.push('## Debug Report');
        lines.push('**URL:** ' + location.href);
        lines.push('**Data:** ' + now.toLocaleString('pt-BR'));
        lines.push('**Device:** ' + device + ' / ' + browser);
        lines.push('**Viewport:** ' + window.innerWidth + 'x' + window.innerHeight);
        lines.push('');
        if (errors.length) { lines.push('### Errors (' + errors.length + ')'); lines.push('\`\`\`'); errors.forEach(function(l) { lines.push('[' + l.time + '] ERROR: ' + l.msg); }); lines.push('\`\`\`'); lines.push(''); }
        if (warnings.length) { lines.push('### Warnings (' + warnings.length + ')'); lines.push('\`\`\`'); warnings.forEach(function(l) { lines.push('[' + l.time + '] WARN: ' + l.msg); }); lines.push('\`\`\`'); lines.push(''); }
        if (infos.length) { lines.push('### Logs (' + infos.length + ')'); lines.push('\`\`\`'); infos.slice(-30).forEach(function(l) { lines.push('[' + l.time + '] LOG: ' + l.msg); }); if (infos.length > 30) lines.push('... (' + (infos.length - 30) + ' logs anteriores omitidos)'); lines.push('\`\`\`'); }
        if (!errors.length && !warnings.length && !infos.length) { lines.push('_Nenhum log capturado._'); }
        return lines.join('\\n');
      }
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/eruda';
      s.onload = function() {
        eruda.init();
        eruda.add({
          name: 'Report',
          init: function($el) {
            this._$el = $el;
            $el.html(
              '<div style="padding:16px;">' +
              '<h2 style="color:#fff;font-size:16px;margin:0 0 8px;">Debug Report</h2>' +
              '<p style="color:#999;font-size:12px;margin:0 0 16px;">Gera relat\\u00f3rio Markdown para colar no Claude Code.</p>' +
              '<button id="eruda-copy-report" style="width:100%;padding:12px;border:none;border-radius:8px;background:#E10600;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">\\uD83D\\uDCCB Copiar Relat\\u00f3rio</button>' +
              '<pre id="eruda-report-preview" style="margin-top:16px;padding:12px;background:#1a1a1a;border-radius:8px;color:#ccc;font-size:10px;white-space:pre-wrap;word-break:break-all;max-height:300px;overflow:auto;display:none;"></pre>' +
              '</div>'
            );
            var btn = document.getElementById('eruda-copy-report');
            var preview = document.getElementById('eruda-report-preview');
            btn.addEventListener('click', function() {
              var report = buildReport();
              preview.textContent = report;
              preview.style.display = 'block';
              navigator.clipboard.writeText(report).then(function() {
                btn.textContent = '\\u2713 Copiado!'; btn.style.background = '#22C55E';
                setTimeout(function() { btn.textContent = '\\uD83D\\uDCCB Copiar Relat\\u00f3rio'; btn.style.background = '#E10600'; }, 2000);
              }).catch(function() {
                var range = document.createRange(); range.selectNodeContents(preview);
                var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
                btn.textContent = 'Texto selecionado — copie manualmente'; btn.style.background = '#F59E0B';
                setTimeout(function() { btn.textContent = '\\uD83D\\uDCCB Copiar Relat\\u00f3rio'; btn.style.background = '#E10600'; }, 3000);
              });
            });
          },
          show: function() { this._$el.show(); },
          hide: function() { this._$el.hide(); },
          destroy: function() {}
        });
      };
      document.body.appendChild(s);
    })();
    </script>
    </body>`,
      )
    },
  }
}
```

### Step 3: Register the plugin

Add erudaPlugin() to the plugins array:

```ts
plugins: [react(), erudaPlugin()],  // or vue(), svelte(), etc.
```

### Step 4: Verify

Run `npm run build` to confirm the build succeeds.

## Non-Vite Projects (HTML, Next.js, Django, Flask, PHP, etc.)

Para projetos sem Vite, adicionar o script completo (com captura de logs + Report plugin) direto antes do `</body>` no HTML principal.

### Step 1: Identify the main HTML file

- Plain HTML: `index.html`
- Next.js: `pages/_document.tsx` ou `app/layout.tsx` (usar componente Script)
- Django: `templates/base.html`
- Flask/Jinja: `templates/layout.html`
- PHP: layout principal

### Step 2: Add the script

Add this script block right before `</body>`:

```html
<script>
(function() {
  if (!(new URLSearchParams(location.search).has('debug'))) return;
  var _logs = [];
  var _origConsole = {};
  ['log','warn','error','info'].forEach(function(type) {
    _origConsole[type] = console[type];
    console[type] = function() {
      var args = Array.prototype.slice.call(arguments);
      _logs.push({
        type: type,
        time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit',second:'2-digit'}),
        msg: args.map(function(a) {
          if (a instanceof Error) return a.stack || a.message;
          if (typeof a === 'object') { try { return JSON.stringify(a, null, 2); } catch(e) { return String(a); } }
          return String(a);
        }).join(' ')
      });
      _origConsole[type].apply(console, arguments);
    };
  });
  window.addEventListener('error', function(e) {
    _logs.push({ type: 'error', time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit',second:'2-digit'}), msg: (e.error && e.error.stack) || e.message || 'Unknown error' });
  });
  window.addEventListener('unhandledrejection', function(e) {
    var reason = e.reason;
    _logs.push({ type: 'error', time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit',second:'2-digit'}), msg: (reason && reason.stack) || String(reason) || 'Unhandled promise rejection' });
  });
  // Capture resource load failures (img, script, link) — capture phase
  window.addEventListener('error', function(e) {
    var t = e.target;
    if (t && t !== window && (t.tagName === 'IMG' || t.tagName === 'SCRIPT' || t.tagName === 'LINK')) {
      _logs.push({ type: 'warn', time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit',second:'2-digit'}), msg: '[Resource] Failed to load ' + t.tagName + ': ' + (t.src || t.href || 'unknown') });
    }
  }, true);
  function buildReport() {
    var now = new Date();
    var ua = navigator.userAgent;
    var device = /iPhone/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /iPad/.test(ua) ? 'iPad' : 'Desktop';
    var browser = /Chrome\/([\\d.]+)/.test(ua) ? 'Chrome ' + RegExp.$1 : /Safari\/([\\d.]+)/.test(ua) ? 'Safari' : /Firefox\/([\\d.]+)/.test(ua) ? 'Firefox ' + RegExp.$1 : 'Unknown';
    var errors = _logs.filter(function(l) { return l.type === 'error'; });
    var warnings = _logs.filter(function(l) { return l.type === 'warn'; });
    var infos = _logs.filter(function(l) { return l.type === 'log' || l.type === 'info'; });
    var lines = [];
    lines.push('## Debug Report');
    lines.push('**URL:** ' + location.href);
    lines.push('**Data:** ' + now.toLocaleString('pt-BR'));
    lines.push('**Device:** ' + device + ' / ' + browser);
    lines.push('**Viewport:** ' + window.innerWidth + 'x' + window.innerHeight);
    lines.push('');
    if (errors.length) { lines.push('### Errors (' + errors.length + ')'); lines.push('```'); errors.forEach(function(l) { lines.push('[' + l.time + '] ERROR: ' + l.msg); }); lines.push('```'); lines.push(''); }
    if (warnings.length) { lines.push('### Warnings (' + warnings.length + ')'); lines.push('```'); warnings.forEach(function(l) { lines.push('[' + l.time + '] WARN: ' + l.msg); }); lines.push('```'); lines.push(''); }
    if (infos.length) { lines.push('### Logs (' + infos.length + ')'); lines.push('```'); infos.slice(-30).forEach(function(l) { lines.push('[' + l.time + '] LOG: ' + l.msg); }); if (infos.length > 30) lines.push('... (' + (infos.length - 30) + ' logs anteriores omitidos)'); lines.push('```'); }
    if (!errors.length && !warnings.length && !infos.length) { lines.push('_Nenhum log capturado._'); }
    return lines.join('\\n');
  }
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/eruda';
  s.onload = function() {
    eruda.init();
    eruda.add({
      name: 'Report',
      init: function($el) {
        this._$el = $el;
        $el.html(
          '<div style="padding:16px;">' +
          '<h2 style="color:#fff;font-size:16px;margin:0 0 8px;">Debug Report</h2>' +
          '<p style="color:#999;font-size:12px;margin:0 0 16px;">Gera relat\u00f3rio Markdown para colar no Claude Code.</p>' +
          '<button id="eruda-copy-report" style="width:100%;padding:12px;border:none;border-radius:8px;background:#E10600;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">\uD83D\uDCCB Copiar Relat\u00f3rio</button>' +
          '<pre id="eruda-report-preview" style="margin-top:16px;padding:12px;background:#1a1a1a;border-radius:8px;color:#ccc;font-size:10px;white-space:pre-wrap;word-break:break-all;max-height:300px;overflow:auto;display:none;"></pre>' +
          '</div>'
        );
        var btn = document.getElementById('eruda-copy-report');
        var preview = document.getElementById('eruda-report-preview');
        btn.addEventListener('click', function() {
          var report = buildReport();
          preview.textContent = report;
          preview.style.display = 'block';
          navigator.clipboard.writeText(report).then(function() {
            btn.textContent = '\u2713 Copiado!'; btn.style.background = '#22C55E';
            setTimeout(function() { btn.textContent = '\uD83D\uDCCB Copiar Relat\u00f3rio'; btn.style.background = '#E10600'; }, 2000);
          }).catch(function() {
            var range = document.createRange(); range.selectNodeContents(preview);
            var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
            btn.textContent = 'Texto selecionado — copie manualmente'; btn.style.background = '#F59E0B';
            setTimeout(function() { btn.textContent = '\uD83D\uDCCB Copiar Relat\u00f3rio'; btn.style.background = '#E10600'; }, 3000);
          });
        });
      },
      show: function() { this._$el.show(); },
      hide: function() { this._$el.hide(); },
      destroy: function() {}
    });
  };
  document.body.appendChild(s);
})();
</script>
```

### Step 3: Verify

Open the page with `?debug=true` in the URL to confirm Eruda loads and the Report tab works.

## Compatibility

Funciona com qualquer projeto web que serve HTML.
