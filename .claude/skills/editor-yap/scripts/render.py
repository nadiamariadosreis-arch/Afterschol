#!/usr/bin/env python3
"""Renderiza um vídeo yap a partir de um plano de edição (plano.json).

Uso:
  python3 render.py plano.json --saida final.mp4 [--previa] [--quadros 1.5,4,9.2]

O formato do plano está em references/plano.md. Resumo do que é feito:
  1. cada segmento (trecho mantido de um clipe) é cortado, enquadrado em 9:16 e recebe zoom
  2. os segmentos são concatenados (jump cuts)
  3. num passe final entram: cor, efeitos, sobreposições/b-roll, stickers, legendas,
     títulos, barra de progresso, música com ducking, efeitos sonoros e normalização.

Todos os tempos do plano (t) estão no tempo ORIGINAL do clipe; o script converte para o
tempo do vídeo final, considerando os cortes. Use "t_saida" para tempo já no vídeo final,
ou "na_palavra" para ancorar no momento em que uma palavra é dita.
"""
import argparse
import hashlib
import json
import math
import os
import re
import shutil
import subprocess
import sys
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
FONTES = os.path.join(RAIZ, "assets", "fonts")
ESTILOS = json.load(open(os.path.join(RAIZ, "assets", "estilos.json"), encoding="utf-8"))

ARQ_FONTE = {
    "Anton": "Anton-Regular.ttf", "Bebas Neue": "BebasNeue-Regular.ttf",
    "Poppins": "Poppins-Bold.ttf", "Poppins SemiBold": "Poppins-SemiBold.ttf",
    "Poppins Bold": "Poppins-Bold.ttf", "Poppins Black": "Poppins-Black.ttf",
    "Caveat": "Caveat-Variable.ttf", "Playfair Display": "PlayfairDisplay-Variable.ttf",
    "Montserrat": "Montserrat-Variable.ttf",
}

GRADES = {
    "vibrante": "eq=saturation=1.22:contrast=1.06",
    "quente": "colorbalance=rs=0.05:gs=0.01:bs=-0.05:rm=0.03:bm=-0.03,eq=saturation=1.08",
    "frio": "colorbalance=rs=-0.03:bs=0.05:bm=0.02,eq=contrast=1.05",
    "suave": "eq=contrast=0.94:saturation=0.9:brightness=0.02",
    "pb": "hue=s=0,eq=contrast=1.1",
    "neutro": "",
}

SONS = {
    "pop": "aevalsrc='0.8*sin(2*PI*(500+1800*exp(-t*45))*t)*exp(-t*22)':d=0.18:s=48000",
    "ding": "aevalsrc='0.5*sin(2*PI*1320*t)*exp(-t*5)+0.25*sin(2*PI*2640*t)*exp(-t*7)':d=0.9:s=48000",
    "click": "aevalsrc='0.7*sin(2*PI*2200*t)*exp(-t*120)':d=0.06:s=48000",
    "boom": "aevalsrc='0.9*sin(2*PI*(55+60*exp(-t*12))*t)*exp(-t*4)':d=0.9:s=48000",
    "whoosh": "anoisesrc=d=0.45:c=pink:a=0.6:r=48000,highpass=f=500,lowpass=f=4000,afade=t=in:d=0.22,afade=t=out:st=0.22:d=0.23",
}


# ---------------------------------------------------------------- utilidades
def run(cmd, quiet=True):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("COMANDO FALHOU:\n" + " ".join(cmd)[:3000] + "\n" + r.stderr[-3000:], file=sys.stderr)
        sys.exit(1)
    return r


def duracao(arq):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", arq])
    return float(r.stdout.strip())


def tem_audio(arq):
    r = run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", arq])
    return bool(r.stdout.strip())


def norm(p):
    p = unicodedata.normalize("NFKD", p.lower())
    p = "".join(c for c in p if not unicodedata.combining(c))
    return re.sub(r"[^\w]", "", p)


def hexrgba(cor):
    """'#RRGGBB' ou '#RRGGBBAA' (AA = opacidade) -> (r,g,b,a 0-255)."""
    c = cor.lstrip("#")
    r, g, b = int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)
    a = int(c[6:8], 16) if len(c) == 8 else 255
    return r, g, b, a


def ass_cor(cor):
    r, g, b, a = hexrgba(cor)
    return f"&H{255 - a:02X}{b:02X}{g:02X}{r:02X}"


def ass_cor_inline(cor):
    r, g, b, _ = hexrgba(cor)
    return f"&H{b:02X}{g:02X}{r:02X}&"


def ass_esc(t):
    return t.replace("\\", "\\\\").replace("{", "(").replace("}", ")").replace("\n", "\\N")


