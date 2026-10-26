"use client";

import { useState } from "react";
import { PROFILES, QUESTIONS, type ProfileId } from "./data";

const ORDER: ProfileId[] = ["culpada", "calada", "chorona"];

function tally(answers: ProfileId[]) {
  const counts: Record<ProfileId, number> = { culpada: 0, calada: 0, chorona: 0 };
  for (const a of answers) counts[a] += 1;
  return counts;
}

export function QuizClient() {
  const [step, setStep] = useState(-1); // -1 = intro
  const [answers, setAnswers] = useState<ProfileId[]>([]);

  const total = QUESTIONS.length;
  const finished = step >= total;

  function choose(profile: ProfileId) {
    setAnswers((prev) => [...prev, profile]);
    setStep((s) => s + 1);
  }

  function back() {
    setAnswers((prev) => prev.slice(0, -1));
    setStep((s) => s - 1);
  }

  function restart() {
    setAnswers([]);
    setStep(-1);
  }

  if (step === -1) {
    return (
      <section className="text-center">
        <div className="font-body text-[13px] tracking-[0.28em] uppercase text-flame mb-3">
          Quiz para mães
        </div>
        <h1 className="font-heading font-bold text-[32px] md:text-[42px] text-navy leading-[1.15]">
          Que tipo de mãe impaciente você é?
        </h1>
        <p className="text-ink/60 mt-4 text-[17px] max-w-md mx-auto">
          Responda {total} perguntas sinceras, sem pensar demais, e receba o seu
          diagnóstico com um caminho de acolhimento.
        </p>
        <button
          onClick={() => setStep(0)}
          className="mt-8 inline-flex items-center justify-center rounded-full px-8 py-3 font-body font-semibold text-[16px] bg-navy text-white hover:bg-ink transition-colors"
        >
          Começar o quiz
        </button>
        <p className="text-ink/40 text-[13px] mt-4">Leva cerca de 2 minutos.</p>
      </section>
    );
  }

  if (!finished) {
    const q = QUESTIONS[step];
    const progress = Math.round((step / total) * 100);
    return (
      <section>
        <div className="flex items-center justify-between text-[13px] text-ink/50 mb-2">
          <span>
            Pergunta {step + 1} de {total}
          </span>
          {step > 0 ? (
            <button onClick={back} className="underline underline-offset-4">
              Voltar
            </button>
          ) : null}
        </div>
        <div
          className="h-2 rounded-full bg-line overflow-hidden mb-8"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-flame transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <h2 className="font-heading font-bold text-[22px] md:text-[26px] text-navy leading-snug">
          {q.text}
        </h2>
        <div className="mt-6 flex flex-col gap-3">
          {q.answers.map((a) => (
            <button
              key={a.text}
              onClick={() => choose(a.profile)}
              className="text-left rounded-xl border border-line bg-card px-5 py-4 text-[16px] text-ink hover:border-flame hover:bg-cream transition-colors"
            >
              {a.text}
            </button>
          ))}
        </div>
      </section>
    );
  }

  const counts = tally(answers);
  const winner = ORDER.reduce((best, id) =>
    counts[id] > counts[best] ? id : best,
  );
  const profile = PROFILES[winner];

  return (
    <section>
      <div className="text-center">
        <div className="text-[56px] leading-none">{profile.emoji}</div>
        <div className="font-body text-[13px] tracking-[0.28em] uppercase text-flame mt-4 mb-2">
          Seu diagnóstico
        </div>
        <h1 className="font-heading font-bold text-[30px] md:text-[38px] text-navy leading-[1.15]">
          {profile.name}
        </h1>
        <p className="text-ink/60 mt-3 text-[17px] italic">{profile.tagline}</p>
      </div>

      <p className="mt-8 text-[17px] text-ink/80">{profile.diagnosis}</p>

      <div className="mt-8 rounded-xl bg-card border border-line p-5">
        <h3 className="font-heading font-bold text-navy mb-3">
          Seu resultado em números
        </h3>
        <div className="flex flex-col gap-3">
          {ORDER.map((id) => {
            const pct = Math.round((counts[id] / total) * 100);
            return (
              <div key={id}>
                <div className="flex justify-between text-[14px] mb-1">
                  <span>{PROFILES[id].name}</span>
                  <span className="text-ink/50">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-line overflow-hidden">
                  <div
                    className={`h-full ${id === winner ? "bg-flame" : "bg-navy/30"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-heading font-bold text-navy mb-2">
            Sinais que você reconhece
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-ink/80">
            {profile.signs.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-heading font-bold text-navy mb-2">
            O que pode te ajudar
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-ink/80">
            {profile.whatHelps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <blockquote className="mt-8 rounded-xl bg-cream border border-line p-5 text-ink/80 italic">
        🙏 {profile.prayer}
      </blockquote>

      <p className="mt-6 text-center text-ink/60 text-[15px]">
        Ser impaciente de vez em quando não faz de você uma mãe ruim. Faz de
        você uma mãe humana, e Deus completa o que falta.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          onClick={restart}
          className="inline-flex items-center justify-center rounded-full px-7 py-3 font-body font-semibold text-[15px] border border-navy text-navy hover:bg-navy hover:text-white transition-colors"
        >
          Refazer o quiz
        </button>
      </div>
    </section>
  );
}
