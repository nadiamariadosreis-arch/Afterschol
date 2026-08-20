import { useEffect, useState } from "react";
import type { Room, RoomType } from "../types";

const STORAGE_KEY = "rotina-mamae:rooms:v1";

function loadRooms(): Room[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Room[]) : [];
  } catch {
    return [];
  }
}

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>(loadRooms);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  }, [rooms]);

  function addRoom(name: string, type: RoomType): Room {
    const room: Room = { id: `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, type };
    setRooms((prev) => [...prev, room]);
    return room;
  }

  function removeRoom(id: string) {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  }

  return { rooms, addRoom, removeRoom };
}
