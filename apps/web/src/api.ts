export interface Employee {
  id: string;
  tenant_id: string;
  organization_id: string;
  user_id: string | null;
  display_name: string;
  department_id: string | null;
  position_id: string | null;
  manager_employee_id: string | null;
  active: boolean;
}

export interface Employment {
  id: string;
  tenant_id: string;
  employee_id: string;
  organization_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
}

export interface HayelApiClient {
  listEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | null>;
  listEmployments(employeeId: string): Promise<Employment[]>;
}

export function createApiClient(baseUrl: string, tenantId: string): HayelApiClient {
  const request = async <T>(path: string): Promise<T> => {
    const response = await fetch(`${baseUrl}${path}`, { headers: { "X-Tenant-ID": tenantId } });
    if (!response.ok) throw new Error(`Hayel API request failed: ${response.status}`);
    return response.json() as Promise<T>;
  };

  return {
    async listEmployees() {
      const body = await request<{ data: Employee[] }>("/api/v1/employees");
      return body.data;
    },
    async getEmployee(id: string) {
      try {
        const body = await request<{ data: Employee }>(`/api/v1/employees/${encodeURIComponent(id)}`);
        return body.data;
      } catch (error) {
        if (error instanceof Error && error.message.endsWith(": 404")) return null;
        throw error;
      }
    },
    async listEmployments(employeeId: string) {
      const body = await request<{ data: Employment[] }>(`/api/v1/employees/${encodeURIComponent(employeeId)}/employments`);
      return body.data;
    },
  };
}
