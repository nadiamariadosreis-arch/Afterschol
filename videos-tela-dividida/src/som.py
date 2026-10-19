"""Gera os efeitos sonoros (contador, ding, pop) no tempo exato das animações."""
import os, wave, subprocess
import numpy as np

SR = 44100
AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.dirname(AQUI)

def vazio(seg): return np.zeros(int(SR * seg))

def poe(trilha, t0, som, ganho=1.0):
    i = int(t0 * SR); n = min(len(som), len(trilha) - i)
    if n > 0: trilha[i:i + n] += som[:n] * ganho

def tick(freq=2400):
    n = int(SR * 0.012); t = np.arange(n) / SR
    return np.sin(2 * np.pi * freq * t) * np.exp(-t * 450) * 0.8

def sino(freq, dur=0.9, harm=(1, 2.01, 3.02), amp=(1, .35, .15)):
    t = np.arange(int(SR * dur)) / SR
    s = sum(a * np.sin(2 * np.pi * freq * h * t) for h, a in zip(harm, amp))
    return s * np.exp(-t * 5.5) / 1.5

def pop():
    n = int(SR * 0.12); t = np.arange(n) / SR
    f = 500 + 900 * np.exp(-t * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35) * 0.9

def ease_inout(x): return 2 * x * x if x < .5 else 1 - (-2 * x + 2) ** 2 / 2

def contador(trilha, t0, dur, passos=None, ganho=.35):
    """Um tique para cada pedacinho do número: rápido no meio, devagar no começo e no fim (igual ao vídeo)."""
    passos = passos or int(dur * 22)
    for k in range(1, passos + 1):
        alvo = k / (passos + 1)
        lo, hi = 0.0, 1.0
        for _ in range(30):
            mid = (lo + hi) / 2
            if ease_inout(mid) < alvo: lo = mid
            else: hi = mid
        poe(trilha, t0 + lo * dur, tick(2200 + 900 * alvo), ganho)

def grava(trilha, nome):
    pico = np.max(np.abs(trilha)) or 1
    y = (trilha / max(pico, 1) * 0.9 * 32767).astype(np.int16)
    wav = os.path.join(SAIDA, nome + ".wav")
    with wave.open(wav, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
    mp3 = os.path.join(SAIDA, nome + ".mp3")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-b:a", "192k", mp3], check=True)
    os.remove(wav)
    return mp3

def parte1():
    d = 34.125; t = vazio(d)
    contador(t, 16.3, 1.6); poe(t, 17.95, sino(1318), .5)      # +2.500 seguidores
    contador(t, 19.0, 1.2); poe(t, 20.25, sino(1568), .5)      # +R$ 600
    poe(t, 20.33, sino(2093, .6), .3)
    return grava(t, "som-parte1")

def parte2():
    d = 16.1675; t = vazio(d)
    poe(t, 10.1, pop(), .7)     # círculo no valor líquido
    poe(t, 11.35, sino(1318), .45)
    poe(t, 12.5, pop(), .7)     # círculo nas vendas
    poe(t, 13.7, sino(1568), .45)
    return grava(t, "som-parte2")

if __name__ == "__main__":
    print(parte1()); print(parte2())
