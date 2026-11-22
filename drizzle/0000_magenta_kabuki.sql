CREATE TABLE `passport_request` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`username` text,
	`name` text NOT NULL,
	`email` text,
	`first_name` text NOT NULL,
	`surname` text NOT NULL,
	`place_of_origin` text NOT NULL,
	`date_of_birth` text NOT NULL,
	`portrait_url` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`exported_at` integer
);
--> statement-breakpoint
CREATE INDEX `passportRequest_status_createdAt_idx` ON `passport_request` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `passportRequest_userId_idx` ON `passport_request` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `passportRequest_one_pending_per_user` ON `passport_request` (`user_id`) WHERE "passport_request"."status" = 'pending';--> statement-breakpoint
CREATE TABLE `session` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`username` text,
	`name` text NOT NULL,
	`email` text,
	`picture` text,
	`roles` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `session_expiresAt_idx` ON `session` (`expires_at`);