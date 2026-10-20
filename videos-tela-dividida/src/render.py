"""Renderiza os painéis de meia tela (1080x960) em MP4. Os tempos estão em segundos."""
import os, shutil, subprocess, sys
from playwright.sync_api import sync_playwright

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.dirname(AQUI)
FPS = 30
ALPHA = os.environ.get("ALPHA") == "1"   # ALPHA=1: fundo transparente (.mov e .webm)

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


PARTE4 = dict(nome="parte4-explicacao", dur=79.5, scenes=[
    # "se as pessoas me seguissem, o Instagram mostraria outros conteúdos meus"
    dict(**{"in": 0.2}, out=5.2, items=[
        dict(type="mao", html="se a pessoa me seguisse", t0=0.5),
        dict(type="titulo", html="o Instagram mostraria <em>outros conteúdos</em> meus", t0=1.6, dur=3.0),
    ]),
    # "precisaria postar todo santo dia"
    dict(**{"in": 5.4}, out=10.4, items=[
        dict(type="mao", html="foi aqui que eu entendi", t0=5.6),
        dict(type="titulo", html="preciso postar <em>todo santo dia</em>", t0=7.0, dur=2.4),
    ]),
    # "como eu vou fazer a pessoa me seguir?"
    dict(**{"in": 10.5}, out=17.3, items=[
        dict(type="mao", html="tá bom, entendi...", t0=10.7),
        dict(type="titulo", html="e como faço a pessoa <em>me seguir</em>?", t0=12.6, dur=3.2),
    ]),
    # "estratégia de turbinar os meus carrosséis"
    dict(**{"in": 17.4}, out=22.7, items=[
        dict(type="mao", html="foi aí que comecei a", t0=17.6),
        dict(type="titulo", html="<em>turbinar</em> meus carrosséis", t0=19.0, dur=3.0),
    ]),
    # "investir o mínimo, ter o máximo de retorno"
    dict(**{"in": 22.8}, out=27.9, items=[
        dict(type="mao", html="a regra era simples", t0=23.0),
        dict(type="titulo", html="investir o <em>mínimo</em>", t0=24.6, dur=1.6),
        dict(type="titulo", html="ter o <em>máximo</em> de retorno", t0=26.2, dur=1.8),
    ]),
    # "teste de um dia só; se não saiu bem, retirava"
    dict(**{"in": 28.1}, out=35.0, items=[
        dict(type="mao", html="o teste de cada post", t0=28.3),
        dict(type="valor", texto="1 dia só", t0=29.6),
        dict(type="mao", html="não saiu bem? <u>já retirava</u>", t0=32.4),
    ]),
    # "pagar até R$ 1 por seguidor"
    dict(**{"in": 35.1}, out=40.0, items=[
        dict(type="mao", html="a meta era pagar até", t0=35.3),
        dict(type="valor", texto="R$ 1", t0=36.6),
        dict(type="mao", html="por seguidor", t0=37.6),
    ]),
    # "cheguei a pagar R$ 0,23"
    dict(**{"in": 40.1}, out=41.9, items=[
        dict(type="mao", html="mas cheguei a pagar", t0=40.2),
        dict(type="valor", to=0.23, dec=2, prefix="R$ ", t0=40.9, dur=1.0),
    ]),
    # "o custo mais alto foi 58 centavos"
    dict(**{"in": 42.0}, out=46.9, items=[
        dict(type="mao", html="o custo mais alto", t0=42.2),
        dict(type="valor", to=0.58, dec=2, prefix="R$ ", t0=44.2, dur=1.2),
        dict(type="mao", html="por seguidor", t0=45.6),
    ]),
    # "de 10 a 25 pessoas por dia, a um custo de R$ 6"
    dict(**{"in": 47.0}, out=54.0, items=[
        dict(type="mao", html="isso significava", t0=47.2),
        dict(type="valor", texto="10 a 25", t0=48.4),
        dict(type="mao", html="pessoas por dia no meu perfil", t0=49.8),
        dict(type="mao", html="a um custo de", t0=52.0),
        dict(type="valor", texto="R$ 6", t0=52.9),
    ]),
    # "o que aconteceu depois me surpreendeu"
    dict(**{"in": 54.1}, out=58.4, items=[
        dict(type="titulo", html="o que aconteceu depois me <em>surpreendeu</em>", t0=54.4, dur=3.2),
    ]),
    # "200, 300 seguidores chegando no orgânico"
    dict(**{"in": 58.5}, out=63.4, items=[
        dict(type="valor", texto="200 a 300", t0=58.9),
        dict(type="mao", html="seguidores chegando no <u>orgânico</u>", t0=60.0),
        dict(type="mao", html="por causa da estratégia", t0=61.9),
    ]),
    # "chegavam nos posts que eu não turbinava"
    dict(**{"in": 63.5}, out=70.4, items=[
        dict(type="mao", html="e eles chegavam nos posts", t0=63.8),
        dict(type="mao", html="que eu <u>não turbinei</u>", t0=65.7),
        dict(type="mao", html="isso fica para o próximo vídeo", t0=67.9),
    ]),
    # "então já me segue..."
    dict(**{"in": 70.6}, items=[
        dict(type="titulo", html="<em>me segue</em> para ficar por dentro", t0=70.9, dur=3.2),
        dict(type="mao", html="e aprender a empreender", t0=75.0),
        dict(type="mao", html="mesmo sem <u>aparecer</u>", t0=77.0),
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
        pagina.screenshot(path=f"{tmp}/f{i:05d}.png", omit_background=ALPHA)
    if ALPHA:
        base = os.path.join(SAIDA, cfg["nome"] + "-transparente")
        ent = ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", f"{tmp}/f%05d.png"]
        if os.environ.get("SEM_MOV") != "1":
            subprocess.run(ent + ["-c:v", "prores_ks", "-profile:v", "4444", "-bits_per_mb", "300", "-pix_fmt", "yuva444p10le", base + ".mov"], check=True)
        subprocess.run(ent + ["-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "20", "-auto-alt-ref", "0", base + ".webm"], check=True)
        shutil.rmtree(tmp, ignore_errors=True)
        print("ok", base)
        return
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
            pg.goto("file://" + os.path.join(AQUI, "painel.html") + ("?alpha=1" if ALPHA else ""))
            renderiza({"1": PARTE1, "2": PARTE2, "3": PARTE3, "4": PARTE4}[n], pg, tmp)
        b.close()
