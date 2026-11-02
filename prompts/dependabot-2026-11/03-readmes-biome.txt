style: formata os READMEs com o Biome 2.6

O Biome 2.6 passa a formatar Markdown e o biome ci do bump reprova 14 READMEs. Esta e a saida do biome check --write
com a 2.6.4: virgula final removida nos blocos de codigo dos exemplos (trailingCommas none, o estilo do repositorio)
e a tabela de componentes dos READMEs raiz preenchida ate a celula mais larga. Nenhuma mudanca de texto: com
git diff -w sobram as virgulas e a linha separadora da tabela.

Entra antes do bump porque o Biome 2.5 nao verifica Markdown.
