const STEPS = [
  { n: 1, label: 'Conta' },
  { n: 2, label: 'Família' },
  { n: 3, label: 'Rotina' },
]

export function OnboardingStepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="mx-auto flex max-w-[220px] items-center justify-between pb-2">
      {STEPS.map((step, idx) => (
        <div key={step.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                step.n <= current ? 'bg-primary text-white' : 'bg-line text-ink-soft'
              }`}
            >
              {step.n}
            </div>
            <span className={`text-[10px] font-bold ${step.n <= current ? 'text-primary-dark' : 'text-ink-soft'}`}>{step.label}</span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`mx-1.5 mb-4 h-0.5 w-8 rounded-full ${step.n < current ? 'bg-primary' : 'bg-line'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
