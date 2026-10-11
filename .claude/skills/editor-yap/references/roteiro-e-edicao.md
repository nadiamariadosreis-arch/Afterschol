# Roteiro personalizado e inteligência de edição

## Sumário
1. Escrevendo o roteiro (antes de gravar)
2. Lendo a transcrição como editor (depois de gravar)
3. Ritmo de cortes e zoom
4. Textos na tela: títulos, legendas, palavras-chave
5. Stickers, sobreposições e efeitos: quando e quanto
6. Adaptando ao nicho e à pessoa
7. Legenda do post (caption) e CTA

---

## 1. Escrevendo o roteiro

Um vídeo yap curto (15 a 60 s) funciona com esta espinha. Ajuste os tempos ao tamanho pedido.

| Bloco | Tempo (vídeo de 45 s) | O que faz |
|---|---|---|
| Gancho | 0 a 3 s | Para o dedo. Uma frase só: dor, promessa, contradição ou pergunta. |
| Contexto | 3 a 10 s | Por que isso importa para quem assiste. |
| Conteúdo | 10 a 38 s | 1 a 3 pontos. Um ponto por frase curta. Exemplo concreto > conceito. |
| Virada / prova | dentro do conteúdo | Número, história real, versículo, antes e depois. |
| CTA | últimos 4 a 7 s | Uma ação só: comentar palavra, salvar, seguir, link na bio. |

Tipos de gancho que funcionam (escreva 3 opções e deixe a pessoa escolher):
- **Erro comum**: "Você ora pelas finanças, mas comete esse erro todo mês."
- **Contradição**: "Organizar a casa não começa pela casa."
- **Número**: "3 frases que eu parei de dizer para meus filhos."
- **Pergunta direta**: "Você sabe quanto gastou no mercado esse mês?"
- **Resultado**: "Foi assim que a gente quitou o cartão em 8 meses."

Como escrever para ser falado:
- Frases de 6 a 14 palavras. Uma ideia por frase. Fale como conversa, não como texto.
- Escreva o roteiro com marcações para a edição, assim a edição já nasce pronta:
  `[TÍTULO: ...]`, `[ZOOM]`, `[STICKER 🙏]`, `[B-ROLL: foto da planilha]`, `[PAUSA]`.
- Entregue também: duração estimada (≈ 2,5 palavras por segundo em português) e dicas de gravação
  (luz de frente, câmera na altura dos olhos, gravar em 4K se puder, para o zoom não perder qualidade,
  e repetir a frase inteira quando errar, sem parar a gravação).

## 2. Lendo a transcrição como editor

Leia a transcrição inteira antes de decidir qualquer corte. Procure:

- **Takes repetidos**: a pessoa errou e repetiu. Mantenha a ÚLTIMA versão completa, que costuma ser a melhor;
  confira se ela está inteira. Remova as anteriores.
- **Falsos começos**: "Então, hoje eu... hoje eu vou falar". Corte até o início limpo.
- **Muletas**: "é...", "tipo", "né", "então assim". O `analisar.py` lista suspeitas em `suspeitas`.
  Corte as que estão sozinhas entre pausas; não picote no meio de uma frase fluida, porque soa robótico.
- **Respiros longos**: os trechos de silêncio já vêm cortados no rascunho. Mantenha ~80 ms de folga em
  cada lado para não comer o início das palavras.
- **O melhor gancho pode estar no meio**: se uma frase forte aparece aos 40 s, considere trazê-la para o início
  como segmento de abertura (e mantê-la ou não no lugar original).
- **Conversa fora do vídeo**: "pera, deixa eu ver", "tá gravando?". Corte.

Erros da transcrição (nomes, termos religiosos, valores) vão em `legendas.correcoes`. Palavras comuns que o
Whisper erra em português: Jesus, Nossa Senhora, catequese, eucaristia, dízimo, Pix, nomes próprios.

## 3. Ritmo de cortes e zoom

O "jump cut com zoom" é a assinatura do vídeo yap: a cada corte o enquadramento muda, e o corte
vira ritmo em vez de defeito.

- Alterne o zoom entre segmentos seguidos: 1.0 → 1.15 → 1.0 → 1.25. Nunca dois segmentos seguidos
  com o mesmo zoom se houver corte entre eles (o pulo fica feio, parece erro).
