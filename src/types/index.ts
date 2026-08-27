// Estrutura de dados da aplicação — ver seção 15 do prompt mestre.
// USUÁRIA → FAMÍLIA → CRIANÇAS → TAREFAS → ROTINAS → ROTINAS ESPECIAIS → CARDS "COMO FAZER" → PDFs

export type Weekday = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'

export const WEEKDAYS: Weekday[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  seg: 'Segunda',
  ter: 'Terça',
  qua: 'Quarta',
  qui: 'Quinta',
  sex: 'Sexta',
  sab: 'Sábado',
  dom: 'Domingo',
}

export type PeriodOfDay = 'manha' | 'tarde' | 'noite'

export const PERIODS: PeriodOfDay[] = ['manha', 'tarde', 'noite']

export const PERIOD_LABELS: Record<PeriodOfDay, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
}

export type AutonomyLevel = 'ajuda' | 'desenvolvendo' | 'autonoma'

export const AUTONOMY_LABELS: Record<AutonomyLevel, string> = {
  ajuda: 'Precisa de bastante ajuda',
  desenvolvendo: 'Está desenvolvendo autonomia',
  autonoma: 'Já faz muitas coisas sozinha',
}

export type Environment =
  | 'apartamento'
  | 'casa'
  | 'condominio'
  | 'area_rural'
  | 'outro'

export type FamilyFeature =
  | 'animais'
  | 'jardim'
  | 'horta'
  | 'area_externa'
  | 'piscina'
  | 'irmaos'

export type TaskCategory =
  | 'higiene'
  | 'organizacao'
  | 'alimentacao'
  | 'estudos'
  | 'casa'
  | 'animais'
  | 'jardim'
  | 'autocuidado'
  | 'social'
  | 'lazer'
  | 'outro'

// -------------------- 15.1 Usuária --------------------
export interface UserAccount {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
  settings: {
    theme?: string
  }
  familyId: string | null
}

// -------------------- 15.2 Família --------------------
export interface Family {
  id: string
  name: string
  ownerUserId: string
  environment: Environment | null
  features: FamilyFeature[]
  notes: string
  childrenIds: string[]
  customTaskIds: string[]
  pdfIds: string[]
  createdAt: string
}

// -------------------- 15.3 Criança --------------------
export interface Child {
  id: string
  familyId: string
  name: string
  photo: string | null
  age: number | null
  gender: 'menino' | 'menina' | 'outro' | null
  school: {
    attends: boolean
    shift: 'manha' | 'tarde' | 'integral' | null
    entryTime: string | null
    exitTime: string | null
  }
  extracurricular: string[]
  wakeTime: string | null
  sleepTime: string | null
  interests: string[]
  characteristics: string
  autonomyLevel: AutonomyLevel | null
  selectedTaskIds: string[] // tarefas do banco escolhidas (via ChildTask)
  customTaskIds: string[]
  createdAt: string
  onboardingStep: number // controla o wizard de perfil
}

// -------------------- 15.4 Banco de tarefas --------------------
export interface TaskDefinition {
  id: string
  name: string
  description: string
  minAge: number
  maxAge: number
  category: TaskCategory
  subcategory?: string
  period: PeriodOfDay[] // pode servir em mais de um momento do dia
  durationMinutes: number
  autonomy: AutonomyLevel[]
  environments: Environment[] // ambientes onde essa tarefa faz sentido
  requiresFeatures: FamilyFeature[] // ex: 'animais' para "dar comida ao cachorro"
  frequencySuggestion: 'diaria' | 'semanal' | 'ocasional'
  icon: string // emoji ou nome de ícone
  availableForRoutine: boolean
  availableForWeekly: boolean
  availableForSpecial: boolean
  canHaveHowTo: boolean
}

// -------------------- 15.5 Relação criança-tarefa --------------------
export interface ChildTask {
  id: string
  childId: string
  taskId: string | null // referência ao banco (TaskDefinition), se aplicável
  customTaskId: string | null // referência a CustomTask, se aplicável
  overrideName: string | null
  overrideDescription: string | null
  overrideDuration: number | null
  overrideIcon: string | null
  notes: string | null
  createdAt: string
}

// -------------------- 15.6 Tarefas personalizadas --------------------
export interface CustomTask {
  id: string
  familyId: string
  childId: string | null
  name: string
  description: string
  category: TaskCategory
  icon: string
  location: string
  durationMinutes: number
  period: PeriodOfDay[]
  frequencySuggestion: 'diaria' | 'semanal' | 'ocasional'
  howToTip: string | null
  availableForRoutine: boolean
  availableForWeekly: boolean
  availableForSpecial: boolean
  createdAt: string
}

// -------------------- 15.7 Rotina --------------------
export interface RoutineItem {
  id: string
  childTaskId: string
  time: string | null // horário opcional HH:mm
  order: number
  durationMinutes: number | null
  note: string | null
}

export interface Routine {
  id: string
  childId: string
  day: Weekday
  version: number
  status: 'ativa' | 'rascunho' | 'arquivada'
  periods: Record<PeriodOfDay, RoutineItem[]>
  mode: 'sequencia' | 'horario'
  updatedAt: string
}

// -------------------- 15.8 Tarefas da semana --------------------
export interface WeeklyTaskItem {
  id: string
  childId: string
  day: Weekday
  childTaskId: string
  order: number
  time: string | null
  status: 'ativa' | 'concluida'
}

// -------------------- 15.9 Rotinas especiais --------------------
export type SpecialRoutineType =
  | 'medico'
  | 'viagem'
  | 'passeio'
  | 'ferias'
  | 'aniversario'
  | 'dia_sem_escola'
  | 'evento'
  | 'outro'

export interface SpecialRoutine {
  id: string
  childId: string
  title: string
  description: string | null
  type: SpecialRoutineType
  startDate: string
  endDate: string | null
  status: 'ativa' | 'rascunho' | 'concluida'
  periods: Record<PeriodOfDay, RoutineItem[]>
  updatedAt: string
}

// -------------------- 15.10 Cards "Como fazer" --------------------
export interface HowToStep {
  id: string
  order: number
  text: string
  image: string | null
}

export interface HowToCard {
  id: string
  childId: string | null
  familyId: string
  taskId: string | null
  customTaskId: string | null
  title: string
  mainImage: string | null
  steps: HowToStep[]
  visualSettings: {
    color?: string
  }
  createdAt: string
  updatedAt: string
}

// -------------------- 15.11 PDFs --------------------
export type PdfType = 'rotina' | 'como_fazer'

export interface GeneratedPdf {
  id: string
  childId: string
  type: PdfType
  routineVersion: number | null
  generatedAt: string
  fileDataUrl: string | null
  visualSettings: Record<string, unknown>
}
