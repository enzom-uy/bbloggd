import { relations } from 'drizzle-orm/relations';
import {
    games,
    howlongtobeatData,
    gameGenres,
    reviews,
    reviewLikes,
    users,
    collections,
    gamePlatforms,
    gameStats,
    userActivity,
    usersSocialLinks,
    collectionGames,
    userGames,
} from './schema';

export const howlongtobeatDataRelations = relations(
    howlongtobeatData,
    ({ one }) => ({
        game: one(games, {
            fields: [howlongtobeatData.gameId],
            references: [games.id],
        }),
    }),
);

export const gamesRelations = relations(games, ({ many }) => ({
    howlongtobeatData: many(howlongtobeatData),
    gameGenres: many(gameGenres),
    gamePlatforms: many(gamePlatforms),
    gameStats: many(gameStats),
    userActivities: many(userActivity, {
        relationName: 'userActivity_gameId_games_id',
    }),
    collectionGames: many(collectionGames),
    userGames: many(userGames),
}));

export const gameGenresRelations = relations(gameGenres, ({ one }) => ({
    game: one(games, {
        fields: [gameGenres.gameId],
        references: [games.id],
    }),
}));

export const reviewLikesRelations = relations(reviewLikes, ({ one }) => ({
    review: one(reviews, {
        fields: [reviewLikes.reviewId],
        references: [reviews.id],
    }),
    user: one(users, {
        fields: [reviewLikes.userId],
        references: [users.id],
    }),
}));

export const reviewsRelations = relations(reviews, ({ many }) => ({
    reviewLikes: many(reviewLikes),
    userActivities: many(userActivity, {
        relationName: 'userActivity_reviewId_reviews_id',
    }),
}));

export const usersRelations = relations(users, ({ many }) => ({
    reviewLikes: many(reviewLikes),
    collections: many(collections),
    userActivities: many(userActivity, {
        relationName: 'userActivity_userId_users_id',
    }),
    usersSocialLinks: many(usersSocialLinks),
    userGames: many(userGames),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
    user: one(users, {
        fields: [collections.userId],
        references: [users.id],
    }),
    collectionGames: many(collectionGames),
}));

export const gamePlatformsRelations = relations(gamePlatforms, ({ one }) => ({
    game: one(games, {
        fields: [gamePlatforms.gameId],
        references: [games.id],
    }),
}));

export const gameStatsRelations = relations(gameStats, ({ one }) => ({
    game: one(games, {
        fields: [gameStats.gameId],
        references: [games.id],
    }),
}));

export const userActivityRelations = relations(userActivity, ({ one }) => ({
    game: one(games, {
        fields: [userActivity.gameId],
        references: [games.id],
        relationName: 'userActivity_gameId_games_id',
    }),
    review: one(reviews, {
        fields: [userActivity.reviewId],
        references: [reviews.id],
        relationName: 'userActivity_reviewId_reviews_id',
    }),
    user: one(users, {
        fields: [userActivity.userId],
        references: [users.id],
        relationName: 'userActivity_userId_users_id',
    }),
}));

export const usersSocialLinksRelations = relations(
    usersSocialLinks,
    ({ one }) => ({
        user: one(users, {
            fields: [usersSocialLinks.userId],
            references: [users.id],
        }),
    }),
);

export const collectionGamesRelations = relations(
    collectionGames,
    ({ one }) => ({
        collection: one(collections, {
            fields: [collectionGames.collectionId],
            references: [collections.id],
        }),
        game: one(games, {
            fields: [collectionGames.gameId],
            references: [games.id],
        }),
    }),
);

export const userGamesRelations = relations(userGames, ({ one }) => ({
    user: one(users, {
        fields: [userGames.userId],
        references: [users.id],
    }),
    game: one(games, {
        fields: [userGames.gameId],
        references: [games.id],
    }),
}));
