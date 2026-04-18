Python Scripts

Objetivo: Escrever scripts Python robustos, seguros e operacionalmente confiaveis — com argumentos padronizados, idempotencia e saida previsivel.

---

ESTRUTURA BASICA

  #!/usr/bin/env python3
  """
  Script de sincronizacao de usuarios.
  Sincroniza usuarios do sistema legado para o novo banco.

  Usage:
      python sync_users.py --limit 100 --dry-run
  """

  import argparse
  import logging
  import sys
  from pathlib import Path

  logger = logging.getLogger(__name__)


  def parse_args() -> argparse.Namespace:
      parser = argparse.ArgumentParser(
          description='Sincroniza usuarios do sistema legado.'
      )
      parser.add_argument('--limit', type=int, default=100,
                          help='Numero maximo de usuarios a sincronizar (default: 100)')
      parser.add_argument('--dry-run', action='store_true',
                          help='Simula a operacao sem gravar no banco')
      parser.add_argument('--log-level', default='INFO',
                          choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'])
      return parser.parse_args()


  def setup_logging(level: str) -> None:
      logging.basicConfig(
          level=getattr(logging, level),
          format='%(asctime)s %(levelname)s %(message)s',
          stream=sys.stderr,  # logs no stderr; dados processados no stdout
      )


  def run(args: argparse.Namespace) -> int:
      """Logica principal. Retorna exit code (0 = sucesso)."""
      if args.dry_run:
          logger.info('[DRY RUN] Nenhuma alteracao sera gravada.')

      # ... logica aqui ...

      return 0


  if __name__ == '__main__':
      args = parse_args()
      setup_logging(args.log_level)
      sys.exit(run(args))

---

--dry-run (OBRIGATORIO para scripts destrutivos)

Todo script que grava, deleta ou envia dados deve suportar `--dry-run`:

  def processar_usuario(usuario: dict, dry_run: bool) -> None:
      if dry_run:
          logger.info('[DRY RUN] Gravaria usuario: %s', usuario['email'])
          return

      db.usuarios.insert_one(usuario)
      logger.info('Usuario gravado: %s', usuario['email'])

Regras:
- [ ] `--dry-run` lista o que faria sem executar
- [ ] Output de dry-run e identico ao de execucao real (exceto pelo efeito colateral)
- [ ] Sem `--dry-run`, o script pergunta confirmacao em operacoes destrutivas (ou usa `--force`)

---

IDEMPOTENCIA

Script idempotente pode ser rodado multiplas vezes com o mesmo resultado:

  def sincronizar_usuario(usuario: dict, dry_run: bool) -> str:
      existente = db.usuarios.find_one({'email': usuario['email']})

      if existente:
          logger.debug('Usuario ja existe, pulando: %s', usuario['email'])
          return 'skipped'

      if not dry_run:
          db.usuarios.insert_one(usuario)

      logger.info('Usuario sincronizado: %s', usuario['email'])
      return 'created'

Output do progresso:
  # Resumo ao final
  logger.info('Resultado: %d criados, %d pulados, %d erros', criados, pulados, erros)

---

EXIT CODES

  0 → sucesso
  1 → erro geral (excecao nao tratada)
  2 → erro de argumentos (argparse retorna automaticamente)
  3 → configuracao invalida (env vars ausentes, arquivo nao encontrado)
  4 → dados invalidos ou incompletos

  import sys

  def validar_ambiente() -> None:
      if not os.environ.get('DATABASE_URL'):
          logger.error('DATABASE_URL nao configurada')
          sys.exit(3)

---

LOGS NO STDERR, DADOS NO STDOUT

  # Dados processados → stdout (para pipeline: python script.py | outro_script.py)
  for usuario in usuarios_processados:
      print(json.dumps(usuario))  # stdout

  # Progresso e erros → stderr
  logger.info('Processados: %d/%d', i, total)  # stderr

  # Na CLI:
  python sync_users.py > usuarios.jsonl 2> sync.log

---

TRATAMENTO DE ERROS

  def processar_batch(usuarios: list) -> tuple[int, int]:
      sucesso, falha = 0, 0

      for usuario in usuarios:
          try:
              processar_usuario(usuario)
              sucesso += 1
          except ValueError as e:
              logger.warning('Dado invalido para %s: %s', usuario.get('email'), e)
              falha += 1
          except Exception as e:
              logger.error('Erro inesperado para %s: %s', usuario.get('email'), e, exc_info=True)
              falha += 1

      return sucesso, falha

Regras:
- [ ] Erros em um item nao interrompem o batch (catch por item)
- [ ] Erros fatais (conexao DB, arquivo nao encontrado) interrompem com exit code adequado
- [ ] Resumo de erros ao final: N sucessos, M falhas

---

BARRA DE PROGRESSO E ESTIMATIVA

Para scripts que processam grandes volumes:

  from tqdm import tqdm  # pip install tqdm

  for usuario in tqdm(usuarios, desc='Sincronizando', unit='usuario'):
      processar_usuario(usuario)

Alternativa sem dependencia:
  total = len(usuarios)
  for i, usuario in enumerate(usuarios, 1):
      if i % 100 == 0 or i == total:
          logger.info('Progresso: %d/%d (%.0f%%)', i, total, i/total*100)
      processar_usuario(usuario)

---

CHECKLIST

- [ ] `if __name__ == '__main__'` no final
- [ ] `argparse` com `--help` funcional e descricoes uteis
- [ ] `--dry-run` para qualquer script que grava ou deleta
- [ ] Idempotente: rodar duas vezes = mesmo resultado
- [ ] Logs no stderr, dados no stdout
- [ ] Exit code explicito (0 = ok, >0 = erro)
- [ ] Resumo de resultado ao final (N processados, M erros)
- [ ] Sem credenciais ou secrets no codigo — usar variaveis de ambiente
