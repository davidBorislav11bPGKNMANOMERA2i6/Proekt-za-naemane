import { useEffect, useState } from "react";
import { SETTINGS } from "./config";

const KEY = "rez1";
const EMPTY = { users: [], res: [], sess: null };

// Цялата "база данни" (профили, резервации, вход). React hook, който синхронизира с localStorage.
export function useDB() {
  const [db, setDb] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || EMPTY; } catch { return EMPTY; }
  });
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {  }
  }, [db]);
  return [db, setDb];
}

export const WEEKDAYS = ["неделя", "понеделник", "вторник", "сряда", "четвъртък", "петък", "събота"];
export const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };// Днешна дата в (YYYY-MM-DD)
export const addDays = (s, n) => { const d = new Date(s + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };// Добавяне на дни
export const fmt = (d) => d.split("-").reverse().join("."); // Форматиране на дата (YYYY-MM-DD - DD.MM.YYYY)
export const weekday = (d) => WEEKDAYS[new Date(d + "T00:00:00Z").getUTCDay()]; // Ден от седмицата (0-6) като 0 е неделя
export const nowHM = () => new Date().toTimeString().slice(0, 5); // Текущ час и минути (HH:MM)

export function slotTimes() { // Генериране на всички възможни часове за резервация
  const out = [], pad = (n) => String(n).padStart(2, "0"); // Функция за добавяне на водеща нула
  for (let h = SETTINGS.slotFrom; h <= SETTINGS.slotTo; h++)
    for (let m = 0; m < 60; m += SETTINGS.slotStep) out.push(`${pad(h)}:${pad(m)}`);
  return out;
}
