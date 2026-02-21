CREATE TABLE `camping_sites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`capacity` int NOT NULL DEFAULT 4,
	`price_per_night` decimal(10,2) NOT NULL,
	`image_url` text,
	`amenities` text,
	`site_type` enum('tent','caravan','glamping','cabin') NOT NULL DEFAULT 'tent',
	`is_active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `camping_sites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(32),
	`subject` varchar(256) NOT NULL,
	`message` text NOT NULL,
	`status` enum('unread','read','replied') NOT NULL DEFAULT 'unread',
	`admin_reply` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`site_id` int NOT NULL,
	`check_in_date` bigint NOT NULL,
	`check_out_date` bigint NOT NULL,
	`guest_count` int NOT NULL DEFAULT 1,
	`guest_name` varchar(128) NOT NULL,
	`guest_phone` varchar(32) NOT NULL,
	`guest_email` varchar(320) NOT NULL,
	`special_requests` text,
	`status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`total_amount` decimal(10,2) NOT NULL,
	`payment_status` enum('unpaid','deposit_paid','fully_paid') NOT NULL DEFAULT 'unpaid',
	`stripe_payment_intent_id` varchar(256),
	`admin_note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservations_id` PRIMARY KEY(`id`)
);
