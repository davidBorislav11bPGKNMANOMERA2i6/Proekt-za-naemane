import { BUSINESSES } from "../config";

export default function Home({ q, user, go }) {
  const s = q.trim().toLowerCase();
  // Търсене по име НА БИЗНЕСА или по ТИП
  const list = BUSINESSES.filter((b) => !s || b.name.toLowerCase().includes(s) || b.type.toLowerCase().includes(s));

  return ( // JSX за началната страница
    <>
      <h1>Запази маса или час</h1>
      <p className="sub">{s ? `Резултати за „${q.trim()}“: ${list.length}` : "Избери бизнес и направи резервация."}</p>
      {!list.length && <div className="empty">Няма бизнеси с това име или тип. Опитай с друга дума.</div>}
      {list.map((b) => (
        <article className="biz" key={b.id}>
          <div> 
            <h2>{b.name}</h2> 
            <span className="type">{b.type}</span> 
            <div className="addr">{b.addr}</div>
            <p className="desc">{b.desc}</p>
            <button className="btn p" // ред 17-тип на бизнеса, ред 18-адрес, ред 19-описание, ред 20-резервирай
              onClick={() => (user ? go("book", b.id) : go("login", null, "Влез в профила си, за да резервираш."))}>
              Резервирай
            </button> 
          </div>
          <div className="pics" aria-hidden="true"> 
            {b.em.map((e, i) => (
              <div key={i} style={{ background: `hsl(${38 + ((b.hue + i * 25) % 18)},85%,${i === 2 ? 78 : 84}%)` }}>{e}</div> 
            ))}
          </div>
        </article>
      ))}
    </>
  );
}
