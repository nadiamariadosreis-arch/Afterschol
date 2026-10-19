"""Renderiza os painéis de meia tela (1080x960) em MP4. Os tempos estão em segundos."""
import os, shutil, subprocess, sys
from playwright.sync_api import sync_playwright

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.dirname(AQUI)
FPS = 30

CAPA = "capa-carrossel.png"

PARTE1 = dict(nome="parte1-explicacao", dur=34.125, scenes=[
    dict(**{"in": 0.15}, out=10.4, items=[
        dict(type="badge", text="1", t0=0.2),
        dict(type="words", html="Um título ligado ao <em>seu material</em>", t0=0.6, dur=2.4),
        dict(type="tag", html="Ex.: e-book sobre a Santa Missa", t0=4.8, cls="tag"),
        dict(type="sub", html="Meu título era:", t0=8.7, cls="sub"),
    ]),
    dict(**{"in": 10.5}, out=14.6, items=[
        dict(type="img", src=CAPA, t0=10.6),
    ]),
    dict(**{"in": 14.7}, out=21.3, items=[
        dict(type="sub", html="Só esse post me trouxe:", t0=14.8, cls="sub"),
        dict(type="count", to=2500, prefix="+", t0=16.3, dur=1.2),
        dict(type="tag", html="seguidores no 1º dia", t0=17.1, cls="tag"),
        dict(type="count", to=600, prefix="+R$ ", t0=19.0, dur=0.9, xl=True),
        dict(type="tag", html="em vendas", t0=20.0, cls="tag"),
    ]),
    dict(**{"in": 21.4}, out=31.8, items=[
        dict(type="badge", text="2", t0=21.5),
        dict(type="words", html="Um <em>passo a passo</em> aplicável", t0=21.9, dur=2.4),
        dict(type="gold", html="Eu não escondi o ouro", t0=25.4, cls="gold"),
        dict(type="check", html="Só de ler, a pessoa já sabia o que fazer", t0=27.0, cls=""),
    ]),
    dict(**{"in": 32.0}, items=[
        dict(type="badge", text="3", t0=32.1),
        dict(type="words", html="Um caminho <em>ainda mais fácil</em>", t0=32.4, dur=1.5),
    ]),
])

PARTE2 = dict(nome="parte2-explicacao", dur=16.1675, scenes=[
    dict(**{"in": -1}, out=8.2, items=[
        dict(type="badge", text="3", t0=-1),
        dict(type="words", html="Um caminho <em>ainda mais fácil</em>", t0=-2, dur=1.0),
        dict(type="sub", html="para conseguir o que o título prometia", t0=3.6, cls="sub"),
        dict(type="gold", html="O meu material", t0=6.6, cls="gold"),
    ]),
    dict(**{"in": 8.3}, items=[
        dict(type="sub", html="E o resultado?", t0=8.4, cls="sub"),
        dict(type="count", to=38769.26, dec=2, prefix="R$ ", t0=9.6, dur=2.0, xl=True),
        dict(type="count", to=1900, prefix="+", suffix=" vendas", t0=12.4, dur=1.3),
        dict(type="tag", html="só do material da Santa Missa", t0=14.2, cls="tag"),
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
            renderiza(PARTE1 if n == "1" else PARTE2, pg, tmp)
        b.close()
