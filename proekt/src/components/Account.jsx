import { useState } from "react"; // React hook за състояние на компонентите

function Field({ label, id, form, set, ...rest }) { 
  return ( 
    <div>
      <label htmlFor={id}>{label}</label> 
      <input id={id} value={form[id]} onChange={(e) => set({ ...form, [id]: e.target.value })} {...rest} /> 
    </div>
  );
}

function validate(f, { reg, db, oldEmail }) { //Проверка на валидност в акаунта
  if (!f.name.trim() || !f.sur.trim()) return "Попълни име и фамилия.";
  if (!/^[+\d][\d\s-]{6,}$/.test(f.phone.trim())) return "Въведи валиден телефонен номер.";
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return "Въведи валиден имейл.";
  if (reg || f.pass) {
    if (f.pass.length < 6) return "Паролата трябва да е поне 6 символа.";
    if (f.pass !== f.pass2) return "Паролите не съвпадат.";
  }
  const email = f.email.trim().toLowerCase(); // Проверка за уникалност на имейла
  if (db.users.some((u) => u.email === email && u.email !== oldEmail)) return "Има профил с този имейл.";
  return "";
}

// Обща форма за Регистрация и Редактиране на профил. Използва се и за вход, но без полета за име и фамилия.
function UserForm({ title, initial, reg, btn, db, onSave, extra }) {
  const [form, set] = useState(initial);
  const [msg, setMsg] = useState({ text: "", ok: false });

  const submit = (e) => { 
    e.preventDefault();
    const text = validate(form, { reg, db, oldEmail: initial.oldEmail }); 
    if (text) return setMsg({ text, ok: false });
    const res = onSave({ ...form, name: form.name.trim(), sur: form.sur.trim(), phone: form.phone.trim(), email: form.email.trim().toLowerCase() });
    if (res) setMsg({ text: res, ok: true }); // Успешно запазване на промените
  };

  return (  
    <form className="form" onSubmit={submit}>
      <h1>{title}</h1>
      <div className="row"><Field label="Име" id="name" form={form} set={set} autoComplete="given-name" /><Field label="Фамилия" id="sur" form={form} set={set} autoComplete="family-name" /></div>
      <div className="row"><Field label="Тел. номер" id="phone" form={form} set={set} type="tel" /><Field label="Имейл" id="email" form={form} set={set} type="email" /></div>
      <Field label={reg ? "Парола" : "Парола (остави празно, за да не я променяш)"} id="pass" form={form} set={set} type="password" autoComplete="new-password" />
      <Field label="Повтори паролата" id="pass2" form={form} set={set} type="password" autoComplete="new-password" />
      <p className={"msg" + (msg.ok ? " ok" : "")}>{msg.text}</p>
      <div className="act"><button className="btn p" type="submit">{btn}</button>{extra}</div>
    </form>
  );
}

const BLANK = { name: "", sur: "", phone: "", email: "", pass: "", pass2: "" }; 

export function Register({ db, setDb, go }) {   // Регистрация на нов потребител
  const save = (u) => {
    setDb((d) => ({ ...d, users: [...d.users, { name: u.name, sur: u.sur, phone: u.phone, email: u.email, pass: u.pass }], sess: u.email }));
    go("home");
  };
  return <UserForm title="Регистрация" initial={BLANK} reg btn="Регистрация" db={db} onSave={save}
    extra={<button type="button" className="btn l" onClick={() => go("login")}>Вече имам профил – вход</button>} />;
}

export function Profile({ db, setDb, user }) {  // Редактиране на профил
  const save = (u) => {
    const nu = { name: u.name, sur: u.sur, phone: u.phone, email: u.email, pass: u.pass || user.pass };
    setDb((d) => ({
      ...d,
      users: d.users.map((x) => (x.email === user.email ? nu : x)),
      res: d.res.map((r) => (r.user === user.email ? { ...r, user: nu.email } : r)),
      sess: nu.email,
    }));
    return "Промените са запазени.";
  };
  return <UserForm title="Редактиране" initial={{ ...user, pass: "", pass2: "", oldEmail: user.email }} btn="Редактиране" db={db} onSave={save} />;
}

export function Login({ db, setDb, go, note }) { // Вход в профила
  const [f, set] = useState({ email: "", pass: "" });
  const [err, setErr] = useState(note || "");
  const submit = (e) => {
    e.preventDefault();
    const u = db.users.find((x) => x.email === f.email.trim().toLowerCase() && x.pass === f.pass);
    if (!u) return setErr("Грешен имейл или парола.");
    setDb((d) => ({ ...d, sess: u.email }));
    go("home");
  };
  return ( 
    <form className="form" onSubmit={submit}>
      <h1>Вход</h1>
      <Field label="Имейл" id="email" form={f} set={set} type="email" autoComplete="email" />
      <Field label="Парола" id="pass" form={f} set={set} type="password" autoComplete="current-password" />
      <p className="msg">{err}</p>
      <div className="act">
        <button className="btn p" type="submit">Вход</button>
        <button className="btn" type="button" onClick={() => go("register")}>Регистрация</button>
      </div>
    </form>
  );
}
