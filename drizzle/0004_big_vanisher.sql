ALTER TABLE "model" ADD COLUMN "task" text NOT NULL;--> statement-breakpoint
ALTER TABLE "model" ADD COLUMN "version" text NOT NULL;--> statement-breakpoint
ALTER TABLE "model" ADD COLUMN "endpoint_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "model" ADD COLUMN "downloads" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "model" ADD COLUMN "likes" integer DEFAULT 0 NOT NULL;
