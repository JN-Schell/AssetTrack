/** Shapes taken from backend Pydantic models and route builders. */

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryMetric {
  category_id: string;
  category_name: string;
  count: number;
  total_value: number;
}

export interface StatusMetric {
  status: string;
  count: number;
}

export interface MonthlySpendMetric {
  month: string;
  hardware_spend: number;
  maintenance_spend: number;
  license_spend: number;
}

export interface DashboardOverview {
  total_assets: number;
  assigned_assets: number;
  in_stock_assets: number;
  maintenance_assets: number;
  decommissioned_assets: number;
  total_asset_valuation: number;
  total_current_book_value: number;
  total_accumulated_depreciation: number;
  approaching_eol_count: number;
  past_eol_count: number;
  pending_approval_count: number;
  active_maintenance_count: number;
  expiring_warranties_count: number;
  unassigned_license_seats: number;
  categories_breakdown: CategoryMetric[];
  status_breakdown: StatusMetric[];
  spend_trends: MonthlySpendMetric[];
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  changes_json: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
}

export interface AssetDepreciation {
  current_book_value: number;
  accumulated_depreciation: number;
  age_months: number;
  remaining_months: number;
  percent_depreciated: number;
  is_approaching_eol: boolean;
  is_past_eol: boolean;
}

export interface Asset {
  id: string;
  asset_tag: string;
  serial_number: string;
  name: string;
  manufacturer: string;
  model: string;
  specifications: Record<string, unknown>;
  category_id: string;
  department_id: string | null;
  vendor_id: string | null;
  purchase_cost: number;
  salvage_value: number;
  purchase_date: string;
  expected_lifespan_months: number;
  depreciation_method: string;
  status: string;
  condition: string;
  location: string;
  notes: string | null;
  qr_code_path: string | null;
  category_name: string | null;
  department_name: string | null;
  vendor_name: string | null;
  current_assignee: string | null;
  depreciation: AssetDepreciation | null;
  created_at: string;
  updated_at: string;
}

export interface AssignmentHistoryItem {
  id: string;
  employee_id: string;
  employee_name: string;
  assigned_date: string;
  returned_date: string | null;
  status: string;
  condition_on_assignment: string;
  condition_on_return: string | null;
  notes: string | null;
}

export interface MaintenanceHistoryItem {
  id: string;
  title: string;
  maintenance_type: string;
  cost: number;
  scheduled_date: string;
  completed_date: string | null;
  status: string;
  technician: string | null;
}

export interface WarrantyItem {
  id: string;
  provider_name: string;
  policy_number: string;
  warranty_type: string;
  start_date: string;
  end_date: string;
  coverage_details: string | null;
}

export interface AssetDetail extends Asset {
  assignments_history: AssignmentHistoryItem[];
  maintenance_history: MaintenanceHistoryItem[];
  warranties: WarrantyItem[];
}

export interface QrPayload {
  qr_data_url: string;
  asset_tag: string;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description: string | null;
  default_lifespan_months: number;
  default_depreciation_method: string;
  created_at: string;
  updated_at: string;
  asset_count?: number | null;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  employee_count?: number | null;
  asset_count?: number | null;
}

export interface Employee {
  id: string;
  employee_id_number: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  department_id: string;
  is_active: boolean;
  full_name: string;
  department_name: string | null;
  assigned_assets_count?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  asset_id: string;
  asset_tag: string | null;
  asset_name: string | null;
  employee_id: string;
  employee_name: string | null;
  employee_email: string | null;
  assigned_date: string;
  expected_return_date: string | null;
  returned_date: string | null;
  status: string;
  condition_on_assignment: string;
  condition_on_return: string | null;
  assignment_notes: string | null;
  return_notes: string | null;
  approved_by_id: string | null;
  approved_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface SoftwareLicense {
  id: string;
  software_id: string;
  license_key: string;
  license_type: string;
  total_seats: number;
  cost: number;
  purchase_date: string;
  expiration_date: string | null;
  vendor_id: string | null;
  notes: string | null;
  software_name: string | null;
  vendor_name: string | null;
  assigned_seats: number;
  available_seats: number;
  utilization_rate: number;
  is_expired: boolean;
  is_expiring_soon: boolean;
  created_at: string;
  updated_at: string;
}

export interface LicenseUtilization {
  software_id: string;
  software_name: string;
  publisher: string;
  total_seats: number;
  assigned_seats: number;
  unassigned_seats: number;
  utilization_percentage: number;
  total_spend: number;
  status: string;
}

export interface MaintenanceRecord {
  id: string;
  asset_id: string;
  vendor_id: string | null;
  technician_id: string | null;
  maintenance_type: string;
  title: string;
  description: string | null;
  cost: number;
  scheduled_date: string;
  completed_date: string | null;
  status: string;
  notes: string | null;
  asset_tag: string | null;
  asset_name: string | null;
  vendor_name: string | null;
  technician_name: string | null;
  created_at: string;
  updated_at: string;
}
