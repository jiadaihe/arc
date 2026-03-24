-- Remove type, challengeFrequency, challengeDurationDays columns
-- Add habitFrequency, habitDurationDays columns

ALTER TABLE `goals` ADD `habit_frequency` text;--> statement-breakpoint
ALTER TABLE `goals` ADD `habit_duration_days` integer;--> statement-breakpoint

-- Migrate existing challenge data to new columns
UPDATE `goals` SET `habit_frequency` = `challenge_frequency`, `habit_duration_days` = `challenge_duration_days` WHERE `type` = 'challenge';--> statement-breakpoint

ALTER TABLE `goals` DROP COLUMN `type`;--> statement-breakpoint
ALTER TABLE `goals` DROP COLUMN `challenge_frequency`;--> statement-breakpoint
ALTER TABLE `goals` DROP COLUMN `challenge_duration_days`;
