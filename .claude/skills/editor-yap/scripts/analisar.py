#!/usr/bin/env python3
"""Analisa um vídeo "yap" (pessoa falando para a câmera).

Gera, numa pasta de trabalho:
  - analise_<id>.json    : duração, resolução, fps, silêncios e trechos de fala
  - transcricao_<id>.json: palavras com tempo (se houver Whisper instalado ou --srt)
  - quadro_<id>.jpg      : um quadro do meio do vídeo, para escolher o foco do zoom
  - plano_rascunho.json  : (com --plano) primeiro rascunho de plano com os cortes de silêncio

Uso:
  python3 analisar.py VIDEO [VIDEO2 ...] --saida PASTA [--transcrever] [--modelo small]
                       [--idioma pt] [--srt legenda.srt] [--limiar -32] [--min-silencio 0.35]
                       [--plano --estilo viral]
"""
import argparse
import json
import os
import re
import subprocess
import sys

MULETAS = {"é", "éé", "ééé", "hum", "hã", "ahn", "tipo", "né", "então", "assim", "aham", "uh", "um", "eh", "ah"}


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def sondar(video):
    r = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", video])
    if r.returncode != 0:
        sys.exit(f"ffprobe falhou em {video}: {r.stderr}")
    info = json.loads(r.stdout)
    v = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    a = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    if not v:
        sys.exit(f"{video} não tem faixa de vídeo")
    w, h = int(v["width"]), int(v["height"])
    rot = 0
    for sd in v.get("side_data_list", []):
        if "rotation" in sd:
            rot = int(sd["rotation"])
    rot = int(v.get("tags", {}).get("rotate", rot))
    if abs(rot) in (90, 270):
        w, h = h, w
    num, den = v.get("avg_frame_rate", "30/1").split("/")
    fps = float(num) / float(den) if float(den) else 30.0
    return {
        "arquivo": os.path.abspath(video),
        "duracao": float(info["format"]["duration"]),
        "largura": w,
        "altura": h,
        "fps": round(fps, 3),
        "tem_audio": a is not None,
    }


def silencios(video, limiar, minimo):
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", video, "-af",
             f"silencedetect=noise={limiar}dB:d={minimo}", "-f", "null", "-"])
    out, ini = [], None
    for linha in r.stderr.splitlines():
        m = re.search(r"silence_start: ([\d.]+)", linha)
        if m:
            ini = float(m.group(1))
        m = re.search(r"silence_end: ([\d.]+)", linha)
        if m and ini is not None:
            out.append([round(ini, 3), round(float(m.group(1)), 3)])
            ini = None
    return out, ini


def falas(duracao, sil, sil_aberto, folga=0.08, minimo=0.25):
    if sil_aberto is not None:
        sil = sil + [[sil_aberto, duracao]]
    trechos, cur = [], 0.0
    for a, b in sil:
        if a - cur > 0:
            trechos.append([max(0.0, cur - folga), min(duracao, a + folga)])
        cur = b
    if duracao - cur > 0:
        trechos.append([max(0.0, cur - folga), duracao])
    # junta trechos que se sobrepõem por causa da folga e descarta ruídos curtos
    unidos = []
    for t in trechos:
        if unidos and t[0] <= unidos[-1][1]:
            unidos[-1][1] = t[1]
        else:
            unidos.append(t)
    return [[round(a, 3), round(b, 3)] for a, b in unidos if b - a >= minimo]


def transcrever(video, modelo, idioma):
    try:
        from faster_whisper import WhisperModel
        m = WhisperModel(modelo, device="auto", compute_type="int8")
        segs, info = m.transcribe(video, language=idioma, word_timestamps=True, vad_filter=False)
        palavras, segmentos = [], []
        for s in segs:
            segmentos.append({"inicio": round(s.start, 3), "fim": round(s.end, 3), "texto": s.text.strip()})
            for w in s.words or []:
                palavras.append({"w": w.word.strip(), "inicio": round(w.start, 3), "fim": round(w.end, 3)})
        return {"motor": "faster-whisper", "idioma": info.language, "segmentos": segmentos, "palavras": palavras}
    except ImportError:
        pass
    try:
        import whisper
        m = whisper.load_model(modelo)
        r = m.transcribe(video, language=idioma, word_timestamps=True)
        palavras, segmentos = [], []
        for s in r["segments"]:
            segmentos.append({"inicio": round(s["start"], 3), "fim": round(s["end"], 3), "texto": s["text"].strip()})
            for w in s.get("words", []):
                palavras.append({"w": w["word"].strip(), "inicio": round(w["start"], 3), "fim": round(w["end"], 3)})
        return {"motor": "openai-whisper", "idioma": r.get("language"), "segmentos": segmentos, "palavras": palavras}
    except ImportError:
        return None


