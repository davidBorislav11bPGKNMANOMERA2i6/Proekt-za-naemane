import { useState } from "react";
import { BUSINESSES } from "./config";
import { useDB } from "./utils";
import Home from "./components/Home.jsx";
import Book from "./components/Book.jsx";
import Reservations from "./components/Reservations.jsx";
import { Login, Register, Profile } from "./components/Account.jsx";

const Icon = ({ d }) => ( // SVG икона
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>
);
const ICONS = {
  home: "M3 11 12 3l9 8M5 10v10h14V10M10 20v-6h4v6",
  user: "M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c0-4 4-6 8-6s8 2 8 6",
  list: "M6 3h9l4 4v14H6zM9 12h7M9 16h5M14 3v5h5",
  search: "M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM15 15l6 6",
};
const NEEDS_LOGIN = ["profile", "res", "book"];

export default function App() {
  const [db, setDb] = useDB();
  const [view, setView] = useState({ name: "home" });
  const [q, setQ] = useState("");

  const user = db.users.find((u) => u.email === db.sess) || null; // Проверка дали има активен потребител
  const go = (name, id = null, note = "") => { setView({ name, id, note }); window.scrollTo(0, 0); }; // Функция за смяна на изгледа
  const name = NEEDS_LOGIN.includes(view.name) && !user ? "login" : view.name;
  const active = { home: "home", book: "home", login: "user", register: "user", profile: "user", res: "list" }[name];// Определяне на активния бутон в менюто
  const logout = () => { setDb({ ...db, sess: null }); go("home"); };// Функция за изход от профила

  const nav = (key, label, target) => ( //Навигационно меню
    <button className="ic" title={label} aria-label={label}
      aria-current={active === key ? "page" : undefined}
      onClick={() => { if (key === "home") setQ(""); go(target); }}>
      <Icon d={ICONS[key === "res" ? "list" : key]} />
    </button>
  );

  return (
    <>
      <header>
        <nav aria-label="Меню">
          {nav("home", "Начало", "home")}
          {nav("user", "Профил", user ? "profile" : "login")}
          {nav("list", "Моите резервации", user ? "res" : "login")}
        </nav>
        <label className="search">
          <Icon d={ICONS.search} />
          <input type="search" value={q} placeholder="Търсачка по име или тип…"
            onChange={(e) => { setQ(e.target.value); if (view.name !== "home") go("home"); }} />
        </label>
        {user && <div className="who">{user.name} <button className="btn l" onClick={logout}>Изход</button></div>}
      </header>
                              
      <main> 
        {name === "home" && <Home q={q} user={user} go={go} />} 
        {name === "book" && <Book biz={BUSINESSES.find((b) => b.id === view.id)} db={db} setDb={setDb} user={user} go={go} />} 
        {name === "res" && <Reservations db={db} setDb={setDb} user={user} go={go} />}
        {name === "login" && <Login db={db} setDb={setDb} go={go} note={view.note} />}
        {name === "register" && <Register db={db} setDb={setDb} go={go} />}
        {name === "profile" && <Profile db={db} setDb={setDb} user={user} />}
      </main>
    </>
  );
}
