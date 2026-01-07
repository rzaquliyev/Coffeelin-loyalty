CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`passkitMemberId` varchar(64),
	`bonusBalance` int NOT NULL DEFAULT 0,
	`tier` enum('Silver','Gold','Platinum') NOT NULL DEFAULT 'Silver',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `customers_phoneNumber_unique` UNIQUE(`phoneNumber`)
);
--> statement-breakpoint
CREATE TABLE `passkitConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` varchar(255) NOT NULL,
	`tierId` varchar(255),
	`credentialsPath` text,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `passkitConfig_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`type` enum('earned','redeemed') NOT NULL,
	`amount` int NOT NULL,
	`spentAmount` decimal(10,2),
	`performedBy` int,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
