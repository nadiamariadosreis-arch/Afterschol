import { useEffect, useState } from "react";
import type { DayOfWeek, RoutineProfile } from "../types";

const STORAGE_KEY = "rotina-mamae:profile:v1";

const emptyProfile: RoutineProfile = {
  concerns: [],
  cleaningDay: null,
  cleaningDayMinutes: 90,
};

function loadProfile(): RoutineProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyProfile, ...(JSON.parse(raw) as RoutineProfile) } : emptyProfile;
  } catch {
    return emptyProfile;
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<RoutineProfile>(loadProfile);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  function toggleConcern(id: string) {
    setProfile((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(id)
        ? prev.concerns.filter((c) => c !== id)
        : [...prev.concerns, id],
    }));
  }

  function setCleaningDay(day: DayOfWeek | null) {
    setProfile((prev) => ({ ...prev, cleaningDay: day }));
  }

  function setCleaningDayMinutes(minutes: number) {
    setProfile((prev) => ({ ...prev, cleaningDayMinutes: minutes }));
  }

  return { profile, toggleConcern, setCleaningDay, setCleaningDayMinutes };
}
