# BUILD
Mobile

- Inicio (0)
- ⁠Mobile (1)


Desktop
- Inicio (0)
- Pc (1)
- ⁠Pc Reset (2)


# EDITOR
teclas para debug: Y U I O
para debugar cena, iniciar pela cena inicio. 
Se iniciar direto pela cena pc, desativar antes no script HostManager dentro da cena pc, para poder rodar diretamente essa cena.

# OPERAÇÃO

Desktop:
1. ligar o PC na na mesma wifi do mobile na rede 
2. Iniciar o servidor node.js pelo arquivo batch dentro da pasta api
3. Iniciar o executável unity
4. Tela de configurações deixar o campo de IP vazio e Selecionar opção: Servidor
5. Deixar os campos de V e H com 30 e 150, isso irá definir a força dos bullets
6. Salvar
7. Iniciar
8. Apertar a tecla S para entrar no modo tutorial
9. Apertar a tecla S para entrar iniciar o gameplay

Mobile:
1. Mobile e PC tem que estar na mesma rede wifi.
2. na tela de configurações colocar o IP do computador
3. Selecionar o jogador
4. Deixar os campos de V e H com 30 e 150, isso irá definir a força dos bullets
5. Salvar e iniciar.


Warning: 
- Caso apareça um simbolo de não conectato no celular ou no pc é porque alguma coisa não conectou direito.
- É importante fixar o IP do servidor no roteador wifi para que não fique mudando toda vez, pois vai precisar ficar mudando isso manualmente no celular.


# ASSETS
A proporção dos asset deve ser mantida, ou seja:
se uma imagem é 512x512, ela deve ser mantida em uma proporão 1:1, assim pode ser 1024x1024, 20x20, etc, etc...
se uma imagem é 1920x1080 o mesmo fator de proporção deve ser mantido: 16:9
e assim por diante
