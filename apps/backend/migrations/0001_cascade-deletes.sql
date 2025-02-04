PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`embed_id` text NOT NULL,
	`in_reply_id` text,
	`timestamp` integer NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`embed_id`) REFERENCES `embeds`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`in_reply_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_comments`("id", "embed_id", "in_reply_id", "timestamp", "name", "content") SELECT "id", "embed_id", "in_reply_id", "timestamp", "name", "content" FROM `comments`;--> statement-breakpoint
DROP TABLE `comments`;--> statement-breakpoint
ALTER TABLE `__new_comments` RENAME TO `comments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `embed_idx` ON `comments` (`embed_id`);