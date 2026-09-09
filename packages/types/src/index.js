"use strict";
// AUTOMOTIVE OS Shared Types & Data Contracts
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncStatus = exports.BackupStatus = exports.BackupType = exports.ReminderStatus = exports.ReminderType = exports.TaskStatus = exports.TaskPriority = exports.DocumentType = exports.WorkOrderItemType = exports.WorkOrderStatus = exports.MediaStatus = exports.MediaType = exports.InspectionItemStatus = exports.InspectionStatus = exports.LocationScope = exports.SystemRole = void 0;
var SystemRole;
(function (SystemRole) {
    SystemRole["OWNER"] = "OWNER";
    SystemRole["NETWORK_ADMIN"] = "NETWORK_ADMIN";
    SystemRole["BRANCH_MANAGER"] = "BRANCH_MANAGER";
    SystemRole["SERVICE_ADVISOR"] = "SERVICE_ADVISOR";
    SystemRole["MASTER"] = "MASTER";
    SystemRole["MECHANIC"] = "MECHANIC";
    SystemRole["DOCUMENT_MANAGER"] = "DOCUMENT_MANAGER";
    SystemRole["ACCOUNTANT"] = "ACCOUNTANT";
    SystemRole["VIEWER"] = "VIEWER";
})(SystemRole || (exports.SystemRole = SystemRole = {}));
var LocationScope;
(function (LocationScope) {
    LocationScope["CURRENT_LOCATION"] = "current_location";
    LocationScope["ALL_LOCATIONS"] = "all_locations";
})(LocationScope || (exports.LocationScope = LocationScope = {}));
var InspectionStatus;
(function (InspectionStatus) {
    InspectionStatus["DRAFT"] = "draft";
    InspectionStatus["IN_PROGRESS"] = "in_progress";
    InspectionStatus["COMPLETED"] = "completed";
    InspectionStatus["CANCELLED"] = "cancelled";
})(InspectionStatus || (exports.InspectionStatus = InspectionStatus = {}));
var InspectionItemStatus;
(function (InspectionItemStatus) {
    InspectionItemStatus["OK"] = "ok";
    InspectionItemStatus["WARNING"] = "warning";
    InspectionItemStatus["DAMAGE"] = "damage";
    InspectionItemStatus["NOT_CHECKED"] = "not_checked";
})(InspectionItemStatus || (exports.InspectionItemStatus = InspectionItemStatus = {}));
var MediaType;
(function (MediaType) {
    MediaType["PHOTO"] = "photo";
    MediaType["VIDEO"] = "video";
    MediaType["DOCUMENT_PREVIEW"] = "document_preview";
})(MediaType || (exports.MediaType = MediaType = {}));
var MediaStatus;
(function (MediaStatus) {
    MediaStatus["PENDING"] = "pending";
    MediaStatus["READY"] = "ready";
    MediaStatus["PROCESSING"] = "processing";
    MediaStatus["FAILED"] = "failed";
})(MediaStatus || (exports.MediaStatus = MediaStatus = {}));
var WorkOrderStatus;
(function (WorkOrderStatus) {
    WorkOrderStatus["DRAFT"] = "draft";
    WorkOrderStatus["ACCEPTED"] = "accepted";
    WorkOrderStatus["DIAGNOSTICS"] = "diagnostics";
    WorkOrderStatus["WAITING_APPROVAL"] = "waiting_approval";
    WorkOrderStatus["APPROVED"] = "approved";
    WorkOrderStatus["IN_PROGRESS"] = "in_progress";
    WorkOrderStatus["WAITING_PARTS"] = "waiting_parts";
    WorkOrderStatus["COMPLETED"] = "completed";
    WorkOrderStatus["READY"] = "ready";
    WorkOrderStatus["PAID"] = "paid";
    WorkOrderStatus["CLOSED"] = "closed";
    WorkOrderStatus["CANCELLED"] = "cancelled";
})(WorkOrderStatus || (exports.WorkOrderStatus = WorkOrderStatus = {}));
var WorkOrderItemType;
(function (WorkOrderItemType) {
    WorkOrderItemType["LABOR"] = "labor";
    WorkOrderItemType["PART"] = "part";
    WorkOrderItemType["OTHER"] = "other";
})(WorkOrderItemType || (exports.WorkOrderItemType = WorkOrderItemType = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["CONTRACT"] = "contract";
    DocumentType["WORK_ORDER"] = "work_order";
    DocumentType["ACCEPTANCE_ACT"] = "acceptance_act";
    DocumentType["COMPLETION_ACT"] = "completion_act";
    DocumentType["INVOICE"] = "invoice";
    DocumentType["WARRANTY"] = "warranty";
    DocumentType["OTHER"] = "other";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["NORMAL"] = "normal";
    TaskPriority["HIGH"] = "high";
    TaskPriority["CRITICAL"] = "critical";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["NEW"] = "new";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["CANCELLED"] = "cancelled";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var ReminderType;
(function (ReminderType) {
    ReminderType["DATE"] = "date";
    ReminderType["MILEAGE"] = "mileage";
    ReminderType["DATE_OR_MILEAGE"] = "date_or_mileage";
})(ReminderType || (exports.ReminderType = ReminderType = {}));
var ReminderStatus;
(function (ReminderStatus) {
    ReminderStatus["ACTIVE"] = "active";
    ReminderStatus["DUE"] = "due";
    ReminderStatus["COMPLETED"] = "completed";
    ReminderStatus["CANCELLED"] = "cancelled";
})(ReminderStatus || (exports.ReminderStatus = ReminderStatus = {}));
var BackupType;
(function (BackupType) {
    BackupType["CLOUD"] = "cloud";
    BackupType["LOCAL"] = "local";
    BackupType["MANUAL"] = "manual";
    BackupType["SCHEDULED"] = "scheduled";
})(BackupType || (exports.BackupType = BackupType = {}));
var BackupStatus;
(function (BackupStatus) {
    BackupStatus["PENDING"] = "pending";
    BackupStatus["PROCESSING"] = "processing";
    BackupStatus["COMPLETED"] = "completed";
    BackupStatus["FAILED"] = "failed";
})(BackupStatus || (exports.BackupStatus = BackupStatus = {}));
var SyncStatus;
(function (SyncStatus) {
    SyncStatus["PENDING"] = "pending";
    SyncStatus["PROCESSING"] = "processing";
    SyncStatus["SYNCED"] = "synced";
    SyncStatus["FAILED"] = "failed";
    SyncStatus["CONFLICT"] = "conflict";
})(SyncStatus || (exports.SyncStatus = SyncStatus = {}));
//# sourceMappingURL=index.js.map