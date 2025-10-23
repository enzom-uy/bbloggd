import { relations } from "drizzle-orm/relations";
import { users, collections, games, gameGenres, genres, accounts, gamePlatforms, platforms, gameStats, howlongtobeatData, reviews, reviewLikes, userGames, userSessions, usersSocialLinks, collectionGames, userActivity } from "./schema";

export const collectionsRelations = relations(collections, ({one, many}) => ({
	user: one(users, {
		fields: [collections.userId],
		references: [users.id]
	}),
	collectionGames: many(collectionGames),
}));

export const usersRelations = relations(users, ({many}) => ({
	collections: many(collections),
	accounts: many(accounts),
	reviews: many(reviews),
	reviewLikes: many(reviewLikes),
	userGames: many(userGames),
	userSessions: many(userSessions),
	usersSocialLinks: many(usersSocialLinks),
	userActivities_userId: many(userActivity, {
		relationName: "userActivity_userId_users_id"
	}),
}));

export const gameGenresRelations = relations(gameGenres, ({one}) => ({
	game: one(games, {
		fields: [gameGenres.gameId],
		references: [games.id]
	}),
	genre: one(genres, {
		fields: [gameGenres.genreId],
		references: [genres.id]
	}),
}));

export const gamesRelations = relations(games, ({many}) => ({
	gameGenres: many(gameGenres),
	gamePlatforms: many(gamePlatforms),
	gameStats: many(gameStats),
	howlongtobeatData: many(howlongtobeatData),
	reviews: many(reviews),
	userGames: many(userGames),
	collectionGames: many(collectionGames),
	userActivities_gameId: many(userActivity, {
		relationName: "userActivity_gameId_games_id"
	}),
}));

export const genresRelations = relations(genres, ({many}) => ({
	gameGenres: many(gameGenres),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const gamePlatformsRelations = relations(gamePlatforms, ({one}) => ({
	game: one(games, {
		fields: [gamePlatforms.gameId],
		references: [games.id]
	}),
	platform: one(platforms, {
		fields: [gamePlatforms.platformId],
		references: [platforms.id]
	}),
}));

export const platformsRelations = relations(platforms, ({many}) => ({
	gamePlatforms: many(gamePlatforms),
}));

export const gameStatsRelations = relations(gameStats, ({one}) => ({
	game: one(games, {
		fields: [gameStats.gameId],
		references: [games.id]
	}),
}));

export const howlongtobeatDataRelations = relations(howlongtobeatData, ({one}) => ({
	game: one(games, {
		fields: [howlongtobeatData.gameId],
		references: [games.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one, many}) => ({
	user: one(users, {
		fields: [reviews.userId],
		references: [users.id]
	}),
	game: one(games, {
		fields: [reviews.gameId],
		references: [games.id]
	}),
	reviewLikes: many(reviewLikes),
	userActivities_reviewId: many(userActivity, {
		relationName: "userActivity_reviewId_reviews_id"
	}),
}));

export const reviewLikesRelations = relations(reviewLikes, ({one}) => ({
	review: one(reviews, {
		fields: [reviewLikes.reviewId],
		references: [reviews.id]
	}),
	user: one(users, {
		fields: [reviewLikes.userId],
		references: [users.id]
	}),
}));

export const userGamesRelations = relations(userGames, ({one}) => ({
	user: one(users, {
		fields: [userGames.userId],
		references: [users.id]
	}),
	game: one(games, {
		fields: [userGames.gameId],
		references: [games.id]
	}),
}));

export const userSessionsRelations = relations(userSessions, ({one}) => ({
	user: one(users, {
		fields: [userSessions.userId],
		references: [users.id]
	}),
}));

export const usersSocialLinksRelations = relations(usersSocialLinks, ({one}) => ({
	user: one(users, {
		fields: [usersSocialLinks.userId],
		references: [users.id]
	}),
}));

export const collectionGamesRelations = relations(collectionGames, ({one}) => ({
	collection: one(collections, {
		fields: [collectionGames.collectionId],
		references: [collections.id]
	}),
	game: one(games, {
		fields: [collectionGames.gameId],
		references: [games.id]
	}),
}));

export const userActivityRelations = relations(userActivity, ({one}) => ({
	game_gameId: one(games, {
		fields: [userActivity.gameId],
		references: [games.id],
		relationName: "userActivity_gameId_games_id"
	}),
	review_reviewId: one(reviews, {
		fields: [userActivity.reviewId],
		references: [reviews.id],
		relationName: "userActivity_reviewId_reviews_id"
	}),
	user_userId: one(users, {
		fields: [userActivity.userId],
		references: [users.id],
		relationName: "userActivity_userId_users_id"
	}),
}));
