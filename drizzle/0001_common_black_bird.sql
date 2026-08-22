CREATE TABLE "model" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"basic_info" jsonb NOT NULL,
	"files" jsonb NOT NULL,
	"technical" jsonb NOT NULL,
	"training" jsonb NOT NULL,
	"evaluation" jsonb NOT NULL,
	"usage" jsonb NOT NULL,
	"license" jsonb NOT NULL,
	"pricing" jsonb NOT NULL,
	"model_card" jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "model" ADD CONSTRAINT "model_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;