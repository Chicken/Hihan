CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`embed_id` text NOT NULL,
	`in_reply_id` text,
	`timestamp` integer NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`embed_id`) REFERENCES `embeds`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`in_reply_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `embed_idx` ON `comments` (`embed_id`);--> statement-breakpoint
CREATE TABLE `embeds` (
	`id` text PRIMARY KEY NOT NULL
);
