Python Patterns

Objetivo: Estruturar projetos Python com boas praticas de ambiente virtual, layout de projeto, qualidade de codigo e seguranca.

---

AMBIENTE VIRTUAL

Sempre criar e ativar ambiente virtual antes de instalar dependencias:

  # Criar
  python3 -m venv .venv

  # Ativar (Linux/macOS)
  source .venv/bin/activate

  # Ativar (Windows)
  .venv\Scripts\activate

  # Desativar
  deactivate

Regras:
- [ ] `.venv/` no `.gitignore`
- [ ] `requirements.txt` com versoes pinadas: `flask==3.0.2`
- [ ] `requirements-dev.txt` para ferramentas de desenvolvimento (pytest, black, ruff)
- [ ] Documentar versao do Python no README e em `.python-version` (pyenv)

pyproject.toml (projetos modernos):
  [project]
  name = "meu-projeto"
  version = "1.0.0"
  requires-python = ">=3.11"
  dependencies = [
    "flask>=3.0,<4.0",
    "sqlalchemy>=2.0,<3.0",
  ]

  [project.optional-dependencies]
  dev = ["pytest", "black", "ruff", "mypy"]

---

LAYOUT DE PROJETO

Pequeno script:
  meu_script.py
  requirements.txt
  tests/

Biblioteca ou servico (src layout):
  src/
  ├── meu_pacote/
  │   ├── __init__.py
  │   ├── main.py
  │   ├── models.py
  │   └── services/
  tests/
  ├── unit/
  └── integration/
  pyproject.toml
  README.md

Por que src layout: evita importar o pacote local nao instalado acidentalmente.

---

FORMATACAO E LINT

Black (formatador):
  pip install black
  black src/ tests/

  # pyproject.toml
  [tool.black]
  line-length = 88
  target-version = ['py311']

Ruff (linter rapido — substitui flake8, isort, pyupgrade):
  pip install ruff
  ruff check src/ tests/
  ruff check --fix src/  # correcao automatica

  # pyproject.toml
  [tool.ruff]
  line-length = 88
  select = ["E", "W", "F", "I", "UP", "B", "S"]  # S = bandit security rules

Mypy (type checker):
  pip install mypy
  mypy src/

  # pyproject.toml
  [tool.mypy]
  python_version = "3.11"
  strict = true
  ignore_missing_imports = true

Pre-commit hook:
  pip install pre-commit
  # .pre-commit-config.yaml
  repos:
    - repo: https://github.com/psf/black
      rev: 24.2.0
      hooks: [{ id: black }]
    - repo: https://github.com/astral-sh/ruff-pre-commit
      rev: v0.3.0
      hooks: [{ id: ruff, args: [--fix] }]

---

TYPE HINTS

Usar type hints em funcoes publicas — melhora IDE, documentacao e detecta bugs:

  from typing import Optional
  from datetime import datetime

  def calcular_pontuacao(
      pontos: float,
      eh_capitao: bool = False,
      posicao: str = 'MED',
  ) -> float:
      ...

  def buscar_usuario(user_id: str) -> Optional[dict]:
      ...  # retorna None se nao encontrado

  # Tipos compostos
  from typing import TypedDict, list

  class Usuario(TypedDict):
      id: str
      email: str
      criado_em: datetime

---

LOGGING

  import logging
  import sys

  def get_logger(name: str) -> logging.Logger:
      logger = logging.getLogger(name)

      if not logger.handlers:
          handler = logging.StreamHandler(sys.stdout)
          handler.setFormatter(logging.Formatter(
              '%(asctime)s %(levelname)s %(name)s %(message)s'
          ))
          logger.addHandler(handler)
          logger.setLevel(logging.INFO)

      return logger

  # Usar com nome do modulo
  logger = get_logger(__name__)
  logger.info('Usuario criado: %s', user_id)  # nao usar f-string (lazy evaluation)
  logger.error('Falha ao processar: %s', exc, exc_info=True)

Regras:
- [ ] Usar `logging` da stdlib, nao `print()`
- [ ] Nao usar f-string no logger (avalia mesmo quando nivel e desligado): usar `%s`
- [ ] `exc_info=True` em `logger.error/critical` para incluir traceback
- [ ] Nivel configuravel via variavel de ambiente (`LOG_LEVEL=DEBUG`)

---

SEGURANCA COM BANDIT

Bandit analisa o codigo em busca de problemas de seguranca:

  pip install bandit
  bandit -r src/ -ll  # apenas medium e high

Problemas comuns que o Bandit detecta:
- `subprocess.call(shell=True)` → injecao de comando
- `hashlib.md5()` → hash fraco
- `random.random()` → nao criptografico
- `assert` para validacao de seguranca → pode ser desabilitado com -O
- `eval()` ou `exec()` com input externo

---

CHECKLIST

- [ ] Ambiente virtual criado e ativado antes de instalar dependencias
- [ ] Dependencias com versoes pinadas em requirements.txt ou pyproject.toml
- [ ] Black formatando (zero diffs apos rodar)
- [ ] Ruff sem warnings (especialmente regras de seguranca `S`)
- [ ] Mypy sem erros (ou com exclusoes justificadas)
- [ ] Type hints em todas as funcoes publicas
- [ ] logging da stdlib no lugar de print()
- [ ] bandit -r src/ -ll passando no CI
