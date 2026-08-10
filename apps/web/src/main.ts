const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Hayel app root not found");

const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const tenantId = import.meta.env.VITE_TENANT_ID ?? "";

type Employee = {
  id: string;
  employee_number?: string;
  first_name: string;
  last_name: string;
  status: string;
};

app.innerHTML = `
  <main class="shell">
    <header class="topbar"><div class="brand">HAYEL</div><div class="workspace">Workforce Intelligence</div></header>
    <section class="content">
      <div class="eyebrow">HAYEL CORE</div>
      <h1>People</h1>
      <p class="subtitle">Your workforce, organized around the decisions that matter.</p>
      <div class="toolbar"><input id="search" aria-label="Search employees" placeholder="Search people" /><button id="refresh" type="button">Refresh</button></div>
      <section class="card"><div class="card-head"><span>Employees</span><span id="count" class="muted">Loading…</span></div><div id="state" class="empty">Loading employees…</div><div id="list" class="list"></div></section>
    </section>
  </main>`;

const style = document.createElement("style");
style.textContent = `:root{font-family:Inter,system-ui,sans-serif;color:#111;background:#f7f7f5}*{box-sizing:border-box}body{margin:0}.topbar{height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 32px;background:#fff;border-bottom:1px solid #e8e8e8}.brand{font-weight:900;letter-spacing:.12em}.workspace{color:#666;font-size:14px}.content{max-width:1200px;margin:auto;padding:56px 32px}.eyebrow{font-size:12px;font-weight:800;letter-spacing:.14em;color:#666}h1{margin:8px 0;font-size:42px}.subtitle{color:#666;margin-bottom:32px}.toolbar{display:flex;gap:12px;margin-bottom:20px}input{flex:1;padding:12px 14px;border:1px solid #ddd;border-radius:8px;font:inherit}button{border:0;border-radius:8px;padding:12px 18px;background:#111;color:#fff;font-weight:700}.card{background:#fff;border:1px solid #e6e6e6;border-radius:12px;overflow:hidden}.card-head{padding:18px 20px;display:flex;justify-content:space-between;border-bottom:1px solid #eee;font-weight:700}.muted{color:#777;font-weight:400}.empty{padding:64px 20px;text-align:center;color:#777}.list{display:grid}.person{display:flex;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #eee}.name{font-weight:700}.meta{font-size:13px;color:#777;margin-top:4px}.status{font-size:12px;font-weight:700}`;
document.head.appendChild(style);

const state = document.querySelector<HTMLDivElement>("#state")!;
const list = document.querySelector<HTMLDivElement>("#list")!;
const count = document.querySelector<HTMLSpanElement>("#count")!;
const search = document.querySelector<HTMLInputElement>("#search")!;

let employees: Employee[] = [];

async function loadEmployees(): Promise<void> {
  if (!tenantId) {
    state.textContent = "Tenant context is not configured.";
    count.textContent = "Configuration required";
    return;
  }
  state.textContent = "Loading employees…";
  list.replaceChildren();
  try {
    const response = await fetch(`${apiBase}/api/v1/employees`, { headers: { "X-Tenant-ID": tenantId } });
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const body = (await response.json()) as { data: Employee[] };
    employees = body.data;
    render();
  } catch {
    state.textContent = "Unable to load employees. Check the API connection.";
    count.textContent = "Unavailable";
  }
}

function render(): void {
  const term = search.value.trim().toLowerCase();
  const filtered = employees.filter((employee) => `${employee.first_name} ${employee.last_name} ${employee.employee_number ?? ""}`.toLowerCase().includes(term));
  count.textContent = `${filtered.length} people`;
  state.hidden = filtered.length > 0;
  list.replaceChildren(...filtered.map((employee) => {
    const row = document.createElement("article");
    row.className = "person";
    row.innerHTML = `<div><div class="name"></div><div class="meta"></div></div><div class="status"></div>`;
    row.querySelector(".name")!.textContent = `${employee.first_name} ${employee.last_name}`;
    row.querySelector(".meta")!.textContent = employee.employee_number ?? employee.id;
    row.querySelector(".status")!.textContent = employee.status;
    return row;
  }));
}

document.querySelector<HTMLButtonElement>("#refresh")!.addEventListener("click", () => void loadEmployees());
search.addEventListener("input", render);
void loadEmployees();