def ler_srt(caminho):
    """Converte SRT em palavras com tempo aproximado (divide o tempo do bloco pelas palavras)."""
    def ts(s):
        h, m, rest = s.strip().replace(",", ".").split(":")
        return int(h) * 3600 + int(m) * 60 + float(rest)
    texto = open(caminho, encoding="utf-8-sig").read()
    palavras, segmentos = [], []
    for bloco in re.split(r"\n\s*\n", texto.strip()):
        linhas = [l for l in bloco.splitlines() if l.strip()]
        idx = next((i for i, l in enumerate(linhas) if "-->" in l), None)
        if idx is None:
            continue
        a, b = [ts(x) for x in linhas[idx].split("-->")]
        frase = " ".join(linhas[idx + 1:])
        segmentos.append({"inicio": round(a, 3), "fim": round(b, 3), "texto": frase})
        ws = frase.split()
        passo = (b - a) / max(1, len(ws))
        for i, w in enumerate(ws):
            palavras.append({"w": w, "inicio": round(a + i * passo, 3), "fim": round(a + (i + 1) * passo, 3)})
    return {"motor": "srt", "idioma": None, "segmentos": segmentos, "palavras": palavras}


def muletas_e_repeticoes(trans):
    achados = []
    ps = trans["palavras"]
    for i, p in enumerate(ps):
        limpa = re.sub(r"[^\wà-ú]", "", p["w"].lower())
        if limpa in MULETAS:
            achados.append({"tipo": "muleta", "palavra": p["w"], "inicio": p["inicio"], "fim": p["fim"]})
        if i and limpa and limpa == re.sub(r"[^\wà-ú]", "", ps[i - 1]["w"].lower()):
            achados.append({"tipo": "repeticao", "palavra": p["w"], "inicio": ps[i - 1]["inicio"], "fim": p["fim"]})
    return achados


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("videos", nargs="+")
    ap.add_argument("--saida", required=True)
    ap.add_argument("--transcrever", action="store_true")
    ap.add_argument("--modelo", default="small")
    ap.add_argument("--idioma", default="pt")
    ap.add_argument("--srt", help="SRT já existente (só para um vídeo)")
    ap.add_argument("--limiar", type=float, default=-32.0, help="dB abaixo do qual é silêncio")
    ap.add_argument("--min-silencio", type=float, default=0.35)
    ap.add_argument("--plano", action="store_true", help="gera plano_rascunho.json")
    ap.add_argument("--estilo", default="viral")
    a = ap.parse_args()
    os.makedirs(a.saida, exist_ok=True)

    clipes, segmentos_plano, transcricoes = {}, [], {}
    for n, video in enumerate(a.videos):
        cid = chr(ord("A") + n)
        info = sondar(video)
        sil, aberto = silencios(video, a.limiar, a.min_silencio) if info["tem_audio"] else ([], None)
        info["silencios"] = sil
        info["trechos_de_fala"] = falas(info["duracao"], sil, aberto) if info["tem_audio"] else [[0, info["duracao"]]]
        fala_total = sum(b - a_ for a_, b in info["trechos_de_fala"])
        info["duracao_sem_silencios"] = round(fala_total, 2)

        quadro = os.path.join(a.saida, f"quadro_{cid}.jpg")
        run(["ffmpeg", "-y", "-v", "error", "-ss", str(info["duracao"] / 2), "-i", video,
             "-frames:v", "1", "-vf", "scale=-2:640", quadro])
        info["quadro"] = quadro

        trans = None
        if a.srt and n == 0:
            trans = ler_srt(a.srt)
        elif a.transcrever:
            trans = transcrever(video, a.modelo, a.idioma)
            if trans is None:
                print("AVISO: nenhum Whisper instalado. Instale com: pip install faster-whisper", file=sys.stderr)
        if trans:
            trans["suspeitas"] = muletas_e_repeticoes(trans)
            tpath = os.path.join(a.saida, f"transcricao_{cid}.json")
            json.dump(trans, open(tpath, "w"), ensure_ascii=False, indent=1)
            info["transcricao"] = tpath
            transcricoes[cid] = tpath

        json.dump(info, open(os.path.join(a.saida, f"analise_{cid}.json"), "w"), ensure_ascii=False, indent=1)
        clipes[cid] = info["arquivo"]
        for i, (ini, fim) in enumerate(info["trechos_de_fala"]):
            segmentos_plano.append({"clipe": cid, "inicio": ini, "fim": fim,
                                    "zoom": 1.0 if len(segmentos_plano) % 2 == 0 else 1.12, "foco": [0.5, 0.4]})
        print(f"[{cid}] {video}: {info['duracao']:.1f}s, {info['largura']}x{info['altura']}, "
              f"{len(sil)} silêncios, fala útil {fala_total:.1f}s" + (", transcrito" if trans else ""))

    if a.plano:
        plano = {
            "clipes": clipes,
            "transcricoes": transcricoes,
            "formato": {"largura": 1080, "altura": 1920, "fps": 30},
            "estilo": a.estilo,
            "segmentos": segmentos_plano,
            "legendas": {"ativo": bool(transcricoes)},
            "titulos": [], "stickers": [], "sobreposicoes": [], "efeitos": [],
            "audio": {"normalizar": True},
        }
        p = os.path.join(a.saida, "plano_rascunho.json")
        json.dump(plano, open(p, "w"), ensure_ascii=False, indent=1)
        print(f"Rascunho do plano: {p}")


if __name__ == "__main__":
    main()
