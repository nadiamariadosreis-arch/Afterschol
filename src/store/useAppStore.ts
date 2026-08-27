import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type {
  Child,
  ChildTask,
  CustomTask,
  Family,
  GeneratedPdf,
  HowToCard,
  PdfType,
  PeriodOfDay,
  Routine,
  RoutineItem,
  SpecialRoutine,
  SpecialRoutineType,
  UserAccount,
  Weekday,
  WeeklyTaskItem,
} from '../types'
import { PERIODS } from '../types'

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function emptyPeriods(): Record<PeriodOfDay, RoutineItem[]> {
  return { manha: [], tarde: [], noite: [] }
}

function routineKey(childId: string, day: Weekday) {
  return `${childId}__${day}`
}

interface AppState {
  currentUserId: string | null
  activeChildId: string | null
  users: Record<string, UserAccount>
  families: Record<string, Family>
  children: Record<string, Child>
  customTasks: Record<string, CustomTask>
  childTasks: Record<string, ChildTask>
  routines: Record<string, Routine>
  weeklyTasks: Record<string, WeeklyTaskItem>
  specialRoutines: Record<string, SpecialRoutine>
  howToCards: Record<string, HowToCard>
  pdfs: Record<string, GeneratedPdf>

  // auth
  signUp: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logOut: () => void

  // family
  updateFamily: (patch: Partial<Family>) => void

  // children
  addChild: (data: Partial<Child>) => string
  updateChild: (childId: string, patch: Partial<Child>) => void
  deleteChild: (childId: string) => void
  setActiveChild: (childId: string | null) => void

  // custom tasks
  addCustomTask: (data: Omit<CustomTask, 'id' | 'familyId' | 'createdAt'>) => string
  updateCustomTask: (id: string, patch: Partial<CustomTask>) => void
  deleteCustomTask: (id: string) => void

  // child-task relation
  setSelectedBankTasks: (childId: string, taskIds: string[]) => void
  linkCustomTaskToChild: (childId: string, customTaskId: string) => string
  updateChildTask: (id: string, patch: Partial<ChildTask>) => void
  removeChildTask: (id: string) => void

  // routines
  getOrCreateRoutine: (childId: string, day: Weekday) => Routine
  addRoutineItem: (childId: string, day: Weekday, period: PeriodOfDay, childTaskId: string, time?: string | null) => void
  updateRoutineItem: (childId: string, day: Weekday, period: PeriodOfDay, itemId: string, patch: Partial<RoutineItem>) => void
  removeRoutineItem: (childId: string, day: Weekday, period: PeriodOfDay, itemId: string) => void
  reorderRoutinePeriod: (childId: string, day: Weekday, period: PeriodOfDay, orderedIds: string[]) => void
  moveRoutineItem: (childId: string, day: Weekday, fromPeriod: PeriodOfDay, toPeriod: PeriodOfDay, itemId: string, toIndex: number) => void
  setRoutineMode: (childId: string, day: Weekday, mode: Routine['mode']) => void
  copyRoutineDay: (childId: string, fromDay: Weekday, toDays: Weekday[]) => void

  // weekly tasks
  addWeeklyTask: (childId: string, day: Weekday, childTaskId: string, time?: string | null) => void
  updateWeeklyTask: (id: string, patch: Partial<WeeklyTaskItem>) => void
  removeWeeklyTask: (id: string) => void
  reorderWeeklyDay: (childId: string, day: Weekday, orderedIds: string[]) => void
  copyWeeklyDay: (childId: string, fromDay: Weekday, toDays: Weekday[]) => void

  // special routines
  createSpecialRoutine: (data: Omit<SpecialRoutine, 'id' | 'periods' | 'updatedAt' | 'status'> & { status?: SpecialRoutine['status'] }) => string
  updateSpecialRoutine: (id: string, patch: Partial<SpecialRoutine>) => void
  deleteSpecialRoutine: (id: string) => void
  addSpecialRoutineItem: (id: string, period: PeriodOfDay, childTaskId: string, time?: string | null) => void
  removeSpecialRoutineItem: (id: string, period: PeriodOfDay, itemId: string) => void
  reorderSpecialRoutinePeriod: (id: string, period: PeriodOfDay, orderedIds: string[]) => void

