const app = document.querySelector<HTMLDivElement>("#app");

if (!app) throw new Error("Hayel app root not found");

app.innerHTML = `
  <main class="shell">
    <header class="topbar">
      <div class="brand">HAYEL</div>
      <div class="workspace">Workforce Intelligence</div>
    </header>
    <section class="content">
      <div class="eyebrow">HAYEL CORE</div>
      <h1>People</h1>
      <p class="subtitle">Your workforce, organized around the decisions that matter.</p>
      <div class="toolbar">
        <input aria-label="Search employees" placeholder="Search people" />
        <button type="button">Add employee</button>
      </div>
      <section class="card">
        <div class="card-head"><span>Employees</span><span class="muted">0 people</span></div>
        <div class="empty">No employees loaded yet.</div>
      </section>
    </section>
  </main>
`;

const style = document.createElement("style");
style.textContent = `
  :root { font-family: Inter, system-ui, sans-serif; color: #111; background: #f7f7f5; }
  * { box-sizing: border-box; }
  body { margin: 0; }
  .shell { min-height: 100vh; }
  .topbar { height: 64px; display:flex; align-items:center; justify-content:space-between; padding:0 32px; background:#fff; border-bottom:1px solid #e8e8e8; }
  .brand { font-weight:900; letter-spacing:.12em; }
  .workspace { color:#666; font-size:14px; }
  .content { max-width:1200px; margin:0 auto; padding:56px 32px; }
  .eyebrow { font-size:12px; font-weight:800; letter-spacing:.14em; color:#666; }
  h1 { margin:8px 0; font-size:42px; }
  .subtitle { color:#666; margin-bottom:32px; }
  .toolbar { display:flex; gap:12px; margin-bottom:20px; }
  input { flex:1; padding:12px 14px; border:1px solid #ddd; border-radius:8px; font:inherit; }
  button { border:0; border-radius:8px; padding:12px 18px; background:#111; color:#fff; font-weight:700; }
  .card { background:#fff; border:1px solid #e6e6e6; border-radius:12px; overflow:hidden; }
  .card-head { padding:18px 20px; display:flex; justify-content:space-between; border-bottom:1px solid #eee; font-weight:700; }
  .muted { color:#777; font-weight:400; }
  .empty { padding:64px 20px; text-align:center; color:#777; }
`;
document.head.appendChild(style);
