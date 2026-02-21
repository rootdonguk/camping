-- Add bank transfer approval fields to reservations
ALTER TABLE `reservations` ADD `bank_transfer_approved_by` int;
ALTER TABLE `reservations` ADD `bank_transfer_approved_at` timestamp;

-- Create payment gateway settings table
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

-- Create bank accounts table
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