  // how-to cards
  createHowToCard: (data: Partial<HowToCard> & { title: string }) => string
  updateHowToCard: (id: string, patch: Partial<HowToCard>) => void
  deleteHowToCard: (id: string) => void
  addHowToStep: (cardId: string, text: string) => void
  updateHowToStep: (cardId: string, stepId: string, patch: Partial<HowToCard['steps'][number]>) => void
  removeHowToStep: (cardId: string, stepId: string) => void
  reorderHowToSteps: (cardId: string, orderedIds: string[]) => void

  // pdfs
  addGeneratedPdf: (childId: string, type: PdfType, fileDataUrl: string | null, routineVersion?: number | null) => string
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      activeChildId: null,
      users: {},
      families: {},
      children: {},
      customTasks: {},
      childTasks: {},
      routines: {},
      weeklyTasks: {},
      specialRoutines: {},
      howToCards: {},
      pdfs: {},

      signUp: async (name, email, password) => {
        const existing = Object.values(get().users).find((u) => u.email.toLowerCase() === email.toLowerCase())
        if (existing) return { ok: false, error: 'Já existe uma conta com esse e-mail.' }

        const passwordHash = await hashPassword(password)
        const userId = uuid()
        const familyId = uuid()

        const user: UserAccount = {
          id: userId,
          name,
          email,
          passwordHash,
          createdAt: new Date().toISOString(),
          settings: {},
          familyId,
        }
        const family: Family = {
          id: familyId,
          name: '',
          ownerUserId: userId,
          environment: null,
          features: [],
          notes: '',
          childrenIds: [],
          customTaskIds: [],
          pdfIds: [],
          createdAt: new Date().toISOString(),
        }

        set((s) => ({
          users: { ...s.users, [userId]: user },
          families: { ...s.families, [familyId]: family },
          currentUserId: userId,
        }))
        return { ok: true }
      },

      logIn: async (email, password) => {
        const user = Object.values(get().users).find((u) => u.email.toLowerCase() === email.toLowerCase())
        if (!user) return { ok: false, error: 'Não encontramos uma conta com esse e-mail.' }
        const passwordHash = await hashPassword(password)
        if (passwordHash !== user.passwordHash) return { ok: false, error: 'Senha incorreta.' }
        set({ currentUserId: user.id })
        return { ok: true }
      },

      logOut: () => set({ currentUserId: null, activeChildId: null }),

      updateFamily: (patch) => {
        const user = get().users[get().currentUserId ?? '']
        if (!user?.familyId) return
        set((s) => ({
          families: { ...s.families, [user.familyId!]: { ...s.families[user.familyId!], ...patch } },
        }))
      },

      addChild: (data) => {
        const user = get().users[get().currentUserId ?? '']
        if (!user?.familyId) return ''
        const id = uuid()
        const child: Child = {
          id,
          familyId: user.familyId,
          name: '',
          photo: null,
          age: null,
          gender: null,
          school: { attends: false, shift: null, entryTime: null, exitTime: null },
          extracurricular: [],
          wakeTime: null,
          sleepTime: null,
          interests: [],
          characteristics: '',
          autonomyLevel: null,
          selectedTaskIds: [],
          customTaskIds: [],
          createdAt: new Date().toISOString(),
          onboardingStep: 0,
          ...data,
        }
        set((s) => ({
          children: { ...s.children, [id]: child },
          families: {
            ...s.families,
            [user.familyId!]: {
              ...s.families[user.familyId!],
              childrenIds: [...s.families[user.familyId!].childrenIds, id],
            },
          },
          activeChildId: s.activeChildId ?? id,
        }))
        return id
      },

