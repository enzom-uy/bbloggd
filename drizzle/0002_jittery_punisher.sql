ALTER TABLE "game_genres" DROP CONSTRAINT "game_genres_genre_id_unique";--> statement-breakpoint
ALTER TABLE "game_genres" DROP CONSTRAINT "game_genres_genre_name_unique";--> statement-breakpoint
ALTER TABLE "game_genres" DROP CONSTRAINT "game_genres_name_unique";--> statement-breakpoint
DROP INDEX "idx_game_genres_game_id";--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_reviews_game_created" ON "reviews" USING btree ("game_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_reviews_user_rating" ON "reviews" USING btree ("user_id","rating" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "game_genres" DROP COLUMN "genre_name";--> statement-breakpoint
ALTER TABLE "game_genres" DROP COLUMN "slug";--> statement-breakpoint
ALTER TABLE "collection_games" ADD CONSTRAINT "collection_games_collection_game_unique" UNIQUE("collection_id","game_id");--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_igdb_id_unique" UNIQUE("igdb_id");--> statement-breakpoint
ALTER TABLE "review_likes" ADD CONSTRAINT "review_likes_user_review_unique" UNIQUE("user_id","review_id");--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_game_unique" UNIQUE("user_id","game_id");--> statement-breakpoint
ALTER TABLE "user_games" ADD CONSTRAINT "user_games_user_game_unique" UNIQUE("user_id","game_id");