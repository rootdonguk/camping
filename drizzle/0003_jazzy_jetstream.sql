CREATE TABLE `bank_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bank_name` varchar(128) NOT NULL,
	`account_number` varchar(128) NOT NULL,
	`account_holder` varchar(128) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`display_order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bank_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_gateway_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` enum('stripe','naver_pay','kakao_pay','toss') NOT NULL,
	`is_enabled` boolean NOT NULL DEFAULT false,
	`api_key` text,
	`api_secret` text,
	`merchant_id` varchar(256),
	`webhook_url` text,
	`test_mode` boolean NOT NULL DEFAULT true,
	`config` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_gateway_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_gateway_settings_provider_unique` UNIQUE(`provider`)
);
--> statement-breakpoint
ALTER TABLE `reservations` MODIFY COLUMN `payment_status` enum('unpaid','deposit_paid','fully_paid','pending_verification') NOT NULL DEFAULT 'unpaid';--> statement-breakpoint
ALTER TABLE `reservations` MODIFY COLUMN `payment_method` enum('stripe','naver_pay','kakao_pay','toss','bank_transfer') DEFAULT 'stripe';--> statement-breakpoint
ALTER TABLE `reservations` ADD `bank_transfer_proof` text;--> statement-breakpoint
ALTER TABLE `reservations` ADD `bank_transfer_amount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `reservations` ADD `bank_transfer_date` timestamp;--> statement-breakpoint
ALTER TABLE `reservations` ADD `bank_transfer_approved_by` int;--> statement-breakpoint
ALTER TABLE `reservations` ADD `bank_transfer_approved_at` timestamp;