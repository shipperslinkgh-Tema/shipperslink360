-- ============================================================
-- SLAC FreightLink 360 — MySQL 8.0 Schema
-- Generated from current PostgreSQL/Supabase schema
-- For use with Laravel 11 backend migration
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ============================================================
-- ENUMS (simulated as VARCHAR with CHECK constraints in MySQL 8)
-- app_role: super_admin | admin | manager | staff
-- department: operations | documentation | accounts | marketing |
--             customer_service | warehouse | management | super_admin
-- ============================================================

-- ============================================================
-- TABLE: users (Laravel default auth table)
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id`                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name`                    VARCHAR(255) NOT NULL,
  `email`                   VARCHAR(255) NOT NULL UNIQUE,
  `email_verified_at`       TIMESTAMP NULL DEFAULT NULL,
  `password`                VARCHAR(255) NOT NULL,
  `remember_token`          VARCHAR(100) NULL DEFAULT NULL,
  `created_at`              TIMESTAMP NULL DEFAULT NULL,
  `updated_at`              TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: personal_access_tokens (Laravel Sanctum)
-- ============================================================
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `tokenable_type` VARCHAR(255) NOT NULL,
  `tokenable_id`   BIGINT UNSIGNED NOT NULL,
  `name`           VARCHAR(255) NOT NULL,
  `token`          VARCHAR(64) NOT NULL UNIQUE,
  `abilities`      TEXT NULL,
  `last_used_at`   TIMESTAMP NULL DEFAULT NULL,
  `expires_at`     TIMESTAMP NULL DEFAULT NULL,
  `created_at`     TIMESTAMP NULL DEFAULT NULL,
  `updated_at`     TIMESTAMP NULL DEFAULT NULL,
  INDEX `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`, `tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: profiles (staff user profiles)
-- ============================================================
CREATE TABLE IF NOT EXISTS `profiles` (
  `id`                      CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `user_id`                 BIGINT UNSIGNED NOT NULL,
  `full_name`               VARCHAR(255) NOT NULL,
  `staff_id`                VARCHAR(50) NOT NULL UNIQUE,
  `username`                VARCHAR(100) NOT NULL UNIQUE,
  `email`                   VARCHAR(255) NOT NULL,
  `phone`                   VARCHAR(30) NULL DEFAULT NULL,
  `department`              ENUM(
                              'operations','documentation','accounts','marketing',
                              'customer_service','warehouse','management','super_admin'
                            ) NOT NULL,
  `avatar_url`              TEXT NULL DEFAULT NULL,
  `is_active`               TINYINT(1) NOT NULL DEFAULT 1,
  `is_locked`               TINYINT(1) NOT NULL DEFAULT 0,
  `failed_login_attempts`   INT NOT NULL DEFAULT 0,
  `locked_at`               TIMESTAMP NULL DEFAULT NULL,
  `last_login_at`           TIMESTAMP NULL DEFAULT NULL,
  `must_change_password`    TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `profiles_department_index` (`department`),
  INDEX `profiles_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: user_roles (RBAC)