      updateChild: (childId, patch) =>
        set((s) => ({ children: { ...s.children, [childId]: { ...s.children[childId], ...patch } } })),

      deleteChild: (childId) =>
        set((s) => {
          const { [childId]: _removed, ...rest } = s.children
          const families = { ...s.families }
          for (const fam of Object.values(families)) {
            if (fam.childrenIds.includes(childId)) {
              families[fam.id] = { ...fam, childrenIds: fam.childrenIds.filter((id) => id !== childId) }
            }
          }
          return {
            children: rest,
            families,
            activeChildId: s.activeChildId === childId ? null : s.activeChildId,
          }
        }),

      setActiveChild: (childId) => set({ activeChildId: childId }),

      addCustomTask: (data) => {
        const user = get().users[get().currentUserId ?? '']
        if (!user?.familyId) return ''
        const id = uuid()
        const task: CustomTask = { id, familyId: user.familyId, createdAt: new Date().toISOString(), ...data }
        set((s) => ({
          customTasks: { ...s.customTasks, [id]: task },
          families: {
            ...s.families,
            [user.familyId!]: {
              ...s.families[user.familyId!],
              customTaskIds: [...s.families[user.familyId!].customTaskIds, id],
            },
          },
        }))
        return id
      },

      updateCustomTask: (id, patch) =>
        set((s) => ({ customTasks: { ...s.customTasks, [id]: { ...s.customTasks[id], ...patch } } })),

      deleteCustomTask: (id) =>
        set((s) => {
          const { [id]: _removed, ...rest } = s.customTasks
          return { customTasks: rest }
        }),

      setSelectedBankTasks: (childId, taskIds) => {
        const child = get().children[childId]
        if (!child) return
        const currentBankLinks = Object.values(get().childTasks).filter(
          (ct) => ct.childId === childId && ct.taskId,
        )
        const toRemove = currentBankLinks.filter((ct) => !taskIds.includes(ct.taskId!))
        const existingIds = new Set(currentBankLinks.map((ct) => ct.taskId))
        const toAdd = taskIds.filter((id) => !existingIds.has(id))

        set((s) => {
          const childTasks = { ...s.childTasks }
          for (const ct of toRemove) delete childTasks[ct.id]
          for (const taskId of toAdd) {
            const id = uuid()
            childTasks[id] = {
              id,
              childId,
              taskId,
              customTaskId: null,
              overrideName: null,
              overrideDescription: null,
              overrideDuration: null,
              overrideIcon: null,
              notes: null,
              createdAt: new Date().toISOString(),
            }
          }
          const selectedTaskIds = taskIds
          return {
            childTasks,
            children: { ...s.children, [childId]: { ...s.children[childId], selectedTaskIds } },
          }
        })
      },

      linkCustomTaskToChild: (childId, customTaskId) => {
        const id = uuid()
        set((s) => ({
          childTasks: {
            ...s.childTasks,
            [id]: {
              id,
              childId,
              taskId: null,
              customTaskId,
              overrideName: null,
              overrideDescription: null,
              overrideDuration: null,
              overrideIcon: null,
              notes: null,
              createdAt: new Date().toISOString(),
            },
          },
          children: {
            ...s.children,
            [childId]: { ...s.children[childId], customTaskIds: [...(s.children[childId]?.customTaskIds ?? []), customTaskId] },
          },
        }))
        return id
      },

      updateChildTask: (id, patch) =>
        set((s) => ({ childTasks: { ...s.childTasks, [id]: { ...s.childTasks[id], ...patch } } })),

      removeChildTask: (id) =>
        set((s) => {
          const { [id]: _removed, ...rest } = s.childTasks
          return { childTasks: rest }
        }),

      getOrCreateRoutine: (childId, day) => {
        const key = routineKey(childId, day)
        const existing = get().routines[key]
        if (existing) return existing
        const routine: Routine = {
          id: uuid(),
          childId,
          day,
          version: 1,
          status: 'ativa',
          periods: emptyPeriods(),
          mode: 'sequencia',
          updatedAt: new Date().toISOString(),
        }
        set((s) => ({ routines: { ...s.routines, [key]: routine } }))
        return routine
      },

