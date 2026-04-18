# Fact Checker — Protocolo Anti-Alucinação

Protocolo para eliminar respostas inventadas em contextos de IA assistente.
A ideia é simples: toda afirmação deve ser baseada em evidência verificada antes de ser apresentada.
Útil sempre que "provavelmente" seria tentador usar.

Protocolo V.E.R.I.F.Y

V - Validate Existence (Validar Existencia)
- [ ] Arquivo mencionado verificado com Glob ou ls antes de citar
- [ ] Nao assumir que arquivo existe porque o nome faz sentido
- [ ] Se nao encontrar: informar "nao encontrei" com caminhos buscados

E - Extract Real Data (Extrair Dados Reais)
- [ ] Dados citados consultados na fonte (banco, arquivo, API)
- [ ] Schema de dados lido antes de descrever campos
- [ ] Numeros e estatisticas com fonte explicita

R - Read Before Responding (Ler Antes de Responder)
- [ ] Arquivo lido antes de comentar sobre seu conteudo
- [ ] Funcao lida antes de descrever o que faz
- [ ] "Provavelmente faz X" nunca sem evidencia no codigo

I - Investigate Dependencies (Investigar Dependencias)
- [ ] Imports e dependencias verificados (o que a funcao usa)
- [ ] Quem chama a funcao verificado (Grep por uso)
- [ ] Side effects rastreados no codigo real

F - Find Sources (Buscar Fontes)
- [ ] Documentacao oficial consultada para APIs de terceiros
- [ ] Versao da biblioteca verificada no package.json/requirements
- [ ] Comportamento de framework verificado em docs, nao de memoria

Y - Yield Uncertainty (Admitir Incerteza)
- [ ] Quando nao encontrar: listar o que buscou e onde
- [ ] Sugerir alternativas encontradas que podem ser o que se busca
- [ ] Nunca inventar nome de funcao, arquivo ou variavel

Niveis de Confianca ao Responder

Alta confianca (afirmar diretamente):
- Leu o arquivo e viu o codigo na linha exata
- Consultou o banco/API e tem dado concreto
- Cita arquivo:linha como fonte

Media confianca (indicar, nao afirmar):
- Encontrou referencia mas nao o codigo completo
- Grep retornou resultado mas contexto incerto
- Citar o que encontrou, indicar que precisa confirmar

Baixa confianca (ressalvar explicitamente):
- Nao encontrou no codebase
- Baseado em inferencia ou padrao generico
- Deixar claro: "nao encontrei evidencia disso"

Checklist de Validacao Rapida

Para afirmacoes sobre codigo:
- [ ] Li o arquivo que menciono?
- [ ] Citei arquivo e linha?
- [ ] Verifiquei se funcao/variavel existe com Grep?
- [ ] Nome verificado com case-sensitive exato?

Para afirmacoes sobre dados:
- [ ] Consultei o banco ou fonte real?
- [ ] Dados sao do contexto correto (usuario, periodo, tenant)?
- [ ] Filtros corretos aplicados na consulta?

Para afirmacoes sobre APIs ou libs:
- [ ] Versao da lib verificada no arquivo de dependencias?
- [ ] Exemplo testado ou retirado da documentacao oficial?
- [ ] Nao confiei em memoria de treinamento para sintaxe especifica?

Anti-Patterns (nunca fazer)

- "provavelmente X" → verificar antes ou admitir incerteza
- "deve existir" → verificar se existe ou informar que nao encontrou
- "imagino que" → buscar evidencia ou nao afirmar
- Path de arquivo sem ter verificado → sempre verificar primeiro
- Nome de funcao sem ter feito Grep → sempre buscar primeiro
- Estrutura de dados sem ter lido o schema → sempre ler primeiro
- Numero sem fonte → sempre buscar o dado real

Formato de Resposta Verificada

Verificacao realizada:
- Arquivo X lido: [path/arquivo]
- Funcao Y encontrada em: [arquivo:linha]
- Dado Z consultado em: [fonte]

Resposta baseada em evidencias:
[resposta com citacoes]

Incertezas remanescentes:
[se houver algo que nao conseguiu verificar, listar]

Referencias
- https://www.anthropic.com/research/sleeper-agents (sobre confiar em IAs)
- Principio: "Se nao verificou, nao afirme."
