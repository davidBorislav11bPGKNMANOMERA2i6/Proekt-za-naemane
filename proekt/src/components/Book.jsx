import { useState } from "react";
import { SETTINGS } from "../config";
import { today, addDays, fmt, weekday, slotTimes, nowHM } from "../utils";

const Arrow = ({ d }) => <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>; // SVG икона 

export default function Book({ biz, db, setDb, user, go }) { // Резервация за конкретен бизнес
  const [start, setStart] = useState(today());
  const [sel, setSel] = useState(null);
  const [people, setPeople] = useState(biz.multiPerson ? 2 : 1);
  const [err, setErr] = useState("");
  const times = slotTimes();
  const days = [0, 1, 2].map((i) => addDays(start, i));

  // Час е зает, ако е минал или вече има резервация за него
  const free = (d, t) =>
    !(d < today() || (d === today() && t <= nowHM())) &&
    !db.res.some((r) => r.biz === biz.id && r.date === d && r.time === t);

  const shift = (n) => { const s = addDays(start, n); setStart(s < today() ? today() : s); }; // Смяна на началния ден за показване на 3 дни напред

  const submit = () => { // Потвърждаване на резервацията
    if (!sel) return setErr("Избери свободен час.");
    if (!(people >= 1 && people <= SETTINGS.maxPeople)) return setErr(`Броят души трябва да е между 1 и ${SETTINGS.maxPeople}.`);
    if (!free(sel.d, sel.t)) return setErr("Този час вече не е свободен.");
    setDb((d) => ({ ...d, res: [...d.res, { id: Date.now(), user: user.email, biz: biz.id, date: sel.d, time: sel.t, people }] }));
    go("res");
  };

  return ( // JSX за резервационната форма
    <div className="form wide">
      <h1>Резервация</h1>
      <p className="sub center"><b>{biz.name}</b><br />{biz.addr}</p>

      <div className="cn"> 
        <button className="ic" aria-label="Предишни дни" disabled={start <= today()} onClick={() => shift(-3)}><Arrow d="M19 12H5M11 6l-6 6 6 6" /></button>
        <button className="ic" aria-label="Следващи дни" disabled={start >= addDays(today(), SETTINGS.daysAhead - 3)} onClick={() => shift(3)}><Arrow d="M5 12h14M13 6l6 6-6 6" /></button>
      </div>

      <div className="cal">
        {days.map((d) => (
          <div className="day" key={d}>
            <h3>{weekday(d)}<small>{fmt(d)}</small></h3>
            <div className="sl">
              {times.map((t) => {
                const on = sel?.d === d && sel?.t === t;
                return ( // Генериране на бутоните за часовете
                  <button key={t} className={"slot" + (on ? " sel" : "")} disabled={!free(d, t)}
                    aria-pressed={on} onClick={() => { setSel({ d, t }); setErr(""); }}>{t}</button>
                );
              })}
            </div>
          </div>
        ))}
      </div> 

      <p className="pick">{sel ? `Избрано: ${fmt(sel.d)} в ${sel.t} ч.` : "Избери свободен час"}</p> 

      {biz.multiPerson && ( // Ако бизнесът позволява избор на брой души, показваме полето за брой души
        <div className="people">
          <label htmlFor="people">Брой души</label>
          <input id="people" type="number" min="1" max={SETTINGS.maxPeople} value={people} onChange={(e) => setPeople(+e.target.value)} />
        </div>
      )}

      <p className="msg center">{err}</p>  
      <div className="act">
        <button className="btn p" onClick={submit}>Потвърди резервацията</button> 
        <button className="btn l" onClick={() => go("home")}>Назад</button> 
      </div>
    </div>
  );
}