      addRoutineItem: (childId, day, period, childTaskId, time = null) => {
        get().getOrCreateRoutine(childId, day)
        const key = routineKey(childId, day)
        set((s) => {
          const routine = s.routines[key]
          const items = routine.periods[period]
          const item: RoutineItem = {
            id: uuid(),
            childTaskId,
            time,
            order: items.length,
            durationMinutes: null,
            note: null,
          }
          return {
            routines: {
              ...s.routines,
              [key]: {
                ...routine,
                periods: { ...routine.periods, [period]: [...items, item] },
                updatedAt: new Date().toISOString(),
              },
            },
          }
        })
      },

      updateRoutineItem: (childId, day, period, itemId, patch) => {
        const key = routineKey(childId, day)
        set((s) => {
          const routine = s.routines[key]
          if (!routine) return {}
          const items = routine.periods[period].map((it) => (it.id === itemId ? { ...it, ...patch } : it))
          return {
            routines: {
              ...s.routines,
              [key]: { ...routine, periods: { ...routine.periods, [period]: items }, updatedAt: new Date().toISOString() },
            },
          }
        })
      },

      removeRoutineItem: (childId, day, period, itemId) => {
        const key = routineKey(childId, day)
        set((s) => {
          const routine = s.routines[key]
          if (!routine) return {}
          const items = routine.periods[period].filter((it) => it.id !== itemId)
          return {
            routines: {
              ...s.routines,
              [key]: { ...routine, periods: { ...routine.periods, [period]: items }, updatedAt: new Date().toISOString() },
            },
          }
        })
      },

      reorderRoutinePeriod: (childId, day, period, orderedIds) => {
        const key = routineKey(childId, day)
        set((s) => {
          const routine = s.routines[key]
          if (!routine) return {}
          const byId = new Map(routine.periods[period].map((it) => [it.id, it]))
          const items = orderedIds.map((id, idx) => ({ ...byId.get(id)!, order: idx }))
          return {
            routines: {
              ...s.routines,
              [key]: { ...routine, periods: { ...routine.periods, [period]: items }, updatedAt: new Date().toISOString() },
            },
          }
        })
      },

      moveRoutineItem: (childId, day, fromPeriod, toPeriod, itemId, toIndex) => {
        const key = routineKey(childId, day)
        set((s) => {
          const routine = s.routines[key]
          if (!routine) return {}
          const fromItems = [...routine.periods[fromPeriod]]
          const idx = fromItems.findIndex((it) => it.id === itemId)
          if (idx === -1) return {}
          const [moved] = fromItems.splice(idx, 1)
          const toItems = fromPeriod === toPeriod ? fromItems : [...routine.periods[toPeriod]]
          toItems.splice(toIndex, 0, moved)
          const withOrder = (arr: RoutineItem[]) => arr.map((it, i) => ({ ...it, order: i }))
          return {
            routines: {
              ...s.routines,
              [key]: {
                ...routine,
                periods: {
                  ...routine.periods,
                  [fromPeriod]: withOrder(fromItems),
                  [toPeriod]: withOrder(toItems),
                },
                updatedAt: new Date().toISOString(),
              },
            },
          }
        })
      },

      setRoutineMode: (childId, day, mode) => {
        get().getOrCreateRoutine(childId, day)
        const key = routineKey(childId, day)
        set((s) => ({ routines: { ...s.routines, [key]: { ...s.routines[key], mode } } }))
      },

