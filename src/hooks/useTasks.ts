import { useEffect, useState } from "react";
import { defaultTasks } from "../data/defaultTasks";
import type { Task } from "../types";
import { todayISO } from "../lib/dates";

const STORAGE_KEY = "rotina-mamae:tasks:v1";

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTasks;
    const saved: Task[] = JSON.parse(raw);
    // Mescla com o banco padrão: mantém progresso salvo e traz tarefas novas
    // que tenham sido adicionadas ao app desde a última visita.
    const savedIds = new Set(saved.map((t) => t.id));
    const merged = [...saved, ...defaultTasks.filter((t) => !savedIds.has(t.id))];
    return merged;
  } catch {
    return defaultTasks;
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  function markDone(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, lastDone: todayISO() } : t)),
    );
  }

  function markUndone(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, lastDone: undefined } : t)),
    );
  }

  function addTask(task: Omit<Task, "id" | "custom">) {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setTasks((prev) => [...prev, { ...task, id, custom: true }]);
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function updateTask(id: string, patch: Partial<Task>) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  return { tasks, markDone, markUndone, addTask, removeTask, updateTask };
}
