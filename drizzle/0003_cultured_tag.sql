ALTER TABLE "genres" DROP CONSTRAINT "genres_name_unique";--> statement-breakpoint
ALTER TABLE "genres" DROP CONSTRAINT "genres_slug_unique";--> statement-breakpoint
ALTER TABLE "genres" ADD CONSTRAINT "genres_name_slug_unique" UNIQUE("name","slug");