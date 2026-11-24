import { useEffect, useState } from "react";
import { BUSINESSES } from "../config";
import { today, fmt } from "../utils";

export default function Reservations({ db, setDb, user, go }) {
  const [sure, setSure] = useState(null); // id на резервацията, чакаща потвърждение за отказ

  useEffect(() => { // Ако потребителят не потвърди отказа в рамките на 4 секунди, изчистваме състоянието
    if (sure === null) return; 
    const t = setTimeout(() => setSure(null), 4000);
    return () => clearTimeout(t);
  }, [sure]);

  const list = db.res  // Взимаме всички резервации на текущия потребител, които са за валидни бизнеси
    .filter((r) => r.user === user.email && BUSINESSES.some((b) => b.id === r.biz))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const cancel = (id) => { // Ако потребителят потвърди отказа, премахваме резервацията от базата данни
    if (sure === id) { setDb((d) => ({ ...d, res: d.res.filter((r) => r.id !== id) })); setSure(null); }
    else setSure(id);
  };

  return ( // JSX за страницата с резервации
    <>
      <h1>Моите резервации</h1> 
      <p className="sub">Предстоящи и минали резервации.</p>
      {!list.length && (
        <div className="empty">Все още нямаш резервации.<br /><br /> 
          <button className="btn p" onClick={() => go("home")}>Намери бизнес</button> 
        </div> 
      )}
      {list.map((r) => { // Рендериране на всяка резервация
        const b = BUSINESSES.find((x) => x.id === r.biz);
        return (  // JSX за отделна резервация
          <div className="res" key={r.id}> 
            <div>
              <b>{b.name}</b> 
              <small>{b.type} · {b.addr}</small>
              <small>{fmt(r.date)} в {r.time} ч.{r.people > 1 && ` · ${r.people} души`}{r.date < today() && " · изминала"}</small>
            </div> 
            <button className={"btn " + (sure === r.id ? "p" : "d")} onClick={() => cancel(r.id)}> 
              {sure === r.id ? "Потвърди отказа" : "Откажи"}
            </button>
          </div>
        );
      })}
    </>
  );
}
