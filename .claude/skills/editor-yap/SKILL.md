---
name: editor-yap
description: Editor de vídeos "yap" (pessoa falando para a câmera) em que a própria pessoa decide tudo, com Claude propondo. Escreve roteiro personalizado (ganchos, texto, CTA) para ela escolher o que vai falar; transcreve e sugere cortes de silêncios, muletas e takes repetidos; abre uma Mesa de Edição visual onde ela corta palavras e trechos, escolhe estilo, fontes (20 opções), cores, títulos, legendas animadas, stickers, efeitos, música e o que vai postar (legenda do post, hashtags, capa); e renderiza o MP4 com zoom, jump cuts, b-roll e áudio pronto para Reels, TikTok, Shorts ou YouTube. Use sempre que a pessoa quiser editar, cortar, legendar ou "deixar profissional" um vídeo falado, transformar vídeo bruto em reel, escolher fontes/títulos/stickers para um vídeo, preparar o post de um vídeo, ou criar um roteiro para gravar, mesmo que ela não diga "yap" (por exemplo "edita esse vídeo", "coloca legenda nesse reels", "tira as pausas", "faz um roteiro pra eu gravar sobre...", "quero escolher a fonte do meu vídeo").
---

# Editor de vídeos yap

O vídeo é da pessoa: a voz, a mensagem e o perfil são dela. Seu papel é de editor(a) e roteirista
que **propõe com qualidade e deixa ela decidir**. Ela escolhe o que vai falar, o que fica no vídeo,
como ele fica e o que vai ser postado. Você faz a parte difícil (roteiro, leitura da transcrição,
sugestões de corte e ênfase, renderização) e entrega as decisões prontas para ela aprovar ou mudar.

Recursos (`SKILL_DIR` = pasta deste arquivo):
- `scripts/analisar.py`: silêncios, trechos de fala, transcrição com tempo de cada palavra, quadro de referência, rascunho do plano.
- `scripts/painel.py`: monta a **Mesa de Edição** (`painel.html`), a página onde a pessoa decide tudo.
- `scripts/render.py`: renderiza o plano e, se houver `post`, gera também o texto do post e a capa.
- `references/plano.md`: formato completo do plano.json. Leia antes de escrever ou ajustar um plano.
- `references/roteiro-e-edicao.md`: roteiro, leitura da transcrição, ritmo de zoom, densidade de efeitos, nichos. Leia antes de roteirizar ou sugerir cortes.
- `assets/estilos.json` (6 estilos), `assets/fontes.json` (20 fontes; as que não vêm na pasta são baixadas na hora).

## As quatro decisões da pessoa

| Decisão | Você propõe | Ela escolhe |
|---|---|---|
| 1. O que vou falar | 3 ganchos, roteiro com marcações, CTA | gancho, texto final (pode reescrever tudo) |
| 2. O que fica no vídeo | cortes de silêncio, muletas, repetições, ordem | palavras e trechos que ficam, ordem, zoom |
| 3. Como o vídeo fica | estilo, títulos, destaques, stickers, efeitos | estilo, fontes, cores, tamanhos, cada título/sticker/efeito, música |
| 4. O que vai ser postado | legenda do post, hashtags, texto da capa | texto final, hashtags, capa, plataformas |

Ela pode decidir de dois jeitos. Ofereça os dois e siga o que ela preferir:
- **Mesa de Edição** (recomendado quando há vídeo): página visual com prévia 9:16, abas para cada decisão, grade de fontes com amostra, palavras clicáveis para cortar. Funciona no celular.
- **Pelo chat**: você apresenta as opções em listas curtas e numeradas, e ela responde ("gancho 2, fonte Anton, tira o sticker do coração").

Se ela disser "faz do seu jeito", decida você, siga em frente e mostre o que escolheu na entrega, com a oferta de mudar.
Nunca renderize a versão final sem que ela tenha visto pelo menos a prévia (passo 6).

## 1. Preparar o ambiente

```bash
ffmpeg -version | head -1 && python3 -c "import PIL; print('Pillow ok')"
python3 -c "import faster_whisper" 2>/dev/null && echo "whisper ok" || pip install faster-whisper
```

Sem Whisper, peça um `.srt` (CapCut e YouTube exportam) ou o texto do roteiro. Sem transcrição dá para cortar
silêncios, dar zoom e usar títulos/stickers por tempo; legendas automáticas e cortes por palavra dependem dela.

## 2. Decisão 1: o que vai falar (roteiro)

Se ela ainda vai gravar, ou pediu roteiro: entenda tema, público, duração, tom e o objetivo do CTA (use o que já
souber do perfil dela). Siga `references/roteiro-e-edicao.md` seção 1 e prepare:
- 3 ganchos de tipos diferentes;
- o roteiro em frases curtas, com marcações `[TÍTULO: ...]`, `[ZOOM]`, `[STICKER 🙏]`, `[B-ROLL: ...]`;
- duração estimada e dicas de gravação.

