import { createApiClient, type Employee } from "./api.js";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Hayel app root not found");

const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const tenantId = import.meta.env.VITE_TENANT_ID ?? "";
const client = createApiClient(apiBase, tenantId);

app.innerHTML = `<main class="shell"><header class="topbar"><div class="brand">HAYEL</div><div class="workspace">Workforce Intelligence</div></header><section class="content"><div id="view"></div></section></main>`;
const view = document.querySelector<HTMLDivElement>("#view")!;

function renderShell(title: string, subtitle: string, body: string): void {
  view.innerHTML = `<div class="eyebrow">HAYEL CORE</div><h1>${title}</h1><p class="subtitle">${subtitle}</p>${body}`;
}

function renderPeople(): void {
  renderShell("People", "Your workforce, organized around the decisions that matter.", `<div class="toolbar"><input id="search" aria-label="Search employees" placeholder="Search people" /><button id="refresh" type="button">Refresh</button></div><section class="card"><div class="card-head"><span>Employees</span><span id="count" class="muted">Loading…</span></div><div id="state" class="empty">Loading employees…</div><div id="list" class="list"></div></section>`);
  const state = document.querySelector<HTMLDivElement>("#state")!;
  const list = document.querySelector<HTMLDivElement>("#list")!;
  const count = document.querySelector<HTMLSpanElement>("#count")!;
  const search = document.querySelector<HTMLInputElement>("#search")!;
  let employees: Employee[] = [];
  const render = () => {
    const term = search.value.trim().toLowerCase();
    const filtered = employees.filter((e) => `${e.display_name} ${e.id}`.toLowerCase().includes(term));
    count.textContent = `${filtered.length} people`;
    state.hidden = filtered.length > 0;
    list.replaceChildren(...filtered.map((employee) => {
      const row = document.createElement("button");
      row.type = "button"; row.className = "person";
      row.innerHTML = `<span><strong></strong><small></small></span><span class="status"></span>`;
      row.querySelector("strong")!.textContent = employee.display_name;
      row.querySelector("small")!.textContent = employee.id;
      row.querySelector(".status")!.textContent = employee.active ? "Active" : "Inactive";
      row.addEventListener("click", () => { location.hash = `employee/${encodeURIComponent(employee.id)}`; });
      return row;
    }));
  };
  const load = async () => {
    if (!tenantId) { state.textContent = "Tenant context is not configured."; return; }
    try { employees = await client.listEmployees(); render(); }
    catch { state.textContent = "Unable to load employees. Check the API connection."; }
  };
  search.addEventListener("input", render);
  document.querySelector<HTMLButtonElement>("#refresh")!.addEventListener("click", () => void load());
  void load();
}

async function renderEmployee(id: string): Promise<void> {
  renderShell("Employee", "Employee profile and workforce context.", `<button id="back" type="button">← Back to People</button><div id="profile" class="card profile"><div class="empty">Loading profile…</div></div>`);
  document.querySelector<HTMLButtonElement>("#back")!.addEventListener("click", () => { location.hash = ""; });
  const profile = document.querySelector<HTMLDivElement>("#profile")!;
  try {
    const employee = await client.getEmployee(id);
    if (!employee) { profile.innerHTML = `<div class="empty">Employee not found.</div>`; return; }
    profile.innerHTML = `<div class="profile-head"><div><div class="eyebrow">EMPLOYEE</div><h2></h2><p class="muted"></p></div><span class="status"></span></div><dl><div><dt>Employee ID</dt><dd></dd></div><div><dt>Organization</dt><dd></dd></div><div><dt>Department</dt><dd></dd></div><div><dt>Position</dt><dd></dd></div><div><dt>Manager</dt><dd></dd></div></dl>`;
    const values = profile.querySelectorAll("dd");
    profile.querySelector("h2")!.textContent = employee.display_name;
    profile.querySelector("p")!.textContent = employee.user_id ?? "No linked user account";
    profile.querySelector(".status")!.textContent = employee.active ? "Active" : "Inactive";
    [employee.id, employee.organization_id, employee.department_id ?? "—", employee.position_id ?? "—", employee.manager_employee_id ?? "—"].forEach((value, i) => { values[i]!.textContent = value; });
  } catch { profile.innerHTML = `<div class="empty">Unable to load employee profile.</div>`; }
}

function route(): void {
  const match = location.hash.match(/^#employee\/(.+)$/);
  if (match) { void renderEmployee(decodeURIComponent(match[1]!)); return; }
  renderPeople();
}

const style = document.createElement("style");
style.textContent = `:root{font-family:Inter,system-ui,sans-serif;color:#111;background:#f7f7f5}*{box-sizing:border-box}body{margin:0}.shell{min-height:100vh}.topbar{height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 32px;background:#fff;border-bottom:1px solid #e8e8e8}.brand{font-weight:900;letter-spacing:.12em}.workspace{color:#666;font-size:14px}.content{max-width:1200px;margin:auto;padding:56px 32px}.eyebrow{font-size:12px;font-weight:800;letter-spacing:.14em;color:#666}h1{margin:8px 0;font-size:42px}h2{font-size:28px;margin:8px 0}.subtitle{color:#666;margin-bottom:32px}.toolbar{display:flex;gap:12px;margin-bottom:20px}input{flex:1;padding:12px 14px;border:1px solid #ddd;border-radius:8px;font:inherit}button{border:0;border-radius:8px;padding:12px 18px;background:#111;color:#fff;font-weight:700}.card{background:#fff;border:1px solid #e6e6e6;border-radius:12px;overflow:hidden}.card-head{padding:18px 20px;display:flex;justify-content:space-between;border-bottom:1px solid #eee;font-weight:700}.muted{color:#777;font-weight:400}.empty{padding:64px 20px;text-align:center;color:#777}.list{display:grid}.person{width:100%;display:flex;justify-content:space-between;text-align:left;padding:18px 20px;border:0;border-bottom:1px solid #eee;border-radius:0;background:#fff;color:#111}.person:hover{background:#f7f7f5}.person strong,.person small{display:block}.person small{color:#777;margin-top:4px}.status{font-size:12px;font-weight:700}.profile{margin-top:24px;padding:28px}.profile-head{display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding-bottom:24px}dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin:28px 0 0}dt{font-size:12px;color:#777;margin-bottom:6px}dd{margin:0;font-weight:600}`;
document.head.appendChild(style);
window.addEventListener("hashchange", route);
route();
