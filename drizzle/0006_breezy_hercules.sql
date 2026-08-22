CREATE TABLE "purchase" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"model_id" text NOT NULL,
	"status" text DEFAULT 'paid' NOT NULL,
	"pricing_type" text NOT NULL,
	"subtotal" integer NOT NULL,
	"platform_fee" integer DEFAULT 0 NOT NULL,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"card_brand" text NOT NULL,
	"card_last4" text NOT NULL,
	"license_key" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_model_id_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "purchase_user_model_idx" ON "purchase" USING btree ("user_id","model_id");