      copyRoutineDay: (childId, fromDay, toDays) => {
        const fromRoutine = get().getOrCreateRoutine(childId, fromDay)
        set((s) => {
          const routines = { ...s.routines }
          for (const day of toDays) {
            const key = routineKey(childId, day)
            const clonedPeriods = PERIODS.reduce(
              (acc, period) => {
                acc[period] = fromRoutine.periods[period].map((it) => ({ ...it, id: uuid() }))
                return acc
              },
              {} as Routine['periods'],
            )
            routines[key] = {
              id: routines[key]?.id ?? uuid(),
              childId,
              day,
              version: (routines[key]?.version ?? 0) + 1,
              status: 'ativa',
              periods: clonedPeriods,
              mode: fromRoutine.mode,
              updatedAt: new Date().toISOString(),
            }
          }
          return { routines }
        })
      },

      addWeeklyTask: (childId, day, childTaskId, time = null) => {
        const id = uuid()
        set((s) => {
          const dayItems = Object.values(s.weeklyTasks).filter((w) => w.childId === childId && w.day === day)
          const item: WeeklyTaskItem = { id, childId, day, childTaskId, order: dayItems.length, time, status: 'ativa' }
          return { weeklyTasks: { ...s.weeklyTasks, [id]: item } }
        })
      },

      updateWeeklyTask: (id, patch) =>
        set((s) => ({ weeklyTasks: { ...s.weeklyTasks, [id]: { ...s.weeklyTasks[id], ...patch } } })),

      removeWeeklyTask: (id) =>
        set((s) => {
          const { [id]: _removed, ...rest } = s.weeklyTasks
          return { weeklyTasks: rest }
        }),

      reorderWeeklyDay: (_childId, _day, orderedIds) =>
        set((s) => {
          const weeklyTasks = { ...s.weeklyTasks }
          orderedIds.forEach((id, idx) => {
            if (weeklyTasks[id]) weeklyTasks[id] = { ...weeklyTasks[id], order: idx }
          })
          return { weeklyTasks }
        }),

      copyWeeklyDay: (childId, fromDay, toDays) => {
        const fromItems = Object.values(get().weeklyTasks).filter((w) => w.childId === childId && w.day === fromDay)
        set((s) => {
          const weeklyTasks = { ...s.weeklyTasks }
          for (const day of toDays) {
            // remove existing items for that target day, replace with fresh copies
            for (const [id, item] of Object.entries(weeklyTasks)) {
              if (item.childId === childId && item.day === day) delete weeklyTasks[id]
            }
            for (const item of fromItems) {
              const id = uuid()
              weeklyTasks[id] = { ...item, id, day }
            }
          }
          return { weeklyTasks }
        })
      },

      createSpecialRoutine: (data) => {
        const id = uuid()
        const routine: SpecialRoutine = {
          id,
          status: data.status ?? 'rascunho',
          periods: emptyPeriods(),
          updatedAt: new Date().toISOString(),
          ...data,
        } as SpecialRoutine
        set((s) => ({ specialRoutines: { ...s.specialRoutines, [id]: routine } }))
        return id
      },

      updateSpecialRoutine: (id, patch) =>
        set((s) => ({
          specialRoutines: { ...s.specialRoutines, [id]: { ...s.specialRoutines[id], ...patch, updatedAt: new Date().toISOString() } },
        })),

      deleteSpecialRoutine: (id) =>
        set((s) => {
          const { [id]: _removed, ...rest } = s.specialRoutines
          return { specialRoutines: rest }
        }),

      addSpecialRoutineItem: (id, period, childTaskId, time = null) =>
        set((s) => {
          const routine = s.specialRoutines[id]
          if (!routine) return {}
          const items = routine.periods[period]
          const item: RoutineItem = { id: uuid(), childTaskId, time, order: items.length, durationMinutes: null, note: null }
          return {
            specialRoutines: {
              ...s.specialRoutines,
              [id]: { ...routine, periods: { ...routine.periods, [period]: [...items, item] }, updatedAt: new Date().toISOString() },
            },
          }
        }),

      removeSpecialRoutineItem: (id, period, itemId) =>
        set((s) => {
          const routine = s.specialRoutines[id]
          if (!routine) return {}
          const items = routine.periods[period].filter((it) => it.id !== itemId)
          return {
            specialRoutines: {
              ...s.specialRoutines,
              [id]: { ...routine, periods: { ...routine.periods, [period]: items }, updatedAt: new Date().toISOString() },
            },
          }
        }),

