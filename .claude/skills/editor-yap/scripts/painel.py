#!/usr/bin/env python3
"""Monta a Mesa de Edição (painel.html): a página onde a pessoa decide o próprio vídeo.

Nela a pessoa escolhe o gancho e edita o roteiro, corta palavras e trechos, escolhe estilo,
fontes e cores, edita títulos, stickers, efeitos e música, e escreve o post (legenda, hashtags, capa).
No fim, ela copia as escolhas ("PLANO-YAP ...") e cola no chat; salve como plano.json e renderize.

Uso:
  python3 painel.py --plano trab/plano.json [--roteiro roteiro.json] [--nome "Reels finanças"] --saida painel.html
  python3 painel.py --roteiro roteiro.json --saida painel.html          # só roteiro, antes de gravar
  python3 painel.py --saida exemplo.html                                # painel de exemplo
  --local   gera um arquivo completo para abrir direto no navegador (fora do Artifact)

roteiro.json: {"ganchos": ["...", "..."], "gancho": 0, "texto": "roteiro com [MARCAÇÕES]"}
O plano pode trazer "post": {"legenda": "...", "hashtags": [...], "capa": {"texto": "...", "t_saida": 0.5}}.
"""
import argparse
import base64
import json
import os
import subprocess
import tempfile

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)


def quadro_base64(caminhos):
    for c in caminhos:
        if c and os.path.exists(c):
            with tempfile.TemporaryDirectory() as tmp:
                out = os.path.join(tmp, "q.jpg")
                r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", c, "-vf", "scale=-2:720", "-q:v", "5", out])
                if r.returncode == 0:
                    return "data:image/jpeg;base64," + base64.b64encode(open(out, "rb").read()).decode()
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--plano")
    ap.add_argument("--roteiro")
    ap.add_argument("--nome")
    ap.add_argument("--saida", required=True)
    ap.add_argument("--local", action="store_true")
    a = ap.parse_args()

    modelo = open(os.path.join(RAIZ, "assets", "painel.html"), encoding="utf-8").read()
    estilos = open(os.path.join(RAIZ, "assets", "estilos.json"), encoding="utf-8").read()
    fontes = open(os.path.join(RAIZ, "assets", "fontes.json"), encoding="utf-8").read()
    html = modelo.replace("/*__ESTILOS__*/{}", estilos).replace("/*__FONTES__*/{}", fontes)

    dados = None
    if a.plano or a.roteiro:
        plano = {"clipes": {}, "segmentos": [], "formato": {"largura": 1080, "altura": 1920, "fps": 30},
                 "estilo": "viral", "legendas": {"ativo": True}}
        pasta = os.getcwd()
        if a.plano:
            plano = json.load(open(a.plano, encoding="utf-8"))
            pasta = os.path.dirname(os.path.abspath(a.plano))
        transcricoes, quadros = {}, {}
        for cid, caminho in plano.get("transcricoes", {}).items():
            c = caminho if os.path.isabs(caminho) else os.path.join(pasta, caminho)
            if os.path.exists(c):
                t = json.load(open(c, encoding="utf-8"))
                transcricoes[cid] = {"palavras": t["palavras"], "suspeitas": t.get("suspeitas", [])}
        for cid, video in plano.get("clipes", {}).items():
            v = video if os.path.isabs(video) else os.path.join(pasta, video)
            dirs = {pasta} | {os.path.dirname(os.path.join(pasta, p)) for p in plano.get("transcricoes", {}).values()}
            q = quadro_base64([os.path.join(d, f"quadro_{cid}.jpg") for d in dirs] + [v])
            if q:
                quadros[cid] = q
        roteiro = json.load(open(a.roteiro, encoding="utf-8")) if a.roteiro else None
        dados = {"nome": a.nome or "Mesa de Edição", "plano": plano, "transcricoes": transcricoes,
                 "quadros": quadros, "roteiro": roteiro, "post": plano.get("post")}
    html = html.replace("/*__DADOS__*/null", json.dumps(dados, ensure_ascii=False).replace("</", "<\\/"))
    if a.nome:
        html = html.replace("<title>Mesa de Edição Yap</title>", f"<title>Mesa · {a.nome}</title>", 1)
    if a.local:
        html = ('<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8">'
                '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
                '<style>body{margin:0}[hidden]{display:none!important}</style></head><body>\n' + html + "\n</body></html>")
    open(a.saida, "w", encoding="utf-8").write(html)
    print(f"Painel: {os.path.abspath(a.saida)} ({len(html) // 1024} KB)")


if __name__ == "__main__":
    main()
