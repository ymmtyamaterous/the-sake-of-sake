CREATE TABLE `venue` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`address` text,
	`visited_at` text NOT NULL,
	`rating` integer NOT NULL,
	`notes` text,
	`image_path` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "venue_rating_check" CHECK("venue"."rating" >= 1 AND "venue"."rating" <= 5)
);
--> statement-breakpoint
CREATE INDEX `venue_userId_idx` ON `venue` (`user_id`);--> statement-breakpoint
CREATE INDEX `venue_type_idx` ON `venue` (`type`);--> statement-breakpoint
CREATE INDEX `venue_visitedAt_idx` ON `venue` (`visited_at`);