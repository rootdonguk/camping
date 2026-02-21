CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(128) NOT NULL,
	`value` text,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
ALTER TABLE `reservations` ADD `payment_method` enum('stripe','naver_pay','kakao_pay','toss') DEFAULT 'stripe';--> statement-breakpoint
ALTER TABLE `reservations` ADD `naverpay_order_id` varchar(256);--> statement-breakpoint
ALTER TABLE `reservations` ADD `kakaopay_tid` varchar(256);--> statement-breakpoint
ALTER TABLE `reservations` ADD `toss_order_id` varchar(256);