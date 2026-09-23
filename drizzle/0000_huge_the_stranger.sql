CREATE TABLE `exceptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_slug` text NOT NULL,
	`week` integer NOT NULL,
	`reason` text NOT NULL,
	`day` text NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	`room` text,
	`status` text DEFAULT 'proposed' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`group_slug`) REFERENCES `groups`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`day` text NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	`room` text NOT NULL,
	`tutor_name` text NOT NULL
);