def ass_ts(s):
    s = max(0.0, s)
    h = int(s // 3600)
    m = int(s % 3600 // 60)
    return f"{h}:{m:02d}:{s % 60:05.2f}"


def caminho_fonte(nome):
    if nome in ARQ_FONTE:
        return os.path.join(FONTES, ARQ_FONTE[nome])
    r = subprocess.run(["fc-match", "-f", "%{file}", nome], capture_output=True, text=True)
    return r.stdout.strip() or os.path.join(FONTES, "Poppins-Bold.ttf")


def familia_ass(nome):
    """Separa 'Poppins Black' em família 'Poppins' + peso, que é como o libass escolhe."""
    pesos = {"Black": 900, "Bold": 700, "SemiBold": 600}
    for k, v in pesos.items():
        if nome.endswith(" " + k) and nome != "Bebas Neue":
            return nome[: -len(k) - 1], v
    return nome, 700 if nome in ("Montserrat", "Playfair Display", "Caveat") else 400


def mesclar(base, extra):
    out = dict(base)
    for k, v in (extra or {}).items():
        out[k] = mesclar(out[k], v) if isinstance(v, dict) and isinstance(out.get(k), dict) else v
    return out


# ---------------------------------------------------------------- linha do tempo
class Linha:
    """Converte tempo do clipe original -> tempo no vídeo final."""

    def __init__(self, segs):
        self.segs = segs  # dicts com clipe, inicio, fim, saida, dur

    def mapear(self, clipe, t):
        for s in self.segs:
            if s["clipe"] == clipe and s["inicio"] <= t < s["fim"]:
                return s["saida"] + min(t - s["inicio"], s["dur"])
        depois = [s for s in self.segs if s["clipe"] == clipe and s["inicio"] > t]
        if depois:
            return min(depois, key=lambda s: s["inicio"])["saida"]
        return None


def carregar_palavras(plano, linha, correcoes):
    """Palavras transcritas que sobreviveram aos cortes, já no tempo final."""
    palavras = []
    for s in linha.segs:
        tpath = plano.get("transcricoes", {}).get(s["clipe"])
        if not tpath:
            continue
        trans = json.load(open(tpath, encoding="utf-8"))
        for p in trans["palavras"]:
            meio = (p["inicio"] + p["fim"]) / 2
            if s["inicio"] <= meio < s["fim"]:
                txt = p["w"]
                chave = norm(txt)
                for errado, certo in correcoes.items():
                    if norm(errado) == chave:
                        txt = re.sub(r"[\wÀ-ú]+", certo, txt, count=1) if certo else ""
                if not txt.strip():
                    continue
                a = s["saida"] + max(0.0, p["inicio"] - s["inicio"])
                b = s["saida"] + min(s["dur"], p["fim"] - s["inicio"])
                palavras.append({"w": txt.strip(), "inicio": a, "fim": max(b, a + 0.05)})
    palavras.sort(key=lambda p: p["inicio"])
    return palavras


def resolver_tempo(item, linha, palavras, clipe_padrao):
    if "t_saida" in item:
        return float(item["t_saida"])
    if "na_palavra" in item:
        alvo = norm(item["na_palavra"].split()[0])
        n = int(item.get("ocorrencia", 1))
        achadas = [p for p in palavras if norm(p["w"]) == alvo]
        if len(achadas) >= n:
            return achadas[n - 1]["inicio"] + float(item.get("deslocamento", 0))
        print(f"AVISO: palavra '{item['na_palavra']}' não encontrada nas legendas; item ignorado", file=sys.stderr)
        return None
    if "t" in item:
        t = linha.mapear(item.get("clipe", clipe_padrao), float(item["t"]))
        if t is None:
            print(f"AVISO: tempo {item['t']} caiu fora dos trechos mantidos; item ignorado", file=sys.stderr)
        return None if t is None else t + float(item.get("deslocamento", 0))
    return 0.0


# ---------------------------------------------------------------- 1) segmentos
def render_segmentos(plano, trab, W, H, fps, preset, crf):
    segs_out = []
    preencher = plano.get("formato", {}).get("preencher", "cortar")
    for i, s in enumerate(plano["segmentos"]):
        arq = plano["clipes"][s["clipe"]]
        ini, fim = float(s["inicio"]), float(s["fim"])
        dur = fim - ini
        z0 = float(s.get("zoom", 1.0))
        z1 = float(s.get("zoom_final", z0))
        fx, fy = s.get("foco", [0.5, 0.4])
        # zoom suave (ease in-out) do início ao fim do segmento
        Z = f"({z0}+({z1 - z0})*(1-cos(PI*min(t/{dur:.3f},1)))/2)" if z1 != z0 else f"{z0}"
        if preencher == "desfoque":
            vf = (f"split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=30:3[bg];"
                  f"[b]scale={W}:{H}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,"
                  f"scale=w='trunc({W}*{Z}/2)*2':h='trunc({H}*{Z}/2)*2':eval=frame,"
                  f"crop={W}:{H}:x='(iw-{W})*{fx}':y='(ih-{H})*{fy}'")
        else:
            k = f"max({W}/iw,{H}/ih)"
            vf = (f"scale=w='trunc(iw*{k}*{Z}/2)*2+2':h='trunc(ih*{k}*{Z}/2)*2+2':eval=frame:flags=lanczos,"
                  f"crop={W}:{H}:x='(iw-{W})*{fx}':y='(ih-{H})*{fy}'")
        vf += f",fps={fps},setsar=1,format=yuv420p"
        if s.get("espelhar"):
            vf += ",hflip"
        chave = hashlib.md5(json.dumps([arq, os.path.getmtime(arq), ini, fim, vf, preset, crf]).encode()).hexdigest()[:10]
        out = os.path.join(trab, f"seg_{i:03d}_{chave}.mp4")
        if not os.path.exists(out):
            cmd = ["ffmpeg", "-y", "-v", "error", "-ss", f"{ini:.3f}", "-t", f"{dur:.3f}", "-i", arq]
            fade_out = max(0.0, dur - 0.03)
            af = f"aresample=48000,aformat=channel_layouts=stereo,afade=t=in:d=0.015,afade=t=out:st={fade_out:.3f}:d=0.03"
            if tem_audio(arq):
                cmd += ["-filter_complex", f"[0:v]{vf}[v];[0:a]{af}[a]", "-map", "[v]", "-map", "[a]"]
            else:
                cmd += ["-f", "lavfi", "-t", f"{dur:.3f}", "-i", "anullsrc=r=48000:cl=stereo",
                        "-filter_complex", f"[0:v]{vf}[v]", "-map", "[v]", "-map", "1:a"]
            cmd += ["-c:v", "libx264", "-preset", preset, "-crf", str(crf), "-c:a", "aac", "-b:a", "192k",
                    "-ar", "48000", "-shortest", out]
            run(cmd)
        segs_out.append({"clipe": s["clipe"], "inicio": ini, "fim": fim, "arquivo": out})
    return segs_out


def concatenar(segs, trab):
    lista = os.path.join(trab, "lista.txt")
    t = 0.0
    with open(lista, "w") as f:
        for s in segs:
            f.write(f"file '{s['arquivo']}'\n")
            s["dur"] = duracao(s["arquivo"])
            s["saida"] = t
            t += s["dur"]
    base = os.path.join(trab, "base.mp4")
    run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", base])
    return base, t


# ---------------------------------------------------------------- 2) legendas e títulos (ASS)
def montar_ass(plano, est, palavras, linha, W, H, total, clipe_padrao, sfx):
    leg = mesclar(est["legenda"], plano.get("legendas", {}).get("estilo", {}))
    tit = mesclar(est["titulo"], plano.get("estilo_titulo", {}))

    def estilo(nome, e, alinhamento=5):
        fam, peso = familia_ass(e["fonte"])
        caixa = e.get("caixa")
        cor_caixa = e.get("cor_caixa", "#000000AA")
        borda = 3 if caixa else 1
        outline = ass_cor(cor_caixa) if caixa else ass_cor(e.get("contorno", "#000000"))
        back = ass_cor(cor_caixa) if caixa else "&H80000000"
        espess = 18 if caixa else e.get("espessura_contorno", 4)
        bold = -1 if peso >= 700 else 0
        return (f"Style: {nome},{fam},{e['tamanho']},{ass_cor(e['cor'])},{ass_cor(e['cor'])},{outline},{back},"
                f"{bold},0,0,0,100,100,0,0,{borda},{espess},{e.get('sombra', 0)},{alinhamento},70,70,60,1")

    linhas = [
        "[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}",
        "WrapStyle: 0", "ScaledBorderAndShadow: yes", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, "
        "Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        estilo("Legenda", leg), estilo("Titulo", tit), "",
        "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]

    def peso_tag(e):
        _, p = familia_ass(e["fonte"])
        return f"\\b{p}" if p not in (400, 700) else ""

    # ---- legendas
    cfg = plano.get("legendas", {})
    if cfg.get("ativo", True) and palavras:
        n = int(cfg.get("palavras_por_bloco", leg["palavras_por_bloco"]))
        destaque_fixo = {norm(p) for p in cfg.get("palavras_destaque", [])}
        ocultar = [(resolver_tempo(o, linha, palavras, clipe_padrao), float(o.get("duracao", 2)))
                   for o in cfg.get("ocultar", [])]
        y = int(H * float(cfg.get("posicao_y", leg["posicao_y"])))
        blocos, atual = [], []
        for i, p in enumerate(palavras):
            quebra = atual and (len(atual) >= n or p["inicio"] - atual[-1]["fim"] > 0.6
                                or re.search(r"[.!?]$", atual[-1]["w"]))
            if quebra:
                blocos.append(atual)
                atual = []
            atual.append(p)
        if atual:
            blocos.append(atual)
        tag_base = f"\\an5\\pos({W // 2},{y}){peso_tag(leg)}"
        cor_d = ass_cor_inline(leg["destaque"])
        cor_n = ass_cor_inline(leg["cor"])
        for bi, bloco in enumerate(blocos):
            prox_bloco = blocos[bi + 1][0]["inicio"] if bi + 1 < len(blocos) else total
            for wi, p in enumerate(bloco):
                ini = p["inicio"]
                fim = bloco[wi + 1]["inicio"] if wi + 1 < len(bloco) else min(p["fim"] + 0.35, prox_bloco)
                if any(o[0] is not None and o[0] <= ini < o[0] + o[1] for o in ocultar):
                    continue
                partes = []
                for wj, q in enumerate(bloco):
                    txt = q["w"]
                    if cfg.get("remover_pontuacao", True):
                        txt = re.sub(r"[,.;:]+$", "", txt)
                    if cfg.get("maiusculas", leg["maiusculas"]):
                        txt = txt.upper()
                    txt = ass_esc(txt)
                    if wj == wi and cfg.get("destacar_palavra_ativa", True):
                        pop = "\\fscx118\\fscy118\\t(0,90,\\fscx108\\fscy108)" if leg.get("pop") else ""
                        partes.append(f"{{\\c{cor_d}{pop}}}{txt}{{\\c{cor_n}\\fscx100\\fscy100}}")
                    elif norm(q["w"]) in destaque_fixo:
                        partes.append(f"{{\\c{cor_d}}}{txt}{{\\c{cor_n}}}")
                    else:
                        partes.append(txt)
                linhas.append(f"Dialogue: 1,{ass_ts(ini)},{ass_ts(fim)},Legenda,,0,0,0,,{{{tag_base}}}{' '.join(partes)}")
    for m in cfg.get("manuais", []):
        t = resolver_tempo(m, linha, palavras, clipe_padrao)
        if t is not None:
            y = int(H * float(cfg.get("posicao_y", leg["posicao_y"])))
            linhas.append(f"Dialogue: 1,{ass_ts(t)},{ass_ts(t + float(m.get('duracao', 2)))},Legenda,,0,0,0,,"
                          f"{{\\an5\\pos({W // 2},{y})}}{ass_esc(m['texto'])}")

    # ---- títulos
    posy = {"topo": 0.17, "centro": 0.45, "baixo": 0.84}
    for ti in plano.get("titulos", []):
        t = resolver_tempo(ti, linha, palavras, clipe_padrao)
        if t is None:
            continue
        d = float(ti.get("duracao", 3))
        e = mesclar(tit, ti.get("estilo", {}))
        texto = ti["texto"].upper() if e.get("maiusculas") else ti["texto"]
        texto = ass_esc(texto)
        cor_acento = ass_cor_inline(ti.get("cor_destaque", est["legenda"]["destaque"]))
        cor_txt = ass_cor_inline(e["cor"])
        texto = re.sub(r"\*(.+?)\*", lambda m: f"{{\\c{cor_acento}}}{m.group(1)}{{\\c{cor_txt}}}", texto)
        x = int(W * float(ti.get("x", 0.5)))
        p = ti.get("posicao", "topo")
        y = int(H * (float(p) if isinstance(p, (int, float)) else posy.get(p, 0.17)))
        tags = f"\\an5{peso_tag(e)}"
        if "tamanho" in ti:
            tags += f"\\fs{ti['tamanho']}"
        if ti.get("fonte"):
            fam, pw = familia_ass(ti["fonte"])
            tags += f"\\fn{fam}\\b{pw}"
        if ti.get("cor"):
            tags += f"\\c{ass_cor_inline(ti['cor'])}"
        if ti.get("rotacao"):
            tags += f"\\frz{ti['rotacao']}"
        anim = ti.get("animacao", "pop")
        if anim == "pop":
            tags += f"\\pos({x},{y})\\fscx0\\fscy0\\t(0,140,\\fscx112\\fscy112)\\t(140,240,\\fscx100\\fscy100)\\fad(0,180)"
        elif anim == "subir":
            tags += f"\\move({x},{y + 90},{x},{y},0,260)\\fad(160,180)"
        elif anim == "deslizar":
            tags += f"\\move({-W // 2},{y},{x},{y},0,280)\\fad(0,180)"
        elif anim == "fade":
            tags += f"\\pos({x},{y})\\fad(300,300)"
        else:
            tags += f"\\pos({x},{y})"
        if anim == "digitar":
            limpo = re.sub(r"\{[^}]*\}", "", texto)
            passo = min(0.05, (d * 0.5) / max(1, len(limpo)))
            for k in range(1, len(limpo) + 1):
                a = t + (k - 1) * passo
                b = t + k * passo if k < len(limpo) else t + d
                linhas.append(f"Dialogue: 2,{ass_ts(a)},{ass_ts(b)},Titulo,,0,0,0,,{{{tags}}}{limpo[:k]}")
        else:
            linhas.append(f"Dialogue: 2,{ass_ts(t)},{ass_ts(t + d)},Titulo,,0,0,0,,{{{tags}}}{texto}")
        if ti.get("som"):
            sfx.append({"som": ti["som"], "t_saida": t, "volume": ti.get("volume_som", 0.6)})
    return "\n".join(linhas) + "\n"


# ---------------------------------------------------------------- 3) stickers (Pillow -> .mov com alfa)
def imagem_sticker(st, est, escala):
    from PIL import Image, ImageDraw, ImageFont
    tam = int(float(st.get("tamanho", 220)) * escala)
    tipo = st.get("tipo", "emoji")
    if tipo == "emoji":
        fonte = None
        for nome in ("Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji"):
            arq = subprocess.run(["fc-match", "-f", "%{file}", nome], capture_output=True, text=True).stdout.strip()
            if arq and "emoji" in arq.lower():
                for sz in (109, 160, 137, 96, 64):
                    try:
                        fonte = ImageFont.truetype(arq, sz)
                        break
                    except OSError:
                        continue
            if fonte:
                break
        if not fonte:
            print("AVISO: nenhuma fonte de emoji colorido encontrada; sticker ignorado", file=sys.stderr)
            return None
        img = Image.new("RGBA", (fonte.size * 2 * max(1, len(st["valor"])), fonte.size * 2), (0, 0, 0, 0))
        ImageDraw.Draw(img).text((fonte.size // 2, fonte.size // 2), st["valor"], font=fonte, embedded_color=True)
        img = img.crop(img.getbbox())
    elif tipo == "imagem":
        img = Image.open(st["arquivo"]).convert("RGBA")
    elif tipo == "selo":
        cfg = mesclar(est["selo"], st)
        f = ImageFont.truetype(caminho_fonte(cfg["fonte"]), int(st.get("tamanho_fonte", 64) * escala))
        texto = st["texto"].upper() if st.get("maiusculas", True) else st["texto"]
        bb = ImageDraw.Draw(Image.new("RGBA", (1, 1))).textbbox((0, 0), texto, font=f)
        pw, ph = int(36 * escala), int(20 * escala)
        img = Image.new("RGBA", (bb[2] - bb[0] + 2 * pw, bb[3] - bb[1] + 2 * ph), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.rounded_rectangle([0, 0, img.width - 1, img.height - 1], radius=int(img.height * 0.35),
                            fill=hexrgba(cfg["cor_fundo"]))
        d.text((pw - bb[0], ph - bb[1]), texto, font=f, fill=hexrgba(cfg["cor_texto"]))
        return img
    elif tipo == "seta":
        cor = hexrgba(st.get("cor", est["legenda"]["destaque"]))
        img = Image.new("RGBA", (400, 400), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.polygon([(40, 160), (240, 160), (240, 80), (370, 200), (240, 320), (240, 240), (40, 240)],
                  fill=cor, outline=(0, 0, 0, 255), width=10)
        rot = {"direita": 0, "cima": 90, "esquerda": 180, "baixo": 270}.get(st.get("direcao", "direita"), 0)
        img = img.rotate(rot, expand=True)
    else:
        sys.exit(f"tipo de sticker desconhecido: {tipo}")
    r = tam / max(img.width, img.height)
    return img.resize((max(2, int(img.width * r)), max(2, int(img.height * r))), Image.LANCZOS)


def animar_sticker(img, st, fps, dur, saida):
    """Gera um .mov (PNG com alfa) com a animação do sticker num quadro de tamanho fixo."""
    from PIL import Image
    anim = st.get("animacao", "pop")
    rot_base = float(st.get("rotacao", 0))
    margem = 1.5
    cw = int(max(img.width, img.height) * margem) // 2 * 2
    ch = cw
    n = max(1, int(round(dur * fps)))
    proc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{cw}x{ch}",
                             "-r", str(fps), "-i", "-", "-c:v", "png", saida], stdin=subprocess.PIPE)
    for k in range(n):
        tt = k / fps
        esc, alfa, dy, rot = 1.0, 1.0, 0.0, rot_base
        if anim in ("pop", "balancar", "flutuar"):
            u = min(1.0, tt / 0.28)
            esc = 1.15 * u / 0.7 if u < 0.7 else 1.15 - 0.15 * (u - 0.7) / 0.3
        if anim == "fade":
            alfa = min(1.0, tt / 0.25)
        if anim == "flutuar":
            dy = 0.04 * ch * math.sin(2 * math.pi * tt / 1.6)
        if anim == "balancar":
            rot += 8 * math.sin(2 * math.pi * tt / 0.9)
        restante = dur - tt
        if restante < 0.2:
            alfa *= max(0.0, restante / 0.2)
            if anim == "pop":
                esc *= 0.8 + 0.2 * max(0.0, restante / 0.2)
        quadro = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
        if esc > 0.01 and alfa > 0.01:
            im = img.resize((max(1, int(img.width * esc)), max(1, int(img.height * esc))), Image.BILINEAR)
            if rot:
                im = im.rotate(rot, expand=True, resample=Image.BICUBIC)
            if alfa < 1:
                a = im.getchannel("A").point(lambda v: int(v * alfa))
                im.putalpha(a)
            quadro.alpha_composite(im, ((cw - im.width) // 2, int((ch - im.height) // 2 + dy)))
        proc.stdin.write(quadro.tobytes())
    proc.stdin.close()
    proc.wait()
    return cw, ch


# ---------------------------------------------------------------- 4) passe final
def passe_final(plano, est, base, total, ass_path, linha, palavras, trab, W, H, fps, escala,
                preset, crf, saida, clipe_padrao, sfx):
    entradas = ["-i", base]
    nxt = 1
    fc = []
    v = "[0:v]"

    def novo(rotulo):
        return f"[{rotulo}]"

    # cor global + vinheta
    cor = plano.get("cor", est.get("cor", "neutro"))
    filtros = [GRADES.get(cor, cor)] if GRADES.get(cor, cor) else []
    efeitos = plano.get("efeitos", [])
    for e in efeitos:
        if e["tipo"] == "vinheta":
            filtros.append("vignette=PI/5")
    for e in efeitos:
        if e["tipo"] == "pb":
            t = resolver_tempo(e, linha, palavras, clipe_padrao)
            if t is not None:
                filtros.append(f"hue=s=0:enable='between(t,{t:.3f},{t + float(e.get('duracao', 1.5)):.3f})'")
    if filtros:
        fc.append(f"{v}{','.join(filtros)}[cor]")
        v = "[cor]"

    # zoom de impacto e tremor (sobre o vídeo já montado)
    zs, shakes = [], []
    for e in efeitos:
        if e["tipo"] in ("zoom_impacto", "tremor"):
            t = resolver_tempo(e, linha, palavras, clipe_padrao)
            if t is None:
                continue
            d = float(e.get("duracao", 0.6 if e["tipo"] == "zoom_impacto" else 0.4))
            if e["tipo"] == "zoom_impacto":
                amt = float(e.get("intensidade", 0.18))
                zs.append(f"{amt}*between(t,{t:.3f},{t + d:.3f})*sin(PI*min((t-{t:.3f})/0.12,1)/2)")
            else:
                shakes.append((t, d, float(e.get("intensidade", 14)) * escala))
            if e.get("som"):
                sfx.append({"som": e["som"], "t_saida": t, "volume": e.get("volume_som", 0.6)})
    if zs or shakes:
        Z = "1" + "".join("+" + z for z in zs) + ("+0.04" if shakes else "")
        sx = "+".join(f"between(t,{a:.3f},{a + d:.3f})*{amp}*sin(t*73)" for a, d, amp in shakes) or "0"
        sy = "+".join(f"between(t,{a:.3f},{a + d:.3f})*{amp}*cos(t*61)" for a, d, amp in shakes) or "0"
        fc.append(f"{v}scale=w='trunc({W}*({Z})/2)*2':h='trunc({H}*({Z})/2)*2':eval=frame,"
                  f"crop={W}:{H}:x='(iw-{W})/2+({sx})':y='(ih-{H})/2+({sy})'[zi]")
        v = "[zi]"

    # sobreposições (b-roll, imagens, prints)
    for j, ob in enumerate(plano.get("sobreposicoes", [])):
        t = resolver_tempo(ob, linha, palavras, clipe_padrao)
        if t is None:
            continue
        d = float(ob.get("duracao", 3))
        arq = ob["arquivo"]
        e_img = arq.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))
        if e_img:
            entradas += ["-loop", "1", "-framerate", str(fps), "-t", f"{d:.3f}", "-i", arq]
        else:
            entradas += ["-ss", str(ob.get("inicio", 0)), "-t", f"{d:.3f}", "-i", arq]
        modo = ob.get("modo", "tela_cheia")
        if modo == "tela_cheia":
            ow, oh, x, y = W, H, 0, 0
        else:
            ow = int(W * float(ob.get("largura", 0.8))) // 2 * 2
            oh = int(ow * float(ob.get("proporcao", 9 / 16 if modo == "janela" else 1))) // 2 * 2
            if modo == "janela" and "proporcao" not in ob:
                oh = int(ow * 9 / 16) // 2 * 2
            x = int(W * float(ob.get("x", 0.5)) - ow / 2)
            y = int(H * float(ob.get("y", 0.3)) - oh / 2)
        kb = float(ob.get("ken_burns", 0.08 if e_img else 0))
        Z = f"(1+{kb}*t/{d:.3f})"
        borda = int(ob.get("borda", 0) * escala)
        cadeia = (f"[{nxt}:v]scale=w='trunc(iw*max({ow}/iw,{oh}/ih)*{Z}/2)*2+2':h='trunc(ih*max({ow}/iw,{oh}/ih)*{Z}/2)*2+2':eval=frame,"
                  f"crop={ow}:{oh},fps={fps},setsar=1")
        if borda:
            cadeia += f",pad={ow + 2 * borda}:{oh + 2 * borda}:{borda}:{borda}:color={ob.get('cor_borda', '#FFFFFF')}"
            x -= borda
            y -= borda
        cadeia += (f",format=yuva420p,colorchannelmixer=aa={float(ob.get('opacidade', 1))},"
                   f"fade=t=in:st=0:d=0.15:alpha=1,fade=t=out:st={max(0, d - 0.15):.3f}:d=0.15:alpha=1,"
                   f"setpts=PTS-STARTPTS+{t:.3f}/TB[ob{j}]")
        fc.append(cadeia)
        fc.append(f"{v}[ob{j}]overlay=x={x}:y={y}:eof_action=pass:enable='between(t,{t:.3f},{t + d:.3f})'[vob{j}]")
        v = f"[vob{j}]"
        nxt += 1
        if ob.get("som"):
            sfx.append({"som": ob["som"], "t_saida": t, "volume": ob.get("volume_som", 0.5)})

    # stickers
    for j, st in enumerate(plano.get("stickers", [])):
        t = resolver_tempo(st, linha, palavras, clipe_padrao)
        if t is None:
            continue
        d = float(st.get("duracao", 2))
        img = imagem_sticker(st, est, escala)
        if img is None:
            continue
        mov = os.path.join(trab, f"sticker_{j}.mov")
        cw, ch = animar_sticker(img, st, fps, d, mov)
        entradas += ["-i", mov]
        x = int(W * float(st.get("x", 0.8)) - cw / 2)
        y = int(H * float(st.get("y", 0.3)) - ch / 2)
        fc.append(f"[{nxt}:v]setpts=PTS-STARTPTS+{t:.3f}/TB[st{j}]")
        fc.append(f"{v}[st{j}]overlay=x={x}:y={y}:eof_action=pass:enable='between(t,{t:.3f},{t + d:.3f})'[vst{j}]")
        v = f"[vst{j}]"
        nxt += 1
        if st.get("som"):
            sfx.append({"som": st["som"], "t_saida": t, "volume": st.get("volume_som", 0.6)})

    # legendas + títulos
    esc_ass = ass_path.replace("\\", "/").replace(":", "\\:").replace("'", "\\'")
    esc_fon = FONTES.replace(":", "\\:").replace("'", "\\'")
    fc.append(f"{v}ass='{esc_ass}':fontsdir='{esc_fon}'[leg]")
    v = "[leg]"

    # flashes
    for j, e in enumerate([e for e in efeitos if e["tipo"] == "flash"]):
        t = resolver_tempo(e, linha, palavras, clipe_padrao)
        if t is None:
            continue
        d = float(e.get("duracao", 0.25))
        fc.append(f"color=c={e.get('cor', 'white')}:s={W}x{H}:d={d}:r={fps},format=rgba,"
                  f"fade=t=out:st=0:d={d}:alpha=1,setpts=PTS-STARTPTS+{t:.3f}/TB[fl{j}]")
        fc.append(f"{v}[fl{j}]overlay=eof_action=pass[vfl{j}]")
        v = f"[vfl{j}]"
        if e.get("som"):
            sfx.append({"som": e["som"], "t_saida": t, "volume": e.get("volume_som", 0.5)})

    # barra de progresso
    bp = plano.get("barra_progresso")
    if bp:
        bp = {} if bp is True else bp
        alt = int(bp.get("altura", 12) * escala)
        corb = bp.get("cor", est["legenda"]["destaque"])
        yb = 0 if bp.get("posicao", "baixo") == "topo" else H - alt
        fc.append(f"color=c={corb}:s={W}x{alt}:d={total:.3f}:r={fps}[pb]")
        fc.append(f"{v}[pb]overlay=x='-{W}+{W}*t/{total:.3f}':y={yb}:shortest=1[vpb]")
        v = "[vpb]"

    # fades de entrada e saída
    fades = []
    if plano.get("fade_entrada"):
        fades.append("fade=t=in:st=0:d=0.3")
    if plano.get("fade_saida", False):
        fades.append(f"fade=t=out:st={max(0, total - 0.5):.3f}:d=0.5")
    fc.append(f"{v}{','.join(fades + ['format=yuv420p'])}[vout]")

    # ---------------- áudio
    audio = plano.get("audio", {})
    a = "[0:a]"
    fc_a = []
    if audio.get("volume_voz", 1) != 1:
        fc_a.append(f"{a}volume={audio['volume_voz']}[voz0]")
        a = "[voz0]"
    mix = []
    if audio.get("musica"):
        entradas += ["-stream_loop", "-1", "-i", audio["musica"]]
        vol = float(audio.get("volume_musica", 0.12))
        fc_a.append(f"[{nxt}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{total:.3f},volume={vol},"
                    f"afade=t=in:d=1,afade=t=out:st={max(0, total - 1.5):.3f}:d=1.5[mus]")
        if audio.get("ducking", True):
            fc_a.append(f"{a}asplit=2[voz][vozsc]")
            fc_a.append("[mus][vozsc]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350[musd]")
            a, mus = "[voz]", "[musd]"
        else:
            mus = "[mus]"
        mix.append(mus)
        nxt += 1
    sfx_todos = sfx + plano.get("efeitos_sonoros", [])
    for k, s in enumerate(sfx_todos):
        t = resolver_tempo(s, linha, palavras, clipe_padrao)
        if t is None:
            continue
        if s.get("arquivo"):
            entradas += ["-i", s["arquivo"]]
        elif s.get("som") in SONS:
            entradas += ["-f", "lavfi", "-i", SONS[s["som"]]]
        else:
            print(f"AVISO: som '{s.get('som')}' desconhecido (use {list(SONS)} ou 'arquivo')", file=sys.stderr)
            continue
        ms = int(t * 1000)
        fc_a.append(f"[{nxt}:a]aresample=48000,aformat=channel_layouts=stereo,volume={float(s.get('volume', 0.5))},"
                    f"adelay={ms}|{ms}[sfx{k}]")
        mix.append(f"[sfx{k}]")
        nxt += 1
    if mix:
        fc_a.append(f"{a}{''.join(mix)}amix=inputs={1 + len(mix)}:duration=first:normalize=0[amix]")
        a = "[amix]"
    if audio.get("normalizar", True):
        fc_a.append(f"{a}loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[aout]")
    else:
        fc_a.append(f"{a}anull[aout]")

    script = os.path.join(trab, "filtro.txt")
    open(script, "w").write(";\n".join(fc + fc_a))
    cmd = ["ffmpeg", "-y", "-v", "error"] + entradas + ["-filter_complex_script", script, "-map", "[vout]",
                                                       "-map", "[aout]", "-t", f"{total:.3f}", "-r", str(fps),
                                                       "-c:v", "libx264", "-preset", preset, "-crf", str(crf),
                                                       "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                                                       "-movflags", "+faststart", saida]
    run(cmd)


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("plano")
    ap.add_argument("--saida", default="final.mp4")
    ap.add_argument("--previa", action="store_true", help="metade da resolução, encode rápido")
    ap.add_argument("--quadros", help="tempos (s) do vídeo final para salvar como PNG, ex: 0.5,3,8.2")
    ap.add_argument("--trabalho", help="pasta de arquivos temporários (padrão: ao lado do plano)")
    a = ap.parse_args()

    plano = json.load(open(a.plano, encoding="utf-8"))
    pasta_plano = os.path.dirname(os.path.abspath(a.plano))
    os.chdir(pasta_plano)  # caminhos relativos do plano são relativos ao próprio plano
    fmt = plano.get("formato", {})
    escala = 0.5 if a.previa else 1.0
    W = int(fmt.get("largura", 1080) * escala) // 2 * 2
    H = int(fmt.get("altura", 1920) * escala) // 2 * 2
    fps = int(fmt.get("fps", 30))
    preset, crf = ("ultrafast", 28) if a.previa else ("medium", 18)
    trab = a.trabalho or os.path.join(pasta_plano, "_trabalho" + ("_previa" if a.previa else ""))
    os.makedirs(trab, exist_ok=True)

    # "estilo" pode ser o nome de um preset ou {"base": "viral", "legenda": {...}, ...} com ajustes
    nome_est = plano.get("estilo", "viral")
    if isinstance(nome_est, dict):
        est = mesclar(ESTILOS[nome_est.get("base", "viral")], {k: v for k, v in nome_est.items() if k != "base"})
    else:
        if nome_est not in ESTILOS:
            print(f"AVISO: estilo '{nome_est}' não existe; usando 'viral'", file=sys.stderr)
        est = ESTILOS.get(nome_est, ESTILOS["viral"])
    clipe_padrao = next(iter(plano["clipes"]))

    print(f"[1/3] Cortando e enquadrando {len(plano['segmentos'])} segmentos...")
    segs = render_segmentos(plano, trab, W, H, fps, preset, crf)
    base, total = concatenar(segs, trab)
    linha = Linha(segs)
    palavras = carregar_palavras(plano, linha, plano.get("legendas", {}).get("correcoes", {}))

    print(f"[2/3] Legendas e títulos ({len(palavras)} palavras, {total:.1f}s)...")
    sfx = []
    Wf, Hf = int(fmt.get("largura", 1080)), int(fmt.get("altura", 1920))
    ass = montar_ass(plano, est, palavras, linha, Wf, Hf, total, clipe_padrao, sfx)
    ass_path = os.path.join(trab, "legendas.ass")
    open(ass_path, "w", encoding="utf-8").write(ass)

    print("[3/3] Efeitos, stickers, áudio e exportação...")
    saida = os.path.abspath(a.saida)
    passe_final(plano, est, base, total, ass_path, linha, palavras, trab, W, H, fps, escala,
                preset, crf, saida, clipe_padrao, sfx)
    print(f"Pronto: {saida} ({total:.1f}s, {W}x{H})")

    if a.quadros:
        raiz, _ = os.path.splitext(saida)
        for t in a.quadros.split(","):
            png = f"{raiz}_quadro_{float(t):.1f}s.png"
            run(["ffmpeg", "-y", "-v", "error", "-ss", t, "-i", saida, "-frames:v", "1", "-vf", "scale=-2:960", png])
            print(f"Quadro: {png}")


if __name__ == "__main__":
    main()
