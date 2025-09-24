CREATE TYPE "public"."user_role" AS ENUM('user', 'supporter', 'admin');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"account_id" varchar(50) NOT NULL,
	"provider_id" varchar(50) NOT NULL,
	"access_token" varchar(255),
	"refresh_token" varchar(255),
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" varchar(255),
	"id_token" varchar(255),
	"password" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "accounts_account_id_key" UNIQUE("account_id")
);
--> statement-breakpoint
CREATE TABLE "platforms" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"abbreviation" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "platforms_name_slug_unique" UNIQUE("name","slug"),
	CONSTRAINT "platforms_abbreviation_unique" UNIQUE("abbreviation")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" varchar(50),
	"user_agent" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "user_sessions_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"identifier" varchar(100) NOT NULL,
	"value" varchar(100) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "game_platforms" RENAME COLUMN "platform_name" TO "platform_id";--> statement-breakpoint
ALTER TABLE "game_platforms" DROP CONSTRAINT "game_platforms_platform_name_key";--> statement-breakpoint
ALTER TABLE "review_likes" DROP CONSTRAINT "review_likes_user_review_unique";--> statement-breakpoint
DROP INDEX "idx_game_platforms_platform_name";--> statement-breakpoint
DROP INDEX "idx_reviews_game_created";--> statement-breakpoint
DROP INDEX "idx_reviews_user_rating";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "display_username" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_accounts_account_id" ON "accounts" USING btree ("account_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_accounts_user_id" ON "accounts" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_platforms_slug" ON "platforms" USING btree ("slug" text_ops);--> statement-breakpoint
ALTER TABLE "game_platforms" ADD CONSTRAINT "game_platforms_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_reviews_game_created" ON "reviews" USING btree ("game_id" text_ops,"created_at" text_ops);--> statement-breakpoint
CREATE INDEX "idx_reviews_user_rating" ON "reviews" USING btree ("user_id" text_ops,"rating" numeric_ops);--> statement-breakpoint
ALTER TABLE "review_likes" ADD CONSTRAINT "review_likes_user_review_unique" UNIQUE("review_id","user_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_steam_id_key" UNIQUE("steam_id");