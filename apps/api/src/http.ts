import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { EmployeeRepository } from "@hayel/persistence/employee-repository.js";
import { EmploymentRepository } from "@hayel/persistence/employment-repository.js";
import { OrganizationRepository } from "@hayel/persistence/organization-repository.js";
import type { TransactionPool } from "@hayel/persistence/postgres-tenant-transaction.js";

function tenantId(request: IncomingMessage): string | null {
  const value = request.headers["x-tenant-id"];
  return typeof value === "string" && value.trim() ? value : null;
}

function json(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

export function createHayelServer(pool: TransactionPool) {
  const organizations = new OrganizationRepository(pool);
  const employees = new EmployeeRepository(pool);
  const employments = new EmploymentRepository(pool);

  return createServer(async (request, response) => {
    const tenant = tenantId(request);
    if (!tenant) {
      json(response, 400, { error: "tenant_context_required" });
      return;
    }

    try {
      if (request.method === "GET" && request.url === "/api/v1/organizations") {
        json(response, 200, { data: await organizations.list(tenant) });
        return;
      }

      if (request.method === "GET" && request.url === "/api/v1/employees") {
        json(response, 200, { data: await employees.list(tenant) });
        return;
      }

      const employmentMatch = request.url?.match(/^\/api\/v1\/employees\/([^/]+)\/employments$/);
      if (request.method === "GET" && employmentMatch) {
        json(response, 200, { data: await employments.listByEmployee(tenant, employmentMatch[1]!) });
        return;
      }

      const employeeMatch = request.url?.match(/^\/api\/v1\/employees\/([^/]+)$/);
      if (request.method === "GET" && employeeMatch) {
        const employee = await employees.getById(tenant, employeeMatch[1]!);
        if (!employee) {
          json(response, 404, { error: "employee_not_found" });
          return;
        }
        json(response, 200, { data: employee });
        return;
      }

      json(response, 404, { error: "not_found" });
    } catch {
      json(response, 500, { error: "internal_error" });
    }
  });
}
