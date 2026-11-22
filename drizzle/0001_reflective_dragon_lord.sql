ALTER TABLE `passport_request` ADD `passport_number` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `passport_request_passport_number_unique` ON `passport_request` (`passport_number`);