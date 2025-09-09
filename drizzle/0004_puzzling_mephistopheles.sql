ALTER TABLE "game_genres" DROP CONSTRAINT "game_genres_game_id_fkey";
--> statement-breakpoint
ALTER TABLE "game_genres" DROP CONSTRAINT "game_genres_genre_id_fkey";
--> statement-breakpoint
ALTER TABLE "game_genres" ADD CONSTRAINT "game_genres_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_genres" ADD CONSTRAINT "game_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;