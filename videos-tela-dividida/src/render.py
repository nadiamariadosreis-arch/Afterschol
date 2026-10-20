"""Renderiza os painéis de meia tela (1080x960) em MP4. Os tempos estão em segundos."""
import os, shutil, subprocess, sys
from playwright.sync_api import sync_playwright

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.dirname(AQUI)
FPS = 30

CAPA = "capa-carrossel.png"

VB = "0 0 1220 1064"
OVAIS = lambda t1, t2: [dict(cx=350, cy=158, rx=200, ry=48, t0=t1), dict(cx=253, cy=415, rx=108, ry=42, t0=t2)]

PARTE1 = dict(nome="parte1-explicacao", dur=34.125, scenes=[
    dict(**{"in": 0.2}, out=10.4, items=[
        dict(type="num", html="1", t0=0.3),
        dict(type="titulo", html="título ligado ao seu <em>material</em>", t0=0.7, dur=2.6),
        dict(type="mao", html="ex.: e-book da <u>Santa Missa</u>", t0=5.0),
    ]),
    dict(**{"in": 10.6}, out=14.5, items=[
        dict(type="capa", src=CAPA, t0=10.7, zoom=0.04, zoomDur=4),
    ]),
    dict(**{"in": 14.7}, out=21.3, items=[
        dict(type="mao", html="esse post me trouxe", t0=14.9),
        dict(type="valor", to=2500, prefix="+", t0=16.3, dur=1.6),
        dict(type="mao", html="seguidores no 1º dia", t0=17.3),
        dict(type="valor", to=600, prefix="+R$ ", t0=19.0, dur=1.2),
        dict(type="mao", html="em <u>vendas</u>", t0=20.0),
    ]),
    dict(**{"in": 21.5}, out=31.8, items=[
        dict(type="num", html="2", t0=21.6),
        dict(type="titulo", html="um <em>passo a passo</em> aplicável", t0=22.0, dur=2.8),
        dict(type="mao", html="eu não escondi <u>o ouro</u>", t0=25.4),
        dict(type="mao", html="só de ler, já sabia o que fazer", t0=27.2),
    ]),
    dict(**{"in": 32.0}, items=[
        dict(type="num", html="3", t0=32.1),
        dict(type="titulo", html="um caminho <em>ainda mais fácil</em>", t0=32.4, dur=1.6),
    ]),
])

PARTE2 = dict(nome="parte2-explicacao", dur=16.1675, scenes=[
    dict(**{"in": -3}, out=8.3, items=[
        dict(type="num", html="3", t0=-3),
        dict(type="titulo", html="um caminho <em>ainda mais fácil</em>", t0=-4, dur=1.0),
        dict(type="mao", html="para conseguir o que o título prometia", t0=3.8),
        dict(type="mao", html="o meu <u>material</u>", t0=6.6),
    ]),
    dict(**{"in": 8.5}, items=[
        dict(type="mao", html="e o resultado?", t0=8.6),
        dict(type="print", src="print-painel-vendas.png", vb=VB, w=720, ovais=OVAIS(10.1, 12.5), t0=9.4, zoom=0.03, zoomDur=6),
        dict(type="mao", html="só deste <u>material</u>", t0=14.4),
    ]),
])


PARTE3 = dict(nome="parte3-explicacao", dur=17.0, scenes=[
    dict(**{"in": 0.2}, out=4.3, items=[
        dict(type="mao", html="foi aí que eu percebi", t0=0.4),
        dict(type="titulo", html="uma coisa muito <em>interessante</em>", t0=1.4, dur=2.2),
    ]),
    dict(**{"in": 4.5}, out=7.6, items=[
        dict(type="titulo", html="comecei a <em>seguir</em> outra pessoa", t0=4.7, dur=2.2),
        dict(type="mao", html="no <u>Instagram</u>", t0=6.5),
    ]),
    dict(**{"in": 7.8}, out=11.5, items=[
        dict(type="mao", html="os conteúdos dela", t0=8.0),
        dict(type="cards", ts=[8.9, 9.6, 10.3]),
        dict(type="mao", html="um atrás do outro", t0=10.6),
    ]),
    dict(**{"in": 11.7}, items=[
        dict(type="mao", html="os stories dela ficavam", t0=11.9),
        dict(type="stories", ts=[12.4, 12.8, 13.2], tm=14.3, dur=1.6),
        dict(type="mao", html="<u>na frente</u> dos outros", t0=14.8),
    ]),
])


def renderiza(cfg, pagina, tmp):
    for it in [i for s in cfg["scenes"] for i in s["items"]]:
        pass
    total = int(round(cfg["dur"] * FPS))
    shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp)
    import json
    pagina.evaluate("cfg => window.start(cfg)", cfg)
    for i in range(total):
        pagina.evaluate("t => setT(t)", i / FPS)
        pagina.screenshot(path=f"{tmp}/f{i:05d}.png")
    saida = os.path.join(SAIDA, cfg["nome"] + ".mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", f"{tmp}/f%05d.png",
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17", "-movflags", "+faststart", saida], check=True)
    shutil.rmtree(tmp, ignore_errors=True)
    print("ok", saida)


if __name__ == "__main__":
    tmp = sys.argv[1]
    escolha = sys.argv[2:] or ["1", "2"]
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
        for n in escolha:
            pg = b.new_page(viewport={"width": 1080, "height": 960})
            pg.goto("file://" + os.path.join(AQUI, "painel.html"))
            renderiza({"1": PARTE1, "2": PARTE2, "3": PARTE3}[n], pg, tmp)
        b.close()