-- ============================================================
CREATE TABLE IF NOT EXISTS `user_roles` (
  `id`       CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `user_id`  BIGINT UNSIGNED NOT NULL,
  `role`     ENUM('super_admin','admin','manager','staff') NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `user_roles_user_id_role_unique` (`user_id`, `role`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `user_roles_role_index` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: login_history
-- ============================================================
CREATE TABLE IF NOT EXISTS `login_history` (
  `id`          CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `user_id`     BIGINT UNSIGNED NOT NULL,
  `ip_address`  VARCHAR(45) NULL DEFAULT NULL,
  `user_agent`  TEXT NULL DEFAULT NULL,
  `success`     TINYINT(1) NOT NULL DEFAULT 1,
  `login_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `login_history_user_id_index` (`user_id`),
  INDEX `login_history_login_at_index` (`login_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id`            CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `user_id`       BIGINT UNSIGNED NULL DEFAULT NULL,
  `action`        VARCHAR(100) NOT NULL,
  `resource_type` VARCHAR(100) NULL DEFAULT NULL,
  `resource_id`   VARCHAR(255) NULL DEFAULT NULL,
  `details`       JSON NULL DEFAULT NULL,
  `ip_address`    VARCHAR(45) NULL DEFAULT NULL,
  `created_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `audit_logs_user_id_index` (`user_id`),
  INDEX `audit_logs_action_index` (`action`),
  INDEX `audit_logs_resource_type_index` (`resource_type`),
  INDEX `audit_logs_created_at_index` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: client_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS `client_profiles` (
  `id`            CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `user_id`       BIGINT UNSIGNED NOT NULL UNIQUE,
  `customer_id`   VARCHAR(100) NOT NULL,
  `company_name`  VARCHAR(255) NOT NULL,
  `contact_name`  VARCHAR(255) NOT NULL,
  `email`         VARCHAR(255) NOT NULL,
  `phone`         VARCHAR(30) NULL DEFAULT NULL,
  `is_active`     TINYINT(1) NOT NULL DEFAULT 1,
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `client_profiles_customer_id_index` (`customer_id`),
  INDEX `client_profiles_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: client_shipments
-- ============================================================
CREATE TABLE IF NOT EXISTS `client_shipments` (
  `id`                CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `customer_id`       VARCHAR(100) NOT NULL,
  `bl_number`         VARCHAR(100) NOT NULL,
  `container_number`  VARCHAR(100) NULL DEFAULT NULL,
  `vessel_name`       VARCHAR(255) NULL DEFAULT NULL,
  `voyage_number`     VARCHAR(100) NULL DEFAULT NULL,
  `origin`            VARCHAR(255) NOT NULL,
  `destination`       VARCHAR(255) NOT NULL,
  `cargo_description` TEXT NULL DEFAULT NULL,
  `weight_kg`         DECIMAL(12,2) NULL DEFAULT NULL,
  `status`            VARCHAR(50) NOT NULL DEFAULT 'pending',
  `eta`               TIMESTAMP NULL DEFAULT NULL,
  `ata`               TIMESTAMP NULL DEFAULT NULL,
  `notes`             TEXT NULL DEFAULT NULL,
  `created_by`        BIGINT UNSIGNED NULL DEFAULT NULL,
  `created_at`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `client_shipments_customer_id_index` (`customer_id`),
  INDEX `client_shipments_status_index` (`status`),
  INDEX `client_shipments_bl_number_index` (`bl_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: client_invoices
-- ============================================================
CREATE TABLE IF NOT EXISTS `client_invoices` (
  `id`             CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `customer_id`    VARCHAR(100) NOT NULL,
  `shipment_id`    CHAR(36) NULL DEFAULT NULL,
  `invoice_number` VARCHAR(100) NOT NULL UNIQUE,
  `amount`         DECIMAL(15,2) NOT NULL,
  `currency`       VARCHAR(10) NOT NULL DEFAULT 'GHS',
  `status`         VARCHAR(50) NOT NULL DEFAULT 'pending',
  `description`    TEXT NULL DEFAULT NULL,
  `due_date`       DATE NOT NULL,
  `paid_date`      DATE NULL DEFAULT NULL,
  `paid_amount`    DECIMAL(15,2) NULL DEFAULT 0,
  `created_by`     BIGINT UNSIGNED NULL DEFAULT NULL,
  `created_at`     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`shipment_id`) REFERENCES `client_shipments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `client_invoices_customer_id_index` (`customer_id`),
  INDEX `client_invoices_status_index` (`status`),
  INDEX `client_invoices_due_date_index` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: client_documents
-- ============================================================
CREATE TABLE IF NOT EXISTS `client_documents` (
  `id`            CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `customer_id`   VARCHAR(100) NOT NULL,
  `shipment_id`   CHAR(36) NULL DEFAULT NULL,
  `document_name` VARCHAR(255) NOT NULL,
  `document_type` VARCHAR(100) NOT NULL,
  `file_url`      TEXT NULL DEFAULT NULL,
  `file_size`     VARCHAR(50) NULL DEFAULT NULL,
  `status`        VARCHAR(50) NOT NULL DEFAULT 'active',
  `notes`         TEXT NULL DEFAULT NULL,
  `uploaded_by`   BIGINT UNSIGNED NULL DEFAULT NULL,
  `created_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`shipment_id`) REFERENCES `client_shipments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `client_documents_customer_id_index` (`customer_id`),
  INDEX `client_documents_document_type_index` (`document_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: client_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS `client_messages` (
  `id`          CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `customer_id` VARCHAR(100) NOT NULL,
  `sender_id`   BIGINT UNSIGNED NOT NULL,
  `sender_type` ENUM('client','staff') NOT NULL,
  `subject`     VARCHAR(255) NULL DEFAULT NULL,
  `message`     TEXT NOT NULL,
  `is_read`     TINYINT(1) NOT NULL DEFAULT 0,
  `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `client_messages_customer_id_index` (`customer_id`),
  INDEX `client_messages_sender_type_index` (`sender_type`),
  INDEX `client_messages_is_read_index` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`                   CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `recipient_id`         BIGINT UNSIGNED NULL DEFAULT NULL,
  `recipient_department` VARCHAR(50) NULL DEFAULT NULL,
  `sender_id`            BIGINT UNSIGNED NULL DEFAULT NULL,
  `title`                VARCHAR(255) NOT NULL,
  `message`              TEXT NOT NULL,
  `type`                 VARCHAR(50) NOT NULL DEFAULT 'info',
  `category`             VARCHAR(50) NOT NULL DEFAULT 'system',
  `priority`             ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `is_read`              TINYINT(1) NOT NULL DEFAULT 0,
  `is_resolved`          TINYINT(1) NOT NULL DEFAULT 0,
  `reference_type`       VARCHAR(100) NULL DEFAULT NULL,
  `reference_id`         VARCHAR(255) NULL DEFAULT NULL,
  `action_url`           VARCHAR(500) NULL DEFAULT NULL,
  `metadata`             JSON NULL DEFAULT NULL,
  `read_at`              TIMESTAMP NULL DEFAULT NULL,
  `resolved_at`          TIMESTAMP NULL DEFAULT NULL,
  `created_at`           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `notifications_recipient_id_index` (`recipient_id`),
  INDEX `notifications_recipient_department_index` (`recipient_department`),
  INDEX `notifications_is_read_index` (`is_read`),
  INDEX `notifications_priority_index` (`priority`),
  INDEX `notifications_created_at_index` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: bank_connections
-- ============================================================
CREATE TABLE IF NOT EXISTS `bank_connections` (
  `id`               CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `bank_name`        VARCHAR(100) NOT NULL,
  `bank_display_name` VARCHAR(255) NOT NULL,
  `account_name`     VARCHAR(255) NOT NULL,
  `account_number`   VARCHAR(50) NOT NULL,
  `account_type`     ENUM('current','savings','fixed') NOT NULL DEFAULT 'current',
  `currency`         VARCHAR(10) NOT NULL DEFAULT 'GHS',
  `balance`          DECIMAL(18,2) NULL DEFAULT 0,
  `available_balance` DECIMAL(18,2) NULL DEFAULT 0,
  `api_endpoint`     VARCHAR(500) NULL DEFAULT NULL,
  `is_active`        TINYINT(1) NOT NULL DEFAULT 1,
  `sync_status`      ENUM('pending','syncing','synced','error') NOT NULL DEFAULT 'pending',
  `error_message`    TEXT NULL DEFAULT NULL,
  `last_sync_at`     TIMESTAMP NULL DEFAULT NULL,
  `created_at`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `bank_connections_bank_name_index` (`bank_name`),
  INDEX `bank_connections_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: bank_transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS `bank_transactions` (
  `id`                   CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `bank_connection_id`   CHAR(36) NOT NULL,
  `transaction_ref`      VARCHAR(100) NOT NULL UNIQUE,
  `transaction_type`     ENUM('credit','debit') NOT NULL,
  `amount`               DECIMAL(18,2) NOT NULL,
  `currency`             VARCHAR(10) NOT NULL DEFAULT 'GHS',
  `description`          TEXT NULL DEFAULT NULL,
  `counterparty_name`    VARCHAR(255) NULL DEFAULT NULL,
  `counterparty_account` VARCHAR(50) NULL DEFAULT NULL,
  `transaction_date`     TIMESTAMP NOT NULL,
  `value_date`           TIMESTAMP NULL DEFAULT NULL,
  `balance_after`        DECIMAL(18,2) NULL DEFAULT NULL,
  `match_status`         ENUM('unmatched','matched','partial','manual') NOT NULL DEFAULT 'unmatched',
  `match_confidence`     DECIMAL(5,2) NULL DEFAULT NULL,
  `matched_invoice_id`   VARCHAR(255) NULL DEFAULT NULL,
  `matched_receivable_id` VARCHAR(255) NULL DEFAULT NULL,
  `is_reconciled`        TINYINT(1) NOT NULL DEFAULT 0,
  `reconciled_by`        BIGINT UNSIGNED NULL DEFAULT NULL,
  `reconciled_at`        TIMESTAMP NULL DEFAULT NULL,
  `notes`                TEXT NULL DEFAULT NULL,
  `raw_data`             JSON NULL DEFAULT NULL,
  `created_at`           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`bank_connection_id`) REFERENCES `bank_connections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reconciled_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `bank_transactions_bank_connection_id_index` (`bank_connection_id`),
  INDEX `bank_transactions_transaction_date_index` (`transaction_date`),
  INDEX `bank_transactions_match_status_index` (`match_status`),
  INDEX `bank_transactions_is_reconciled_index` (`is_reconciled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: bank_reconciliations
-- ============================================================
CREATE TABLE IF NOT EXISTS `bank_reconciliations` (
  `id`                   CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `bank_connection_id`   CHAR(36) NOT NULL,
  `period_start`         DATE NOT NULL,
  `period_end`           DATE NOT NULL,
  `bank_opening_balance` DECIMAL(18,2) NOT NULL DEFAULT 0,
  `bank_closing_balance` DECIMAL(18,2) NOT NULL DEFAULT 0,
  `book_opening_balance` DECIMAL(18,2) NOT NULL DEFAULT 0,
  `book_closing_balance` DECIMAL(18,2) NOT NULL DEFAULT 0,
  `total_credits`        DECIMAL(18,2) NOT NULL DEFAULT 0,
  `total_debits`         DECIMAL(18,2) NOT NULL DEFAULT 0,
  `matched_count`        INT NOT NULL DEFAULT 0,
  `unmatched_count`      INT NOT NULL DEFAULT 0,
  `discrepancy_amount`   DECIMAL(18,2) NOT NULL DEFAULT 0,
  `status`               ENUM('draft','in_progress','completed','approved') NOT NULL DEFAULT 'draft',
  `notes`                TEXT NULL DEFAULT NULL,
  `completed_by`         BIGINT UNSIGNED NULL DEFAULT NULL,
  `completed_at`         TIMESTAMP NULL DEFAULT NULL,
  `approved_by`          BIGINT UNSIGNED NULL DEFAULT NULL,
  `approved_at`          TIMESTAMP NULL DEFAULT NULL,
  `created_at`           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`bank_connection_id`) REFERENCES `bank_connections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`completed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `bank_reconciliations_period_start_index` (`period_start`),
  INDEX `bank_reconciliations_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: bank_alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS `bank_alerts` (
  `id`                 CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `bank_connection_id` CHAR(36) NOT NULL,
  `transaction_id`     CHAR(36) NULL DEFAULT NULL,
  `title`              VARCHAR(255) NOT NULL,
  `message`            TEXT NOT NULL,
  `alert_type`         VARCHAR(100) NOT NULL,
  `priority`           ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `amount`             DECIMAL(18,2) NULL DEFAULT NULL,
  `currency`           VARCHAR(10) NULL DEFAULT 'GHS',
  `is_read`            TINYINT(1) NOT NULL DEFAULT 0,
  `is_dismissed`       TINYINT(1) NOT NULL DEFAULT 0,
  `read_by`            BIGINT UNSIGNED NULL DEFAULT NULL,
  `read_at`            TIMESTAMP NULL DEFAULT NULL,
  `created_at`         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`bank_connection_id`) REFERENCES `bank_connections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`transaction_id`) REFERENCES `bank_transactions`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`read_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `bank_alerts_is_read_index` (`is_read`),
  INDEX `bank_alerts_is_dismissed_index` (`is_dismissed`),
  INDEX `bank_alerts_priority_index` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: finance_invoices
-- ============================================================
CREATE TABLE IF NOT EXISTS `finance_invoices` (
  `id`               CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `invoice_number`   VARCHAR(100) NOT NULL UNIQUE,
  `invoice_type`     ENUM('proforma','commercial','credit-note','debit-note') NOT NULL DEFAULT 'commercial',
  `customer`         VARCHAR(255) NOT NULL,
  `customer_id`      VARCHAR(100) NOT NULL,
  `service_type`     VARCHAR(100) NOT NULL DEFAULT 'other',
  `currency`         VARCHAR(10) NOT NULL DEFAULT 'GHS',
  `exchange_rate`    DECIMAL(10,4) NOT NULL DEFAULT 1,
  `subtotal`         DECIMAL(18,2) NOT NULL DEFAULT 0,
  `tax_amount`       DECIMAL(18,2) NOT NULL DEFAULT 0,
  `total_amount`     DECIMAL(18,2) NOT NULL DEFAULT 0,
  `ghs_equivalent`   DECIMAL(18,2) NOT NULL DEFAULT 0,
  `status`           ENUM('draft','sent','partially_paid','paid','overdue','cancelled','disputed') NOT NULL DEFAULT 'draft',
  `issue_date`       DATE NOT NULL DEFAULT (CURRENT_DATE),
  `due_date`         DATE NOT NULL,
  `paid_date`        DATE NULL DEFAULT NULL,
  `paid_amount`      DECIMAL(18,2) NOT NULL DEFAULT 0,
  `payment_method`   VARCHAR(100) NULL DEFAULT NULL,
  `shipment_ref`     VARCHAR(100) NULL DEFAULT NULL,
  `job_ref`          VARCHAR(100) NULL DEFAULT NULL,
  `consolidation_ref` VARCHAR(100) NULL DEFAULT NULL,
  `description`      TEXT NULL DEFAULT NULL,
  `notes`            TEXT NULL DEFAULT NULL,
  `created_by`       VARCHAR(255) NOT NULL DEFAULT 'System',
  `approved_by`      VARCHAR(255) NULL DEFAULT NULL,
  `approval_date`    DATE NULL DEFAULT NULL,
  `created_at`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `finance_invoices_customer_id_index` (`customer_id`),
  INDEX `finance_invoices_status_index` (`status`),
  INDEX `finance_invoices_due_date_index` (`due_date`),
  INDEX `finance_invoices_issue_date_index` (`issue_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: finance_job_costs
-- ============================================================
CREATE TABLE IF NOT EXISTS `finance_job_costs` (
  `id`               CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `job_ref`          VARCHAR(100) NOT NULL,
  `job_type`         ENUM('shipment','consolidation','trucking','warehouse','other') NOT NULL DEFAULT 'shipment',
  `customer`         VARCHAR(255) NOT NULL,
  `customer_id`      VARCHAR(100) NOT NULL,
  `description`      TEXT NOT NULL,
  `vendor`           VARCHAR(255) NULL DEFAULT NULL,
  `cost_category`    VARCHAR(100) NOT NULL DEFAULT 'other',
  `currency`         VARCHAR(10) NOT NULL DEFAULT 'GHS',
  `exchange_rate`    DECIMAL(10,4) NOT NULL DEFAULT 1,
  `amount`           DECIMAL(18,2) NOT NULL DEFAULT 0,
  `ghs_equivalent`   DECIMAL(18,2) NOT NULL DEFAULT 0,
  `payment_status`   ENUM('unpaid','partial','paid') NOT NULL DEFAULT 'unpaid',
  `paid_amount`      DECIMAL(18,2) NOT NULL DEFAULT 0,
  `paid_date`        DATE NULL DEFAULT NULL,
  `due_date`         DATE NULL DEFAULT NULL,
  `is_reimbursable`  TINYINT(1) NOT NULL DEFAULT 1,
  `approval_status`  ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `approved_by`      VARCHAR(255) NULL DEFAULT NULL,
  `shipment_ref`     VARCHAR(100) NULL DEFAULT NULL,
  `consolidation_ref` VARCHAR(100) NULL DEFAULT NULL,
  `created_by`       VARCHAR(255) NOT NULL DEFAULT 'System',
  `created_at`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `finance_job_costs_customer_id_index` (`customer_id`),
  INDEX `finance_job_costs_job_ref_index` (`job_ref`),
  INDEX `finance_job_costs_payment_status_index` (`payment_status`),
  INDEX `finance_job_costs_approval_status_index` (`approval_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: finance_expenses
-- ============================================================
CREATE TABLE IF NOT EXISTS `finance_expenses` (
  `id`            CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `expense_ref`   VARCHAR(100) NOT NULL UNIQUE,
  `description`   TEXT NOT NULL,
  `category`      VARCHAR(100) NOT NULL DEFAULT 'other',
  `currency`      VARCHAR(10) NOT NULL DEFAULT 'GHS',
  `exchange_rate` DECIMAL(10,4) NOT NULL DEFAULT 1,
  `amount`        DECIMAL(18,2) NOT NULL DEFAULT 0,
  `ghs_equivalent` DECIMAL(18,2) NOT NULL DEFAULT 0,
  `status`        ENUM('pending','approved','rejected','paid') NOT NULL DEFAULT 'pending',
  `expense_date`  DATE NOT NULL DEFAULT (CURRENT_DATE),
  `paid_date`     DATE NULL DEFAULT NULL,
  `requested_by`  VARCHAR(255) NOT NULL DEFAULT 'System',
  `approved_by`   VARCHAR(255) NULL DEFAULT NULL,
  `notes`         TEXT NULL DEFAULT NULL,
  `created_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `finance_expenses_status_index` (`status`),
  INDEX `finance_expenses_expense_date_index` (`expense_date`),
  INDEX `finance_expenses_category_index` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: ai_interactions
-- ============================================================
CREATE TABLE IF NOT EXISTS `ai_interactions` (
  `id`          CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `user_id`     BIGINT UNSIGNED NOT NULL,
  `department`  VARCHAR(100) NOT NULL,
  `module`      VARCHAR(100) NOT NULL,
  `prompt`      TEXT NOT NULL,
  `response`    LONGTEXT NULL DEFAULT NULL,
  `model`       VARCHAR(100) NULL DEFAULT 'google/gemini-3-flash-preview',
  `tokens_used` INT NULL DEFAULT NULL,
  `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `ai_interactions_user_id_index` (`user_id`),
  INDEX `ai_interactions_department_index` (`department`),
  INDEX `ai_interactions_created_at_index` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-lock account after 5 failed login attempts
DELIMITER $$
CREATE TRIGGER `trg_profiles_lock_after_failed_logins`
BEFORE UPDATE ON `profiles`
FOR EACH ROW
BEGIN
  IF NEW.failed_login_attempts >= 5 AND OLD.is_locked = 0 THEN
    SET NEW.is_locked = 1;
    SET NEW.locked_at = NOW();
  END IF;
END$$

-- Reset lock when manually unlocked
CREATE TRIGGER `trg_profiles_reset_lock`
BEFORE UPDATE ON `profiles`
FOR EACH ROW
BEGIN
  IF NEW.is_locked = 0 AND OLD.is_locked = 1 THEN
    SET NEW.failed_login_attempts = 0;
    SET NEW.locked_at = NULL;
  END IF;
END$$

DELIMITER ;

-- ============================================================
-- INITIAL SEED DATA (roles/departments reference)
-- ============================================================

-- No seed data needed; roles/departments are ENUM values.
-- Admin bootstrap should be done via artisan command or seeder.

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