      reorderSpecialRoutinePeriod: (id, period, orderedIds) =>
        set((s) => {
          const routine = s.specialRoutines[id]
          if (!routine) return {}
          const byId = new Map(routine.periods[period].map((it) => [it.id, it]))
          const items = orderedIds.map((itId, idx) => ({ ...byId.get(itId)!, order: idx }))
          return {
            specialRoutines: {
              ...s.specialRoutines,
              [id]: { ...routine, periods: { ...routine.periods, [period]: items }, updatedAt: new Date().toISOString() },
            },
          }
        }),

      createHowToCard: (data) => {
        const user = get().users[get().currentUserId ?? '']
        const id = uuid()
        const card: HowToCard = {
          id,
          childId: null,
          familyId: user?.familyId ?? '',
          taskId: null,
          customTaskId: null,
          mainImage: null,
          steps: [],
          visualSettings: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...data,
        }
        set((s) => ({ howToCards: { ...s.howToCards, [id]: card } }))
        return id
      },

      updateHowToCard: (id, patch) =>
        set((s) => ({
          howToCards: { ...s.howToCards, [id]: { ...s.howToCards[id], ...patch, updatedAt: new Date().toISOString() } },
        })),

      deleteHowToCard: (id) =>
        set((s) => {
          const { [id]: _removed, ...rest } = s.howToCards
          return { howToCards: rest }
        }),

      addHowToStep: (cardId, text) =>
        set((s) => {
          const card = s.howToCards[cardId]
          if (!card) return {}
          const step = { id: uuid(), order: card.steps.length, text, image: null }
          return {
            howToCards: { ...s.howToCards, [cardId]: { ...card, steps: [...card.steps, step], updatedAt: new Date().toISOString() } },
          }
        }),

      updateHowToStep: (cardId, stepId, patch) =>
        set((s) => {
          const card = s.howToCards[cardId]
          if (!card) return {}
          const steps = card.steps.map((st) => (st.id === stepId ? { ...st, ...patch } : st))
          return { howToCards: { ...s.howToCards, [cardId]: { ...card, steps, updatedAt: new Date().toISOString() } } }
        }),

      removeHowToStep: (cardId, stepId) =>
        set((s) => {
          const card = s.howToCards[cardId]
          if (!card) return {}
          const steps = card.steps.filter((st) => st.id !== stepId).map((st, idx) => ({ ...st, order: idx }))
          return { howToCards: { ...s.howToCards, [cardId]: { ...card, steps, updatedAt: new Date().toISOString() } } }
        }),

      reorderHowToSteps: (cardId, orderedIds) =>
        set((s) => {
          const card = s.howToCards[cardId]
          if (!card) return {}
          const byId = new Map(card.steps.map((st) => [st.id, st]))
          const steps = orderedIds.map((id, idx) => ({ ...byId.get(id)!, order: idx }))
          return { howToCards: { ...s.howToCards, [cardId]: { ...card, steps, updatedAt: new Date().toISOString() } } }
        }),

      addGeneratedPdf: (childId, type, fileDataUrl, routineVersion = null) => {
        const id = uuid()
        const pdf: GeneratedPdf = {
          id,
          childId,
          type,
          routineVersion,
          generatedAt: new Date().toISOString(),
          fileDataUrl,
          visualSettings: {},
        }
        const user = get().users[get().currentUserId ?? '']
        set((s) => ({
          pdfs: { ...s.pdfs, [id]: pdf },
          families: user?.familyId
            ? {
                ...s.families,
                [user.familyId]: { ...s.families[user.familyId], pdfIds: [...s.families[user.familyId].pdfIds, id] },
              }
            : s.families,
        }))
        return id
      },
    }),
    {
      name: 'afterschol-storage',
    },
  ),
)

export type { SpecialRoutineType }
