# Formato do plano de edição (plano.json)

O `render.py` lê um único JSON. Caminhos relativos são relativos à pasta do próprio plano.
Tudo é opcional, exceto `clipes` e `segmentos`.

## Sumário
1. Como indicar o tempo (t, na_palavra, t_saida)
2. Campos de topo
3. segmentos (cortes + zoom)
4. legendas
5. titulos
6. stickers
7. sobreposicoes (b-roll)
8. efeitos
9. audio e efeitos_sonoros
10. Exemplo completo

---

## 1. Como indicar o tempo

Os itens (título, sticker, efeito, som, b-roll) aceitam **uma** destas formas:

| Campo | Significado | Quando usar |
|---|---|---|
| `"na_palavra": "oração"` (+ `"ocorrencia": 2`, `"deslocamento": -0.1`) | momento em que a palavra é dita (depois das correções) | **preferido**: não quebra quando você muda os cortes |
| `"t": 12.4` (+ `"clipe": "B"`) | segundos no clipe ORIGINAL (como na transcrição) | quando o momento não é uma palavra |
| `"t_saida": 3.0` | segundos no vídeo FINAL | abertura (0), CTA no fim, coisas fora da fala |

Se o tempo cair num trecho cortado, o item vai para o início do próximo trecho mantido.
`duracao` é sempre em segundos do vídeo final.

## 2. Campos de topo

```json
{
  "clipes": {"A": "bruto/take1.mp4", "B": "bruto/take2.mp4"},
  "transcricoes": {"A": "trab/transcricao_A.json"},
  "formato": {"largura": 1080, "altura": 1920, "fps": 30, "preencher": "cortar"},
  "estilo": "viral",
  "cor": "vibrante",
  "barra_progresso": true,
  "fade_entrada": false,
  "fade_saida": true
}
```

- `formato.preencher`: `"cortar"` (preenche a tela cortando as bordas; padrão) ou `"desfoque"` (vídeo horizontal inteiro com fundo desfocado).
  Para 1:1 use 1080x1080; para 4:5, 1080x1350; para YouTube horizontal, 1920x1080.
- `estilo`: nome de preset (`viral`, `clean`, `catequese`, `lar`, `financas`, `minimal`, ver `assets/estilos.json`)
  ou objeto com ajustes: `{"base": "lar", "legenda": {"destaque": "#FF6B9A"}, "titulo": {"fonte": "Anton"}}`.
- `cor`: `vibrante`, `quente`, `frio`, `suave`, `pb`, `neutro`, ou uma cadeia de filtros ffmpeg crua (ex: `"eq=saturation=1.3"`).
  Se omitido, usa a cor do estilo.
- `barra_progresso`: `true` ou `{"cor": "#FFD400", "altura": 12, "posicao": "baixo"|"topo"}`.

## 3. segmentos

Lista, **na ordem em que aparecem no vídeo final**. Cada item é um trecho mantido:

```json
{"clipe": "A", "inicio": 3.42, "fim": 7.90, "zoom": 1.0, "zoom_final": 1.08, "foco": [0.5, 0.38], "espelhar": false}
```

- `inicio`/`fim`: segundos no clipe original. Tudo que não está em nenhum segmento é cortado.
- `zoom`: 1.0 = enquadramento normal; 1.15 = 15% mais perto. Valores bons: 1.0 / 1.12 / 1.25 / 1.4 (close no rosto).
- `zoom_final`: se diferente de `zoom`, faz zoom suave ao longo do segmento (push-in lento: 1.0 → 1.08).
- `foco`: [x, y] de 0 a 1, ponto que fica centralizado ao dar zoom. Rosto costuma estar em ~[0.5, 0.35].
  Olhe o `quadro_A.jpg` gerado pela análise para acertar.
- A ordem pode ser alterada livremente (ex.: trazer a frase mais forte para o começo como gancho).

## 4. legendas