- Close (1.3 a 1.4) para a frase mais emocional ou a revelação.
- Push-in lento (`zoom` 1.0 → `zoom_final` 1.06 a 1.1) em segmentos longos (>5 s) e reflexivos.
- `zoom_impacto` em 1 a 3 palavras-chave do vídeo inteiro, não mais. Ênfase repetida perde força.
- Material em 1080p aguenta até ~1.3 sem perder nitidez visível; 4K aguenta até 2.0.
- Segmentos ideais: 2 a 6 s. Mais longo que 8 s sem nada mudando na tela cansa: coloque zoom suave,
  um título, b-roll ou sticker.

## 4. Textos na tela

- **Título de abertura** (0 a 3 s): reescreva o gancho em no máximo ~7 palavras, com 1 palavra em `*destaque*`.
  Ele precisa funcionar sem som (muita gente assiste mudo).
- **Títulos de seção**: "Passo 1", "Erro nº 2", "O que fazer". Ajudam quem pula para frente.
- **Legendas**: quase sempre ligadas. 2 a 4 palavras por bloco no estilo dinâmico; 5 a 6 no estilo calmo.
- **Palavras de destaque**: 3 a 8 palavras-chave da mensagem (números, nomes, o tema central).
- **Zona segura do Reels/TikTok**: nada importante acima de ~12% (topo) nem abaixo de ~80% da altura
  (botões e descrição), nem nos ~13% da direita (curtir/comentar). Títulos em `topo` (0.17) e legendas
  entre 0.65 e 0.75 respeitam isso.
- Quando um título ocupar o centro, use `legendas.ocultar` para não empilhar texto.

## 5. Stickers, sobreposições e efeitos: quando e quanto

Densidade de referência por 30 s de vídeo:
| Estilo | Stickers | B-roll | Efeitos sonoros | Zoom impacto / flash |
|---|---|---|---|---|
| viral | 4 a 6 | 1 a 3 | 6 a 10 | 2 a 3 |
| clean / financas / lar | 2 a 4 | 1 a 2 | 3 a 5 | 1 a 2 |
| catequese / minimal | 0 a 2 | 0 a 2 | 0 a 2 | 0 a 1 |

- O sticker sempre reforça a palavra dita naquele momento (`na_palavra`). Emoji aleatório distrai.
  Exemplos: oração 🙏, dinheiro 💸, casa 🏠, coração ❤️, alerta ⚠️, ideia 💡, check ✅, relógio ⏰, Bíblia 📖.
- Alterne o lado dos stickers (x 0.2 / 0.8) e mantenha y entre 0.25 e 0.45, longe do rosto.
- `selo` para rótulos: "DICA", "ERRO", "ANTES", "DEPOIS", "SALVA ESSE".
- `seta` para chamar atenção para algo na tela ou para o CTA ("comenta aqui ↓").
- B-roll quando a fala cita algo visual (planilha, casa arrumada, igreja, extrato). Peça os arquivos à pessoa;
  sem eles, não invente: sugira o que filmar.
- `flash` + `whoosh` para mudar de bloco do roteiro. `tremor` para choque. `pb` para "antes"/flashback.
- Som: cada sticker com `pop`, título com `whoosh`, revelação com `ding` ou `boom`. Volume baixo (0.3 a 0.6).
  Em conteúdo religioso/reflexivo, quase sem sons.

## 6. Adaptando ao nicho e à pessoa

- **Catequese / fé**: estilo `catequese`, cortes menos agressivos (mantenha pausas de reflexão),
  zoom suave em vez de impacto, títulos com versículo ou referência (ex.: "Mt 6,33"), sem tremor/boom.
  Cuide de citar referências bíblicas e ensinamentos corretamente; se não tiver certeza, peça para conferir.
- **Casa / organização / rotina**: estilo `lar`, b-roll de antes/depois, selos "ANTES"/"DEPOIS", passos numerados.
- **Finanças para família**: estilo `financas`, números grandes em título (R$, %), palavras_destaque nos valores,
  `pb` no "antes" e cor normal no "depois". Nada de promessa de ganho garantido.
- **Educação / dicas rápidas**: `clean` ou `viral`, títulos de seção, barra de progresso ligada.
- Se a pessoa tiver identidade visual (cores, fonte da marca), passe pelo `estilo` com `base` + ajustes,
  e reutilize o mesmo objeto nos próximos vídeos para manter a consistência do perfil.

## 7. Legenda do post e CTA

Ao entregar o vídeo, ofereça junto:
- Legenda do post (caption) de 3 a 6 linhas: gancho reescrito, 1 a 2 linhas de valor, CTA, 3 a 5 hashtags do nicho.
- 2 opções de texto para a capa (thumbnail), com no máximo 5 palavras.
- O CTA falado e o CTA escrito devem pedir a mesma coisa.
