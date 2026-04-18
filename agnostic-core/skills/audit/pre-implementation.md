# Pré-Implementação

Perguntas úteis para fazer antes de escrever código novo. Ajudam a evitar os problemas
mais comuns: overengineering, duplicação, reinvenção da roda e arquivos monolíticos.
Vale consultar ao receber uma tarefa de implementação ou quando a solução parece complexa demais.

Os 5 Problemas a Verificar

1 - Simplicidade (Anti-Overengineering)
- [ ] Existe uma solucao mais simples que resolve o mesmo problema?
- [ ] Estou criando abstracao para um unico caso de uso?
- [ ] A solucao e proporcional a complexidade do problema?
- [ ] Posso resolver com menos de 30 linhas usando o que ja existe?

2 - Reutilizacao (Sem Duplicacao)
- [ ] Busquei no projeto se funcao similar ja existe (Grep por nome/comportamento)
- [ ] Verifiquei se o modulo/utilitario ja resolve isso
- [ ] Encontrei codigo identico copiado de outro lugar no projeto?
- [ ] Se existe: estender/reusar em vez de duplicar

3 - Documentacao (Nao Reinventar a Roda)
- [ ] Consultei documentacao oficial da linguagem/framework antes de implementar
- [ ] Verifiquei se existe metodo nativo que faz o mesmo
- [ ] Confirmei que a biblioteca ja instalada nao resolve isso
- [ ] Versao da lib verificada (nao usar sintaxe de versao desatualizada)

4 - Modularidade (Sem Monolitos)
- [ ] Arquivo alvo tem menos de 300 linhas? (acima disso: considerar split)
- [ ] A funcao tem responsabilidade unica e clara?
- [ ] Estou misturando responsabilidades (ex: query + logica de negocio + resposta HTTP)?
- [ ] A funcao pode ser testada de forma isolada?

5 - Impacto (Sem Efeitos Colaterais)
- [ ] Identifiquei todos os arquivos que usam o que vou modificar (Grep)
- [ ] Mudanca quebra alguma funcionalidade existente?
- [ ] Testes existentes cobrem o que vou alterar?
- [ ] Existe rollback simples se der errado?

Checklist de Verificacao Antes de Criar Arquivo Novo
- [ ] Existe arquivo existente que poderia receber esse codigo?
- [ ] O novo arquivo tem nome em kebab-case e localizado no diretorio correto?
- [ ] Ha pelo menos um teste cobrindo o novo codigo?
- [ ] Dependencias necessarias ja estao instaladas (sem adicionar sem necessidade)?

## Padrões que pedem uma pausa
- "Vou criar uma classe base generica para..." → pode ser overengineering
- "Vou copiar esse bloco aqui e ajustar..." → duplicacao, extrair funcao
- "Acho que a sintaxe e assim..." → verificar documentacao primeiro
- "Esse arquivo esta ficando grande, vou colocar tudo aqui..." → avaliar split
- "Funciona, vou deixar o teste pra depois..." → testes agora, nao depois

## Comandos rápidos de verificação
- Buscar funcao similar: grep -rn "nomeFuncao\|comportamento" src/
- Ver tamanho do arquivo alvo: wc -l arquivo.js
- Verificar quem usa o que vou alterar: grep -rn "nomeDoQueVouAlterar" .
- Checar lib nativa: documentacao da linguagem/framework

Referencias
- https://martinfowler.com/bliki/Yagni.html (YAGNI - You Ain't Gonna Need It)
- https://en.wikipedia.org/wiki/Don%27t_repeat_yourself (DRY)
- https://en.wikipedia.org/wiki/Single-responsibility_principle (SRP)