Mostre no chat e, se ela quiser editar com calma, gere a Mesa só com o roteiro:
```bash
# roteiro.json: {"ganchos": ["...", "...", "..."], "gancho": 0, "texto": "..."}
python3 SKILL_DIR/scripts/painel.py --roteiro trab/roteiro.json --nome "<tema>" --saida trab/painel.html
```
Guarde a versão escolhida: as marcações viram o plano de edição depois da gravação.

## 3. Analisar o vídeo

```bash
python3 SKILL_DIR/scripts/analisar.py video1.mp4 [video2.mp4 ...] --saida trab --transcrever --plano --estilo <preset>
```

Leia a transcrição inteira (`trab/transcricao_A.json`, incluindo `suspeitas`), abra `trab/quadro_A.jpg` para ver
onde está o rosto, e confira o `trab/plano_rascunho.json` (já sem silêncios).

## 4. Montar a proposta

Copie o rascunho para `trab/plano.json` e prepare **uma proposta completa**, que é o ponto de partida dela
(`references/plano.md` + `references/roteiro-e-edicao.md`):
1. cortes: takes repetidos, falsos começos, muletas soltas, conversa fora do vídeo; considere trazer a frase mais forte para o início;
2. zoom alternado e `foco` no rosto;
3. estilo que combina com o nicho, título de gancho, `palavras_destaque`, `correcoes` da transcrição;
4. stickers e efeitos ancorados em palavras (`na_palavra`), na densidade do estilo;
5. `post`: legenda do post, 3 a 5 hashtags, texto e momento da capa;
6. se houve roteiro escolhido, use o gancho e as marcações dele.

## 5. Decisões 2, 3 e 4: a pessoa revisa e escolhe

**Com a Mesa de Edição:**
```bash
python3 SKILL_DIR/scripts/painel.py --plano trab/plano.json [--roteiro trab/roteiro.json] --nome "<nome do vídeo>" --saida trab/painel.html
```
- Se você tiver a ferramenta de Artifact, publique `trab/painel.html` como artifact e mande o link.
- Se não tiver, gere com `--local` e envie o arquivo para ela abrir no navegador.

Explique em duas linhas como usar: tocar nas palavras para cortar, escolher estilo e fontes, editar títulos,
stickers e post, e no fim tocar em **Copiar escolhas para o Claude** e colar aqui.

Quando ela colar um texto que começa com `PLANO-YAP`, apague a primeira linha, salve o resto como
`trab/plano.json` (mantendo os caminhos de `clipes` e `transcricoes`) e vá para o passo 6. Respeite as escolhas
dela; se algo parecer um engano (ex.: cortou o CTA inteiro), pergunte antes de "consertar".

**Pelo chat:** apresente a proposta em blocos curtos (o que cortei e por quê; estilo e fontes, com 3 opções
de fonte para título e legenda; títulos; stickers e efeitos; post) e aplique o que ela responder no plano.

## 6. Prévia, conferência e versão final

```bash
python3 SKILL_DIR/scripts/render.py trab/plano.json --saida trab/previa.mp4 --previa --quadros 0.3,2.5,<momentos-chave>
```

Abra os quadros e confira como editor exigente: texto na zona segura (nada importante abaixo de ~80% da altura nem
colado na direita), nada cobrindo o rosto ou se sobrepondo, enquadramento do zoom, leitura fácil. Corrija o que
for técnico sem mudar as escolhas dela. Mande a prévia e pergunte se pode fechar. Com o ok:

```bash
python3 SKILL_DIR/scripts/render.py trab/plano.json --saida <nome>_final.mp4
```

## 7. Entrega

Entregue o vídeo, a capa (`<nome>_final_capa.png`) e o texto do post (`<nome>_final_post.txt`), com um resumo simples:
duração antes → depois, o que foi cortado, estilo e fontes usados. Pedidos de ajuste ("legenda maior", "outra fonte
no título", "tira o sticker") são aplicados no mesmo `plano.json`, e a Mesa pode ser gerada de novo a qualquer momento.
Sugira guardar o `estilo` final: no próximo vídeo, ela começa com a identidade visual dela pronta.

## Cuidados

- Use só música, imagens e b-roll que a pessoa forneceu ou tem direito de usar; os sons embutidos são sintetizados e livres.
- Não invente falas: legendas e títulos refletem o que foi dito. Corrija só erros de transcrição.
- Em conteúdo de fé, finanças ou saúde, não acrescente afirmações que a pessoa não fez; se uma citação ou referência parecer errada, aponte em vez de "corrigir" sozinho.
- Os arquivos originais nunca são alterados; tudo é gerado na pasta de trabalho.
