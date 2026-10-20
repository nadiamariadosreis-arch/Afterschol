"""Trecho 4 (turbinar carrosséis): textos + desenhos animados. Tempos em segundos."""

def av(tam, t, rot=""):
    return ('<svg data-t="%s" width="%d" height="%d" viewBox="0 0 120 120"><defs><clipPath id="c%s"><circle cx="60" cy="60" r="56"/></clipPath></defs>'
            '<circle cx="60" cy="60" r="57" fill="#FFE6CC" stroke="#F97316" stroke-width="5"/>'
            '<g clip-path="url(#c%s)"><circle cx="60" cy="48" r="21" fill="#F97316"/><ellipse cx="60" cy="112" rx="40" ry="34" fill="#F97316"/></g></svg>') % (t, tam, tam, str(t).replace('.', ''), str(t).replace('.', ''))

def seta(dirc, w, h, t, dur=.9, cls=""):
    f = {"baixo": ("M50 8 C46 35 54 60 50 88", "M26 66 L50 92 L74 66"),
         "cima": ("M50 92 C46 65 54 40 50 12", "M26 34 L50 8 L74 34"),
         "direita": ("M8 50 C35 46 60 54 88 50", "M66 26 L92 50 L66 74")}[dirc]
    return ('<svg width="%d" height="%d" viewBox="0 0 100 100" style="overflow:visible">'
            '<path class="%s" data-d="%s" data-dur="%s" d="%s"/><path class="%s" data-d="%s" data-dur=".4" d="%s"/></svg>') % (
            w, h, cls, t, dur, f[0], cls, t + dur * .8, f[1])

def anel(inner, t, cls="dk"):
    # o tamanho do círculo é calculado no navegador, para o traço ficar uniforme
    return ('<span class="anelado">%s<svg class="rg"><path class="%s" data-d="%s" data-dur="1.0" d=""/></svg></span>') % (inner, cls, t)

def botao(t_pop, t_tap, tam=130):
    return ('<div class="col" data-t="%s">%s<div class="btn" data-swap="%s"><span class="a">seguir</span><span class="b">seguindo ✓</span>'
            '<span class="rip" data-rip="%s"></span></div></div>') % (t_pop, av(tam, 0.0).replace('data-t="0.0"', ''), t_tap, t_tap - .1)

def minicard(t, cor="", extra=""):
    return '<div class="mp" data-t="%s">%s<div class="foto %s"></div><div class="li"></div></div>' % (t, extra, cor)

DIAS = ["S", "T", "Q", "Q", "S", "S", "D"]
def calendario(t0, t_checks):
    cx = "".join('<div class="dia" data-t="%s">%s<svg viewBox="0 0 100 100"><path class="gr" data-d="%s" data-dur=".5" d="M18 54 L42 78 L84 24"/></svg></div>'
                 % (t0 + .12 * i, d, t_checks[i]) for i, d in enumerate(DIAS))
    return '<div class="lin" style="gap:12px">%s</div>' % cx

def pessoas():
    """25 pessoinhas: as 10 primeiras entram uma a uma, depois as outras 15 até completar 25."""
    t = [48.8 + .13 * i for i in range(10)] + [50.4 + .09 * i for i in range(15)]
    lin1 = "".join(av(60, round(t[i], 2)) for i in range(13))
    lin2 = "".join(av(60, round(t[i], 2)) for i in range(13, 25))
    tag = lambda txt, tt, out="": '<div class="mao" data-t="%s" %s style="position:absolute;top:142px;left:0;width:100%%;text-align:center;font-size:66px">%s</div>' % (tt, out, txt)
    return ('<div style="position:relative;width:900px;height:220px"><div class="lin" style="gap:9px">%s</div><div class="lin" style="gap:9px;margin-top:8px">%s</div>'
            '%s%s</div>') % (lin1, lin2, tag("10 pessoas", 49.9, 'data-out="50.5"'), tag("25 pessoas", 51.7))

def cena(html): return dict(type="cena", html=html)

