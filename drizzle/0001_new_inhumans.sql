CREATE TABLE "genres" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"slug" varchar(100) NOT NULL,
	CONSTRAINT "genres_name_unique" UNIQUE("name"),
	CONSTRAINT "genres_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "game_genres" DROP CONSTRAINT "game_genres_genre_name_key";--> statement-breakpoint
DROP INDEX "idx_game_genres_genre_name";--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "game_genres" ADD COLUMN "genre_id" varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE "game_genres" ADD COLUMN "slug" varchar(100) NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_genres_slug" ON "genres" USING btree ("slug" text_ops);--> statement-breakpoint
ALTER TABLE "game_genres" ADD CONSTRAINT "game_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_game_genres_game_id" ON "game_genres" USING btree ("game_id" text_ops);--> statement-breakpoint
ALTER TABLE "game_genres" ADD CONSTRAINT "game_genres_genre_id_unique" UNIQUE("genre_id");--> statement-breakpoint
ALTER TABLE "game_genres" ADD CONSTRAINT "game_genres_genre_name_unique" UNIQUE("genre_name");--> statement-breakpoint
ALTER TABLE "game_genres" ADD CONSTRAINT "game_genres_game_genre_unique" UNIQUE("game_id","genre_id");--> statement-breakpoint
ALTER TABLE "game_genres" ADD CONSTRAINT "game_genres_name_unique" UNIQUE("game_id","genre_name");