```json
"legendas": {
  "ativo": true,
  "palavras_por_bloco": 3,
  "posicao_y": 0.68,
  "maiusculas": true,
  "destacar_palavra_ativa": true,
  "palavras_destaque": ["Deus", "dízimo", "R$500"],
  "correcoes": {"jesuis": "Jesus", "né": ""},
  "remover_pontuacao": true,
  "ocultar": [{"na_palavra": "primeiro", "duracao": 2.5}],
  "manuais": [{"t_saida": 0.2, "duracao": 1.5, "texto": "Texto sem fala"}],
  "estilo": {"tamanho": 96, "destaque": "#FFD400"}
}
```

- As legendas são geradas da transcrição, palavra por palavra, com a palavra falada em destaque (efeito "karaokê").
- `correcoes`: troca palavras erradas da transcrição. Valor `""` apaga a palavra da legenda (bom para muletas que ficaram no áudio).
  Vale também para encontrar `na_palavra`.
- `palavras_destaque`: sempre coloridas com a cor de destaque (palavras-chave da mensagem).
- `ocultar`: esconde legendas num intervalo (ex.: quando um título grande ocupa a tela).
- `posicao_y`: 0 = topo, 1 = base. Mantenha entre 0.6 e 0.78 para não brigar com a interface do Reels/TikTok.
- `manuais`: legendas avulsas quando não há transcrição.

## 5. titulos

```json
{"texto": "3 erros que *esvaziam* sua conta", "t_saida": 0, "duracao": 2.8,
 "posicao": "topo", "animacao": "pop", "som": "whoosh",
 "x": 0.5, "tamanho": 110, "fonte": "Anton", "cor": "#FFFFFF", "cor_destaque": "#FFD400", "rotacao": -3,
 "estilo": {"caixa": true, "cor_caixa": "#E63946"}}
```

- `*palavra*` pinta a palavra com a cor de destaque.
- `\n` quebra linha.
- `posicao`: `topo` | `centro` | `baixo` | número de 0 a 1.
- `animacao`: `pop` (padrão), `subir`, `deslizar`, `fade`, `digitar` (máquina de escrever), `nenhuma`.
- `som`: toca um efeito sonoro junto (ver seção 9).
- Fontes disponíveis: Anton, Bebas Neue, Poppins / Poppins SemiBold / Poppins Bold / Poppins Black,
  Montserrat, Playfair Display, Caveat (manuscrita) + qualquer fonte instalada no sistema.

## 6. stickers

```json
{"tipo": "emoji", "valor": "🙏", "na_palavra": "oração", "duracao": 1.6, "x": 0.82, "y": 0.3, "tamanho": 200, "animacao": "pop", "rotacao": 10, "som": "pop"}
{"tipo": "selo", "texto": "Dica", "t": 14.2, "duracao": 2, "x": 0.25, "y": 0.3, "tamanho_fonte": 64, "cor_fundo": "#FFD400", "cor_texto": "#000000", "animacao": "balancar"}
{"tipo": "seta", "direcao": "baixo", "t_saida": 28, "duracao": 2, "x": 0.5, "y": 0.6, "tamanho": 160, "cor": "#FFD400", "animacao": "flutuar"}
{"tipo": "imagem", "arquivo": "logo.png", "t_saida": 0, "duracao": 30, "x": 0.88, "y": 0.06, "tamanho": 140, "animacao": "fade"}
```

- `x`, `y`: centro do sticker, de 0 a 1. `tamanho`: maior lado em pixels (no 1080x1920).
- `animacao`: `pop` (padrão), `fade`, `flutuar`, `balancar`, `nenhuma`. Todos saem com fade suave.
- `selo` usa as cores do estilo se `cor_fundo`/`cor_texto` não forem dados.
- Emojis precisam de uma fonte de emoji colorido no sistema (Noto Color Emoji no Linux, Apple Color Emoji no Mac).
  Para stickers animados de verdade (GIF/WebM), use `sobreposicoes`.

## 7. sobreposicoes (b-roll, prints, fotos)

