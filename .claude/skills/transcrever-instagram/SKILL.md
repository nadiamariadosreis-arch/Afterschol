---
name: transcrever-instagram
description: Transcreve vídeos do Instagram (Reels, posts em vídeo, IGTV) para texto em português, gerando .txt, .srt (legenda) e .md com autor, link e legenda original do post. Use sempre que a pessoa colar um link do instagram.com/reel, /p/ ou /tv, ou pedir para "transcrever", "tirar o texto", "pegar a fala", "fazer legenda" ou "roteiro" de um vídeo do Instagram, mesmo sem usar a palavra transcrição. Também serve para arquivos de vídeo/áudio já baixados.
---

# Transcrever vídeos do Instagram

Baixa só o áudio do vídeo com `yt-dlp` e transcreve localmente com `faster-whisper`
(Whisper rodando na máquina, sem API paga). Script: `scripts/transcrever.py`.

## Passo a passo

1. **Pegue o(s) link(s).** Aceita `instagram.com/reel/...`, `/p/...`, `/tv/...` ou um
   caminho de arquivo local (.mp4, .mov, .mp3, .m4a, .wav). Se vierem vários links,
   rode o script uma vez para cada.

2. **Garanta as dependências** (só na primeira vez):
   ```bash
   pip install yt-dlp faster-whisper
   ```
   O `ffmpeg` também precisa estar instalado. O script avisa se faltar algo.

3. **Rode o script:**
   ```bash
   python3 .claude/skills/transcrever-instagram/scripts/transcrever.py "LINK" --saida transcricoes
   ```
   Opções úteis:
   - `--modelo` `tiny` | `base` | `small` (padrão) | `medium` | `large-v3`.
     Maior = mais preciso e mais lento. Para sotaque forte, música de fundo ou
     termos religiosos/técnicos, use `medium`.
   - `--idioma auto` quando o vídeo não for em português.
   - `--cookies cookies.txt` para posts privados ou quando o Instagram pedir login.

4. **Revise o texto** antes de entregar: o Whisper erra nomes próprios, citações
   bíblicas (ex.: "Jo 3,16"), nomes de santos e orações. Corrija o que for óbvio
   pelo contexto e marque com `[?]` o que não der para ter certeza. Não invente fala.

5. **Entregue** à pessoa o conteúdo do `.md` (texto + autor + link) e diga onde
   ficaram o `.txt` e o `.srt`. Se ela pedir, transforme a transcrição em:
   resumo, roteiro de carrossel, legenda para post, tópicos de estudo ou
   material de catequese, mantendo fiel ao que foi dito no vídeo.

## Quando der erro

| Mensagem | O que fazer |
|---|---|
| "O Instagram pediu login" / "login required" | Exportar cookies do navegador logado no Instagram (extensão "Get cookies.txt LOCALLY") e rodar com `--cookies cookies.txt`. |
| "Não encontrei o áudio" | O post é só foto/carrossel de imagens, não há o que transcrever. |
| Erro de rede / 403 / proxy | O ambiente bloqueia o Instagram ou o huggingface.co (onde o modelo é baixado na 1ª vez). Rodar no computador da pessoa ou pedir para ela baixar o vídeo e enviar o arquivo. |
| Transcrição vazia | Vídeo só com música, sem fala. Avisar a pessoa. |

## Respeito a direitos

Transcreva para uso pessoal, estudo, acessibilidade ou referência. Ao reaproveitar
conteúdo de outra pessoa em posts, lembre a pessoa de dar crédito ao autor original.
