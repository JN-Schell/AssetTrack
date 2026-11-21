import {
  User,
  Asset,
  AssetDetail,
  Department,
  Category,
  Vendor,
  Employee,
  Assignment,
  SoftwareProduct,
  SoftwareLicense,
  MaintenanceRecord,
  Warranty,
  DashboardOverview,
  NotificationItem,
} from '../types';

const API_BASE = '/api/v1';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('assettrack_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('assettrack_token', token);
    } else {
      localStorage.removeItem('assettrack_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired or invalid
      this.setToken(null);
    }

    if (!response.ok) {
      let errorMsg = `API Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch (_) {}
      throw new Error(errorMsg);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // --- Auth ---
  async login(username: string, password: string): Promise<{ access_token: string; user_id: string; role: any; full_name: string; email: string }> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Authentication failed');
    }

    const data = await res.json();
    this.setToken(data.access_token);
    return data;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // --- Dashboard ---
  async getDashboardOverview(): Promise<DashboardOverview> {
    return this.request<DashboardOverview>('/dashboard/overview');
  }

  // --- Assets ---
  async getAssets(params?: {
    search?: string;
    category_id?: string;
    department_id?: string;
    status?: string;
    condition?: string;
    approaching_eol?: boolean;
  }): Promise<Asset[]> {
    const query = new URLSearchParams();
    if (params) {
      if (params.search) query.append('search', params.search);
      if (params.category_id) query.append('category_id', params.category_id);
      if (params.department_id) query.append('department_id', params.department_id);
      if (params.status) query.append('status', params.status);
      if (params.condition) query.append('condition', params.condition);
      if (params.approaching_eol !== undefined) query.append('approaching_eol', String(params.approaching_eol));
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<Asset[]>(`/assets${qs}`);
  }

  async getAssetDetail(assetId: string): Promise<AssetDetail> {
    return this.request<AssetDetail>(`/assets/${assetId}`);
  }

  async createAsset(assetData: Partial<Asset>): Promise<Asset> {
    return this.request<Asset>('/assets', {
      method: 'POST',
      body: JSON.stringify(assetData),
    });
  }

  async updateAsset(assetId: string, assetData: Partial<Asset>): Promise<Asset> {
    return this.request<Asset>(`/assets/${assetId}`, {
      method: 'PUT',
      body: JSON.stringify(assetData),
    });
  }

  async deleteAsset(assetId: string): Promise<void> {
    return this.request<void>(`/assets/${assetId}`, {
      method: 'DELETE',
    });
  }

  async getAssetQrCode(assetId: string): Promise<{ qr_data_url: string; asset_tag: string }> {
    return this.request<{ qr_data_url: string; asset_tag: string }>(`/assets/${assetId}/qr`);
  }

  // --- Assignments ---
  async getAssignments(params?: { status?: string; asset_id?: string; employee_id?: string }): Promise<Assignment[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.asset_id) query.append('asset_id', params.asset_id);
    if (params?.employee_id) query.append('employee_id', params.employee_id);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<Assignment[]>(`/assignments${qs}`);
  }

  async createAssignment(data: {
    asset_id: string;
    employee_id: string;
    assigned_date: string;
    expected_return_date?: string;
    condition_on_assignment: string;
    assignment_notes?: string;
  }): Promise<Assignment> {
    return this.request<Assignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async returnAssignment(assignmentId: string, data: {
    returned_date: string;
    condition_on_return: string;
    return_notes?: string;
  }): Promise<Assignment> {
    return this.request<Assignment>(`/assignments/${assignmentId}/return`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveOrRejectAssignment(assignmentId: string, data: {
    status: 'ACTIVE' | 'REJECTED';
    notes?: string;
  }): Promise<Assignment> {
    return this.request<Assignment>(`/assignments/${assignmentId}/approval`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Departments, Categories, Vendors, Employees ---
  async getDepartments(): Promise<Department[]> {
    return this.request<Department[]>('/departments');
  }

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  async getVendors(): Promise<Vendor[]> {
    return this.request<Vendor[]>('/vendors');
  }

  async getEmployees(): Promise<Employee[]> {
    return this.request<Employee[]>('/employees');
  }

  // --- Software ---
  async getSoftwareProducts(): Promise<SoftwareProduct[]> {
    return this.request<SoftwareProduct[]>('/software/products');
  }

  async getSoftwareLicenses(softwareId?: string): Promise<SoftwareLicense[]> {
    const qs = softwareId ? `?software_id=${softwareId}` : '';
    return this.request<SoftwareLicense[]>(`/software/licenses${qs}`);
  }

  async assignSoftwareSeat(licenseId: string, data: { employee_id?: string; asset_id?: string; assigned_date: string }): Promise<any> {
    return this.request(`/software/licenses/${licenseId}/assign`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSoftwareUtilization(): Promise<any[]> {
    return this.request<any[]>('/software/utilization-report');
  }

  // --- Maintenance & Warranties ---
  async getMaintenanceRecords(assetId?: string): Promise<MaintenanceRecord[]> {
    const qs = assetId ? `?asset_id=${assetId}` : '';
    return this.request<MaintenanceRecord[]>(`/maintenance${qs}`);
  }

  async createMaintenanceRecord(data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    return this.request<MaintenanceRecord>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMaintenanceRecord(id: string, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    return this.request<MaintenanceRecord>(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getWarranties(assetId?: string): Promise<Warranty[]> {
    const qs = assetId ? `?asset_id=${assetId}` : '';
    return this.request<Warranty[]>(`/warranties${qs}`);
  }

  // --- Notifications ---
  async getNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>('/notifications');
  }

  async markNotificationRead(id: string): Promise<void> {
    return this.request<void>(`/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  // --- Import / Export ---
  async importCsv(file: File): Promise<{ success: boolean; imported_count: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<{ success: boolean; imported_count: number; errors: string[] }>('/assets/import/csv', {
      method: 'POST',
      body: formData,
    });
  }

  getExportCsvUrl(): string {
    return `${API_BASE}/assets/export/csv`;
  }

  getFleetReportPdfUrl(): string {
    return `${API_BASE}/assets/export/fleet-report.pdf`;
  }

  getAssetSpecSheetPdfUrl(assetId: string): string {
    return `${API_BASE}/assets/${assetId}/spec-sheet.pdf`;
  }
}

export const api = new ApiService();