```json
{"arquivo": "broll/planilha.png", "na_palavra": "planilha", "duracao": 2.5, "modo": "janela", "largura": 0.8, "y": 0.32, "borda": 8, "cor_borda": "#FFFFFF", "ken_burns": 0.08, "som": "whoosh"}
{"arquivo": "broll/igreja.mp4", "inicio": 2.0, "t": 40.1, "duracao": 3, "modo": "tela_cheia"}
```

- `modo`: `tela_cheia` (cobre a pessoa; a voz continua), `janela` (caixa 16:9 por cima), `quadrado` (1:1).
  `proporcao` (altura/largura) personaliza a janela.
- `inicio`: de onde começar o vídeo de b-roll. `ken_burns`: zoom lento em imagens (0.08 padrão em imagens).
- `opacidade`: 0 a 1.

## 8. efeitos

```json
"efeitos": [
  {"tipo": "zoom_impacto", "na_palavra": "nunca", "intensidade": 0.18, "duracao": 0.6, "som": "boom"},
  {"tipo": "tremor", "t": 22.0, "duracao": 0.35, "intensidade": 14},
  {"tipo": "flash", "t_saida": 12.3, "duracao": 0.25, "cor": "white", "som": "click"},
  {"tipo": "pb", "na_palavra": "antigamente", "duracao": 2},
  {"tipo": "vinheta"}
]
```

- `zoom_impacto`: soco de zoom rápido que volta (ênfase numa palavra).
- `tremor`: chacoalha a imagem (surpresa, choque, "olha isso").
- `flash`: clarão branco curto, ótimo como transição entre blocos do roteiro.
- `pb`: preto e branco por um intervalo (flashback, "antes").
- `vinheta`: escurece as bordas no vídeo inteiro (clima intimista).

## 9. audio e efeitos_sonoros

```json
"audio": {"musica": "trilha.mp3", "volume_musica": 0.12, "ducking": true, "volume_voz": 1.0, "normalizar": true},
"efeitos_sonoros": [{"som": "ding", "na_palavra": "segredo", "volume": 0.5}, {"arquivo": "sfx/caixa.wav", "t_saida": 20}]
```

- `ducking`: a música abaixa sozinha quando a pessoa fala.
- `normalizar`: deixa o volume final em -14 LUFS (padrão de Reels/TikTok/YouTube).
- Sons embutidos (sintetizados, sem direitos autorais): `pop`, `ding`, `click`, `boom`, `whoosh`.
- Música: só use arquivos que a pessoa forneceu ou que ela tenha direito de usar.

## 10. Exemplo completo

```json
{
  "clipes": {"A": "IMG_4410.MOV"},
  "transcricoes": {"A": "trab/transcricao_A.json"},
  "formato": {"largura": 1080, "altura": 1920, "fps": 30},
  "estilo": "financas",
  "barra_progresso": true,
  "segmentos": [
    {"clipe": "A", "inicio": 41.2, "fim": 44.0, "zoom": 1.25, "foco": [0.5, 0.36]},
    {"clipe": "A", "inicio": 2.1, "fim": 6.8, "zoom": 1.0, "zoom_final": 1.06, "foco": [0.5, 0.36]},
    {"clipe": "A", "inicio": 7.3, "fim": 11.0, "zoom": 1.15, "foco": [0.5, 0.36]}
  ],
  "legendas": {"palavras_destaque": ["dízimo", "reserva"], "correcoes": {"dizimo": "dízimo"}},
  "titulos": [{"texto": "O erro que *trava* a sua reserva", "t_saida": 0, "duracao": 2.6, "som": "whoosh"}],
  "stickers": [{"tipo": "emoji", "valor": "💸", "na_palavra": "gastar", "duracao": 1.4, "x": 0.8, "y": 0.3, "som": "pop"}],
  "efeitos": [{"tipo": "zoom_impacto", "na_palavra": "nunca", "som": "boom"}],
  "audio": {"musica": "trilha_calma.mp3", "volume_musica": 0.1}
}
```
