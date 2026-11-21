export type UserRole = 'ADMIN' | 'ASSET_MANAGER' | 'TECHNICIAN' | 'READ_ONLY';

export type AssetStatus = 'IN_STOCK' | 'ASSIGNED' | 'UNDER_MAINTENANCE' | 'PENDING_DISPOSAL' | 'DECOMMISSIONED';

export type AssetCondition = 'NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';

export type DepreciationMethod = 'STRAIGHT_LINE' | 'DOUBLE_DECLINING' | 'SUM_OF_YEARS';

export type AssignmentStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'RETURNED' | 'REJECTED';

export type LicenseType = 'PERPETUAL' | 'SUBSCRIPTION' | 'PER_SEAT' | 'SITE_LICENSE';

export type MaintenanceType = 'PREVENTATIVE' | 'REPAIR' | 'UPGRADE' | 'INSPECTION';

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  employee_count?: number;
  asset_count?: number;
}

export interface Employee {
  id: string;
  employee_id_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  job_title: string;
  department_id: string;
  department_name?: string;
  assigned_assets_count?: number;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
  default_lifespan_months: number;
  default_depreciation_method: string;
  asset_count?: number;
}

export interface Vendor {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

export interface DepreciationInfo {
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
  specifications: Record<string, any>;
  category_id: string;
  category_name?: string;
  department_id?: string;
  department_name?: string;
  vendor_id?: string;
  vendor_name?: string;
  purchase_cost: number;
  salvage_value: number;
  purchase_date: string;
  expected_lifespan_months: number;
  depreciation_method: DepreciationMethod;
  status: AssetStatus;
  condition: AssetCondition;
  location: string;
  qr_code_path?: string;
  notes?: string;
  current_assignee?: string;
  depreciation?: DepreciationInfo;
  created_at: string;
  updated_at: string;
}

export interface AssetDetail extends Asset {
  assignments_history: Array<{
    id: string;
    employee_id: string;
    employee_name: string;
    assigned_date: string;
    returned_date?: string;
    status: AssignmentStatus;
    condition_on_assignment: string;
    condition_on_return?: string;
    notes?: string;
  }>;
  maintenance_history: Array<{
    id: string;
    title: string;
    maintenance_type: MaintenanceType;
    cost: number;
    scheduled_date: string;
    completed_date?: string;
    status: MaintenanceStatus;
    technician?: string;
  }>;
  warranties: Array<{
    id: string;
    provider_name: string;
    policy_number: string;
    warranty_type: string;
    start_date: string;
    end_date: string;
    coverage_details?: string;
  }>;
}

export interface Assignment {
  id: string;
  asset_id: string;
  asset_tag?: string;
  asset_name?: string;
  employee_id: string;
  employee_name?: string;
  employee_email?: string;
  assigned_date: string;
  expected_return_date?: string;
  returned_date?: string;
  status: AssignmentStatus;
  condition_on_assignment: string;
  condition_on_return?: string;
  assignment_notes?: string;
  return_notes?: string;
  approved_by_id?: string;
  approved_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SoftwareProduct {
  id: string;
  name: string;
  publisher: string;
  version?: string;
  category: string;
  total_licenses_count?: number;
  total_seats_count?: number;
}

export interface SoftwareLicense {
  id: string;
  software_id: string;
  software_name?: string;
  license_key: string;
  license_type: LicenseType;
  total_seats: number;
  cost: number;
  purchase_date: string;
  expiration_date?: string;
  vendor_id?: string;
  vendor_name?: string;
  assigned_seats: number;
  available_seats: number;
  utilization_rate: number;
  is_expired: boolean;
  is_expiring_soon: boolean;
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  asset_id: string;
  asset_tag?: string;
  asset_name?: string;
  vendor_id?: string;
  vendor_name?: string;
  technician_id?: string;
  technician_name?: string;
  maintenance_type: MaintenanceType;
  title: string;
  description?: string;
  cost: number;
  scheduled_date: string;
  completed_date?: string;
  status: MaintenanceStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Warranty {
  id: string;
  asset_id: string;
  asset_tag?: string;
  asset_name?: string;
  vendor_id?: string;
  vendor_name?: string;
  provider_name: string;
  policy_number: string;
  warranty_type: string;
  start_date: string;
  end_date: string;
  coverage_details?: string;
  is_active: boolean;
  days_remaining: number;
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
  categories_breakdown: Array<{
    category_id: string;
    category_name: string;
    count: number;
    total_value: number;
  }>;
  status_breakdown: Array<{
    status: string;
    count: number;
  }>;
  spend_trends: Array<{
    month: string;
    hardware_spend: number;
    maintenance_spend: number;
    license_spend: number;
  }>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  is_read: boolean;
  link?: string;
  created_at: string;
}