PARTE4 = dict(nome="parte4-explicacao", dur=79.5, scenes=[
    # 1) "se as pessoas me seguissem, o Instagram mostraria outros conteúdos meus"
    dict(**{"in": 0.2}, out=5.2, items=[
        dict(type="mao", html="se a pessoa me seguisse", t0=0.5),
        cena('<div class="lin" style="gap:30px">%s%s<div class="lin" style="gap:18px">%s%s%s</div></div>' % (
            botao(.9, 2.3, 140), seta("direita", 130, 90, 2.7), minicard(3.1), minicard(3.5, "b"), minicard(3.9, "c"))),
        dict(type="titulo", html="o Instagram mostraria <em>outros conteúdos</em> meus", t0=2.4, dur=2.4),
    ]),
    # 2) "precisaria postar todo santo dia"
    dict(**{"in": 5.4}, out=10.4, items=[
        dict(type="mao", html="foi aqui que eu entendi", t0=5.6),
        cena(calendario(6.0, [7.4, 7.7, 8.0, 8.3, 8.6, 8.9, 9.2])),
        dict(type="titulo", html="preciso postar <em>todo santo dia</em>", t0=6.8, dur=2.4),
    ]),
    # 3) "como eu vou fazer a pessoa me seguir?"
    dict(**{"in": 10.5}, out=17.3, items=[
        dict(type="mao", html="tá bom, entendi...", t0=10.7),
        dict(type="titulo", html="e como faço a pessoa <em>me seguir</em>?", t0=12.4, dur=3.0),
        cena('<div class="lin">%s</div>' % botao(15.2, 16.4, 150)),
    ]),
    # 4) "estratégia de turbinar os meus carrosséis"
    dict(**{"in": 17.4}, out=22.7, items=[
        dict(type="mao", html="foi aí que comecei a", t0=17.6),
        dict(type="titulo", html="<em>turbinar</em> meus carrosséis", t0=19.0, dur=2.6),
        cena('<div style="position:relative"><div class="barras"><div style="height:70px" data-t="20.2"></div><div style="height:130px" data-t="20.7"></div>'
             '<div style="height:200px" data-t="21.2"></div></div>'
             '<svg style="position:absolute;left:-30px;top:-30px;overflow:visible" width="360" height="240" viewBox="0 0 360 240">'
             '<path class="dk" data-d="21.3" data-dur="1.0" d="M20 190 C110 170 190 120 300 40"/><path class="dk" data-d="22.1" data-dur=".4" d="M240 36 L304 36 L304 100"/></svg></div>'),
    ]),
    # 5a) "a regra era simples: investir o mínimo possível... ter o máximo de retorno possível"
    dict(**{"in": 22.8}, out=27.9, items=[
        dict(type="mao", html="a regra era simples", t0=23.0),
        cena('<div class="lin" style="gap:90px;align-items:flex-start"><div class="col"><div class="mao" data-t="24.2">investir o</div>%s'
             '<div class="titulo" style="color:var(--laranja)" data-t="25.0">mínimo</div></div>'
             '<div class="col"><div class="mao" data-t="26.0">ter o</div>%s<div class="titulo" style="color:var(--laranja)" data-t="26.8">máximo</div>'
             '<div class="mao" data-t="27.1" style="font-size:70px">de retorno</div></div></div>' % (
             seta("baixo", 90, 130, 24.6, .8), seta("cima", 90, 130, 26.3, .8))),
    ]),
    # 5b) "teste de qual post ia melhor era de um dia só; se não saiu bem, eu já retirava"
    dict(**{"in": 28.1}, out=35.0, items=[
        dict(type="mao", html="teste de qual post vai melhor", t0=28.3),
        cena('<div class="lin" style="gap:30px">%s%s%s</div>' % (
            minicard(29.2).replace('class="mp"', 'class="mp g"'),
            minicard(29.6, "b", '<svg class="x" viewBox="0 0 170 220"><path class="dk" data-d="33.2" data-dur=".4" d="M26 40 L144 180"/>'
                                '<path class="dk" data-d="33.6" data-dur=".4" d="M144 40 L26 180"/></svg>').replace('class="mp"', 'class="mp g" data-out="34.2"').replace('data-t="29.6"', 'data-t="29.6"'),
            minicard(30.0, "c").replace('class="mp"', 'class="mp g"'))),
        cena('<div class="valor" data-t="31.0">%s</div>' % anel("1 dia só", 31.8)),
        dict(type="mao", html="não saiu bem? <u>já retirava</u>", t0=32.5),
    ]),
    # 6) "a meta era pagar até R$ 1 por seguidor"
    dict(**{"in": 35.1}, out=40.0, items=[
        dict(type="mao", html="a meta era pagar até", t0=35.3),
        cena('<div class="valor" data-t="36.4">%s</div>' % anel("R$ 1", 37.4)),
        cena('<div style="position:relative;width:760px;height:110px"><svg width="760" height="110" viewBox="0 0 760 110" style="overflow:visible"><path class="dk" data-d="37.0" data-dur="1.0" d="M10 96 C200 90 420 100 700 94"/>'
             '<path class="dk" data-d="37.9" data-dur=".4" d="M700 96 L700 8"/><path data-t="38.2" fill="#F97316" stroke="none" d="M700 8 L762 30 L700 54 Z" style="stroke:none;fill:#F97316"/></svg>'
             '<div class="mao" style="position:absolute;left:560px;top:-4px;font-size:64px" data-t="38.4">meta</div></div>'),
        cena('<div class="lin" style="gap:18px">%s<div class="mao" data-t="38.8">por seguidor</div></div>' % av(100, 38.6)),
    ]),
    # 7) "cheguei a pagar R$ 0,23"
    dict(**{"in": 40.1}, out=42.1, items=[
        dict(type="mao", html="mas cheguei a pagar", t0=40.2),
        cena('<div class="valor" data-count="0.23|2|R$ |40.9|1.0">R$ 0,00</div>'),
    ]),
    # 8) "o custo mais alto por seguidor foi de 58 centavos"
    dict(**{"in": 42.2}, out=46.9, items=[
        dict(type="mao", html="o custo mais alto", t0=42.4),
        cena('<div class="lin" style="gap:30px"><div class="valor" data-count="0.58|2|R$ |44.0|1.2">R$ 0,00</div>%s</div>' % seta("cima", 80, 130, 45.4, .8)),
        dict(type="mao", html="por seguidor", t0=45.8),
    ]),
    # 9) "de 10 a 25 pessoas entrando por dia, a um custo de R$ 6"
    dict(**{"in": 47.0}, out=54.0, items=[
        dict(type="mao", html="isso significava", t0=47.2),
        cena('<div class="valor" data-t="48.0">%s</div>' % anel("10 a 25", 51.6)),
        cena(pessoas()),
        cena('<div class="lin" style="gap:24px"><div class="mao" data-t="52.2">a um custo de</div><div class="valor" data-t="52.9">%s</div></div>' % anel("R$ 6", 53.3)),
    ]),
    # 10) "o que aconteceu depois me surpreendeu"
    dict(**{"in": 54.1}, out=58.4, items=[
        dict(type="titulo", html="o que aconteceu depois me <em>surpreendeu</em>", t0=54.4, dur=3.0),
        cena('<div class="lin" style="gap:40px"><span class="estr" data-t="57.0">✦</span><span class="estr" data-t="57.3">✦</span><span class="estr" data-t="57.6">✦</span></div>'),
    ]),
    # 11) "200, 300 seguidores chegando no orgânico"
    dict(**{"in": 58.5}, out=63.4, items=[
        dict(type="valor", texto="200 a 300", t0=58.9),
        cena('<svg width="700" height="190" viewBox="0 0 700 190" style="overflow:visible"><path data-d="59.6" data-dur="1.8" d="M10 175 C90 168 150 150 230 125 S360 100 430 75 S560 35 670 14"/>'
             '<path data-d="61.3" data-dur=".4" d="M620 12 L672 12 L662 62"/></svg>'),
        dict(type="mao", html="seguidores chegando no <u>orgânico</u>", t0=60.3),
        dict(type="mao", html="por causa da estratégia", t0=62.0),
    ]),
    # 12) "chegavam nos posts que eu não estava turbinando"
    dict(**{"in": 63.5}, out=70.4, items=[
        dict(type="mao", html="e eles chegavam nos posts", t0=63.8),
        cena('<div class="lin" style="gap:34px">%s%s<div style="position:relative">%s<svg style="position:absolute;left:-26px;top:-24px;overflow:visible" width="182" height="222" viewBox="0 0 182 222">'
             '<ellipse data-d="66.3" data-dur="1.0" class="dk" cx="91" cy="111" rx="86" ry="104"/></svg></div></div>' % (
             minicard(64.8, "", '<div class="bd">↑</div>'), minicard(65.2, "b", '<div class="bd">↑</div>'), minicard(65.6, "c"))),
        dict(type="mao", html="que eu <u>não turbinei</u>", t0=66.0),
        dict(type="mao", html="isso fica para o próximo vídeo", t0=67.9),
    ]),
    # 13) "então já me segue para ficar por dentro... mesmo que você não queira aparecer"
    dict(**{"in": 70.6}, items=[
        dict(type="titulo", html="<em>me segue</em> para ficar por dentro", t0=70.9, dur=3.0),
        cena('<div class="lin">%s</div>' % botao(72.0, 73.4, 130)),
        dict(type="mao", html="e aprender a empreender", t0=75.0),
        dict(type="mao", html="mesmo sem <u>aparecer</u>", t0=77.0),
    ]),
])
