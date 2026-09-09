// AUTOMOTIVE OS Shared Types & Data Contracts

export enum SystemRole {
  OWNER = 'OWNER',
  NETWORK_ADMIN = 'NETWORK_ADMIN',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  SERVICE_ADVISOR = 'SERVICE_ADVISOR',
  MASTER = 'MASTER',
  MECHANIC = 'MECHANIC',
  DOCUMENT_MANAGER = 'DOCUMENT_MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
  VIEWER = 'VIEWER',
}

export enum LocationScope {
  CURRENT_LOCATION = 'current_location',
  ALL_LOCATIONS = 'all_locations',
}

export enum InspectionStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum InspectionItemStatus {
  OK = 'ok',
  WARNING = 'warning',
  DAMAGE = 'damage',
  NOT_CHECKED = 'not_checked',
}

export enum MediaType {
  PHOTO = 'photo',
  VIDEO = 'video',
  DOCUMENT_PREVIEW = 'document_preview',
}

export enum MediaStatus {
  PENDING = 'pending',
  READY = 'ready',
  PROCESSING = 'processing',
  FAILED = 'failed',
}

export enum WorkOrderStatus {
  DRAFT = 'draft',
  ACCEPTED = 'accepted',
  DIAGNOSTICS = 'diagnostics',
  WAITING_APPROVAL = 'waiting_approval',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  WAITING_PARTS = 'waiting_parts',
  COMPLETED = 'completed',
  READY = 'ready',
  PAID = 'paid',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum WorkOrderItemType {
  LABOR = 'labor',
  PART = 'part',
  OTHER = 'other',
}

export enum DocumentType {
  CONTRACT = 'contract',
  WORK_ORDER = 'work_order',
  ACCEPTANCE_ACT = 'acceptance_act',
  COMPLETION_ACT = 'completion_act',
  INVOICE = 'invoice',
  WARRANTY = 'warranty',
  OTHER = 'other',
}

export enum TaskPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TaskStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ReminderType {
  DATE = 'date',
  MILEAGE = 'mileage',
  DATE_OR_MILEAGE = 'date_or_mileage',
}

export enum ReminderStatus {
  ACTIVE = 'active',
  DUE = 'due',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum BackupType {
  CLOUD = 'cloud',
  LOCAL = 'local',
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
}

export enum BackupStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum SyncStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SYNCED = 'synced',
  FAILED = 'failed',
  CONFLICT = 'conflict',
}

export interface DamageMarker {
  id?: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  severity: 'minor' | 'moderate' | 'severe';
  comment: string;
}

export interface Organization {
  id: string;
  name: string;
  legal_name?: string | null;
  tax_id?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  logo_url?: string | null;
  timezone: string;
  currency: string;
  status: 'active' | 'suspended' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  organization_id: string;
  name: string;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  timezone: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  location_id?: string | null;
  role_id: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  email: string;
  avatar_url?: string | null;
  status: 'active' | 'suspended' | 'inactive';
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
  role?: Role;
  location?: Location | null;
  organization?: Organization;
}

export interface Role {
  id: string;
  organization_id?: string | null;
  name: string;
  description?: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  code: string;
  description?: string | null;
}

export interface Customer {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  vehicles?: Vehicle[];
}

export interface Vehicle {
  id: string;
  organization_id: string;
  customer_id: string;
  vin: string;
  license_plate: string;
  make: string;
  model: string;
  generation?: string | null;
  year: number;
  color?: string | null;
  body_type?: string | null;
  engine?: string | null;
  engine_volume?: string | null;
  transmission?: string | null;
  drive_type?: string | null;
  fuel_type?: string | null;
  mileage: number;
  mileage_unit: string;
  notes?: string | null;
  status: 'active' | 'in_service' | 'inactive';
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  customer?: Customer;
}

export interface VehicleHistoryItem {
  id: string;
  type: 'inspection' | 'work_order' | 'document' | 'media' | 'reminder' | 'task';
  title: string;
  description?: string;
  status?: string;
  created_at: string;
  user_name?: string;
  metadata?: Record<string, any>;
  data?: any;
}

export interface Inspection {
  id: string;
  organization_id: string;
  location_id: string;
  vehicle_id: string;
  customer_id: string;
  created_by: string;
  mileage: number;
  fuel_level: number; // 0-100 percent
  status: InspectionStatus;
  customer_comment?: string | null;
  internal_comment?: string | null;
  started_at: string;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  items?: InspectionItem[];
  media?: Media[];
  vehicle?: Vehicle;
  customer?: Customer;
  creator?: User;
  location?: Location;
}

export interface InspectionItem {
  id: string;
  inspection_id: string;
  category: string; // 'body', 'interior', 'undercarriage', 'engine_bay', etc.
  name: string;
  status: InspectionItemStatus;
  comment?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: string;
  organization_id: string;
  location_id: string;
  vehicle_id: string;
  customer_id?: string | null;
  inspection_id?: string | null;
  work_order_id?: string | null;
  uploaded_by: string;
  type: MediaType;
  storage_key: string;
  mime_type: string;
  file_name: string;
  file_size: number;
  duration?: number | null;
  checksum: string;
  status: MediaStatus;
  retention_until?: string | null;
  legal_hold?: boolean;
  metadata?: {
    damage_markers?: DamageMarker[];
    width?: number;
    height?: number;
  } | null;
  created_at: string;
  archived_at?: string | null;
  deleted_at?: string | null;
  download_url?: string;
}

export interface WorkOrder {
  id: string;
  organization_id: string;
  location_id: string;
  vehicle_id: string;
  customer_id: string;
  inspection_id?: string | null;
  advisor_id: string;
  master_id?: string | null;
  number: string;
  status: WorkOrderStatus;
  customer_complaint?: string | null;
  diagnosis?: string | null;
  mileage_in: number;
  mileage_out?: number | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  opened_at: string;
  completed_at?: string | null;
  closed_at?: string | null;
  created_at: string;
  updated_at: string;
  items?: WorkOrderItem[];
  vehicle?: Vehicle;
  customer?: Customer;
  advisor?: User;
  master?: User | null;
  location?: Location;
  documents?: Document[];
  media?: Media[];
  tasks?: Task[];
}

export interface WorkOrderItem {
  id: string;
  work_order_id: string;
  type: WorkOrderItemType;
  description: string;
  quantity: number;
  unit_price: number;
  cost_price?: number;
  total_price: number;
  assigned_to?: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  assignee?: User | null;
}

export interface Document {
  id: string;
  organization_id: string;
  location_id: string;
  customer_id: string;
  vehicle_id: string;
  work_order_id?: string | null;
  uploaded_by: string;
  type: DocumentType;
  name: string;
  storage_key: string;
  mime_type: string;
  file_size: number;
  checksum: string;
  is_signed: boolean;
  signed_at?: string | null;
  content_html?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  download_url?: string;
  vehicle?: Vehicle;
  customer?: Customer;
}

export interface DocumentTemplate {
  id: string;
  organization_id: string;
  location_id?: string | null;
  name: string;
  type: DocumentType;
  template_content: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  organization_id: string;
  location_id: string;
  vehicle_id?: string | null;
  customer_id?: string | null;
  work_order_id?: string | null;
  assigned_to: string;
  created_by: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  assignee?: User;
  creator?: User;
  vehicle?: Vehicle | null;
  customer?: Customer | null;
}

export interface Reminder {
  id: string;
  organization_id: string;
  location_id: string;
  vehicle_id: string;
  customer_id: string;
  created_by: string;
  type: ReminderType;
  title: string;
  description?: string | null;
  target_date?: string | null;
  target_mileage?: number | null;
  status: ReminderStatus;
  created_at: string;
  updated_at: string;
  vehicle?: Vehicle;
  customer?: Customer;
}

export interface Notification {
  id: string;
  organization_id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  entity_type?: string | null;
  entity_id?: string | null;
  is_read: boolean;
  created_at: string;
  read_at?: string | null;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  location_id?: string | null;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: string | null;
  new_values?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  user?: User;
}

export interface Backup {
  id: string;
  organization_id: string;
  created_by: string;
  type: BackupType;
  status: BackupStatus;
  storage_key?: string | null;
  size: number;
  checksum?: string | null;
  started_at: string;
  completed_at?: string | null;
  created_at: string;
  creator?: User;
}

export interface Device {
  id: string;
  user_id: string;
  organization_id: string;
  platform: 'android' | 'ios' | 'web';
  device_name: string;
  app_version: string;
  last_sync_at: string;
  created_at: string;
  updated_at: string;
}

export interface SyncEvent {
  id: string;
  device_id: string;
  user_id: string;
  organization_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  payload: string;
  status: SyncStatus;
  created_at: string;
  processed_at?: string | null;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface GlobalSearchResult {
  vehicles: Vehicle[];
  customers: Customer[];
  workOrders: WorkOrder[];
  documents: Document[];
}

export interface DashboardReport {
  vehiclesToday: number;
  inspectionsToday: number;
  workOrdersActive: number;
  workOrdersCompleted: number;
  averageCheck: number;
  overdueTasks: number;
  attentionItems: {
    id: string;
    type: 'approval' | 'overdue_task' | 'call_customer' | 'urgent_part';
    title: string;
    subtitle: string;
    link: string;
    severity: 'warning' | 'danger' | 'info';
  }[];
}
