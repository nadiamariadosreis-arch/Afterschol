#!/usr/bin/env python3
"""Baixa o áudio de um vídeo do Instagram (Reel, post ou IGTV) e transcreve.

Uso:
    python3 transcrever.py URL_OU_ARQUIVO [--saida PASTA] [--modelo small]
                           [--idioma pt] [--cookies cookies.txt]

Gera na pasta de saída:
    <id>.txt  texto corrido
    <id>.srt  legenda com tempos
    <id>.md   transcrição com metadados (autor, legenda do post, link)
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile


def checar_dependencias():
    faltando = []
    try:
        import faster_whisper  # noqa: F401
    except ImportError:
        faltando.append("faster-whisper")
    if subprocess.run(["which", "yt-dlp"], capture_output=True).returncode != 0:
        faltando.append("yt-dlp")
    if faltando:
        sys.exit("Dependências faltando. Instale com:\n  pip install " + " ".join(faltando))
    if subprocess.run(["which", "ffmpeg"], capture_output=True).returncode != 0:
        sys.exit("ffmpeg não encontrado. Instale (ex.: apt install ffmpeg / brew install ffmpeg).")


def baixar_audio(url, pasta, cookies=None):
    """Baixa só o áudio em m4a/mp3 e devolve (caminho_audio, metadados)."""
    modelo_nome = os.path.join(pasta, "%(id)s.%(ext)s")
    cmd = ["yt-dlp", "-x", "--audio-format", "mp3", "--no-playlist",
           "--write-info-json", "-o", modelo_nome, url]
    if cookies:
        cmd[1:1] = ["--cookies", cookies]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        msg = r.stderr.strip().splitlines()[-1] if r.stderr.strip() else "erro desconhecido"
        if "login" in r.stderr.lower() or "cookies" in r.stderr.lower():
            msg += ("\nO Instagram pediu login. Exporte os cookies do navegador "
                    "(extensão 'Get cookies.txt LOCALLY') e rode de novo com --cookies cookies.txt")
        sys.exit("Falha ao baixar o vídeo: " + msg)

    audio, info = None, {}
    for nome in os.listdir(pasta):
        caminho = os.path.join(pasta, nome)
        if nome.endswith(".mp3"):
            audio = caminho
        elif nome.endswith(".info.json"):
            with open(caminho, encoding="utf-8") as f:
                info = json.load(f)
    if not audio:
        sys.exit("Não encontrei o áudio baixado (o post pode ser só foto).")
    return audio, info


def tempo_srt(seg):
    h, resto = divmod(seg, 3600)
    m, s = divmod(resto, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int((s % 1) * 1000):03d}"


def transcrever(audio, modelo, idioma):
    from faster_whisper import WhisperModel
    m = WhisperModel(modelo, device="auto", compute_type="int8")
    segmentos, info = m.transcribe(audio, language=idioma or None, vad_filter=True)
    return list(segmentos), info.language


def main():
    p = argparse.ArgumentParser(description="Transcreve vídeos do Instagram")
    p.add_argument("fonte", help="Link do Instagram ou caminho de um arquivo de vídeo/áudio local")
    p.add_argument("--saida", default="transcricoes", help="Pasta de saída (padrão: transcricoes)")
    p.add_argument("--modelo", default="small",
                   help="Modelo Whisper: tiny, base, small, medium, large-v3 (padrão: small)")
    p.add_argument("--idioma", default="pt", help="Código do idioma (padrão: pt; use 'auto' para detectar)")
    p.add_argument("--cookies", help="Arquivo cookies.txt do Instagram, para posts que exigem login")
    a = p.parse_args()

    checar_dependencias()
    os.makedirs(a.saida, exist_ok=True)
    idioma = None if a.idioma == "auto" else a.idioma

    with tempfile.TemporaryDirectory() as tmp:
        if os.path.exists(a.fonte):
            audio, info = a.fonte, {}
            base = os.path.splitext(os.path.basename(a.fonte))[0]
        else:
            print("Baixando áudio...", file=sys.stderr)
            audio, info = baixar_audio(a.fonte, tmp, a.cookies)
            base = info.get("id") or "video"

        print(f"Transcrevendo com o modelo '{a.modelo}'...", file=sys.stderr)
        segmentos, idioma_detectado = transcrever(audio, a.modelo, idioma)

    texto = " ".join(s.text.strip() for s in segmentos).strip()
    destino = os.path.join(a.saida, base)

    with open(destino + ".txt", "w", encoding="utf-8") as f:
        f.write(texto + "\n")

    with open(destino + ".srt", "w", encoding="utf-8") as f:
        for i, s in enumerate(segmentos, 1):
            f.write(f"{i}\n{tempo_srt(s.start)} --> {tempo_srt(s.end)}\n{s.text.strip()}\n\n")

    with open(destino + ".md", "w", encoding="utf-8") as f:
        f.write(f"# Transcrição: {info.get('title') or base}\n\n")
        if info:
            autor = info.get("uploader") or info.get("channel") or ""
            f.write(f"- **Autor:** {autor}\n- **Link:** {info.get('webpage_url', a.fonte)}\n")
            if info.get("duration"):
                f.write(f"- **Duração:** {int(info['duration'])}s\n")
        f.write(f"- **Idioma:** {idioma_detectado}\n\n## Texto\n\n{texto}\n")
        if info.get("description"):
            f.write(f"\n## Legenda original do post\n\n{info['description']}\n")

    print(destino + ".md")


if __name__ == "__main__":
    main()
