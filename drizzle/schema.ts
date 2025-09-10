import {
    pgTable,
    index,
    foreignKey,
    varchar,
    bigint,
    numeric,
    timestamp,
    text,
    date,
    unique,
    boolean,
    integer,
    pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const activityType = pgEnum('activity_type', [
    'add_review',
    'start_game',
    'finish_game',
    'drop_game',
]);
export const userGameStatus = pgEnum('user_game_status', [
    'backlog',
    'playing',
    'played',
    'dropped',
]);

export const howlongtobeatData = pgTable(
    'howlongtobeat_data',
    {
        id: varchar({ length: 36 }).primaryKey().notNull(),
        gameId: varchar('game_id', { length: 36 }).notNull(),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        hltbId: bigint('hltb_id', { mode: 'number' }).notNull(),
        mainStoryHours: numeric('main_story_hours', { precision: 6, scale: 2 }),
        mainStorySidesHours: numeric('main_story_sides_hours', {
            precision: 6,
            scale: 2,
        }),
        completionistHours: numeric('completionist_hours', {
            precision: 6,
            scale: 2,
        }),
        createdAt: timestamp('created_at', { mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index('idx_howlongtobeat_data_completionist_hours').using(
            'btree',
            table.completionistHours.asc().nullsLast().op('numeric_ops'),
        ),
        index('idx_howlongtobeat_data_hltb_id').using(
            'btree',
            table.hltbId.asc().nullsLast().op('int8_ops'),
        ),
        index('idx_howlongtobeat_data_main_story_hours').using(
            'btree',
            table.mainStoryHours.asc().nullsLast().op('numeric_ops'),
        ),
        index('idx_howlongtobeat_data_main_story_sides_hours').using(
            'btree',
            table.mainStorySidesHours.asc().nullsLast().op('numeric_ops'),
        ),
        foreignKey({
            columns: [table.gameId],
            foreignColumns: [games.id],
            name: 'howlongtobeat_data_game_id_fkey',
        }),
    ],
);

export const games = pgTable(
    'games',
    {
        id: varchar({ length: 36 }).primaryKey().notNull(),
        title: varchar({ length: 255 }).notNull(),
        description: text(),
        slug: text().notNull(),
        releaseDate: date('release_date'),
        coverUrl: text('cover_url'),
        developer: varchar({ length: 255 }),
        publisher: varchar({ length: 255 }),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        igdbId: bigint('igdb_id', { mode: 'number' }).notNull(),
        createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
        updatedAt: timestamp('updated_at', { mode: 'string' }),
    },
    (table) => [
        index('idx_games_igdb_id').using(
            'btree',
            table.igdbId.asc().nullsLast().op('int8_ops'),
        ),
        index('idx_games_title').using(
            'btree',
            table.title.asc().nullsLast().op('text_ops'),
        ),
        unique('games_slug_unique').on(table.slug),
        unique('games_igdb_id_unique').on(table.igdbId),
    ],
);

export const genres = pgTable(
    'genres',
    {
        id: varchar({ length: 36 }).primaryKey().notNull(),
        name: varchar({ length: 50 }).notNull(),
        slug: varchar({ length: 100 }).notNull(),
    },
    (table) => [
        index('idx_genres_slug').using(
            'btree',
            table.slug.asc().nullsLast().op('text_ops'),
        ),
        unique('genres_name_slug_unique').on(table.name, table.slug),
    ],
);

export const gameGenres = pgTable(
    'game_genres',
    {
        id: varchar({ length: 36 }).primaryKey().notNull(),
        gameId: varchar('game_id', { length: 36 }).notNull(),
        genreId: varchar('genre_id', { length: 36 }).notNull(),
    },
    (table) => [
        unique('game_genres_game_genre_unique').on(table.gameId, table.genreId),
        foreignKey({
            columns: [table.gameId],
            foreignColumns: [games.id],
            name: 'game_genres_game_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.genreId],
            foreignColumns: [genres.id],
            name: 'game_genres_genre_id_fkey',
        }).onDelete('cascade'),
    ],
);

export const reviewLikes = pgTable(
    'review_likes',
    {
        id: varchar({ length: 36 }).primaryKey().notNull(),
        reviewId: varchar('review_id', { length: 36 }).notNull(),
        userId: varchar('user_id', { length: 36 }).notNull(),
        createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    },
    (table) => [
        foreignKey({
            columns: [table.reviewId],
            foreignColumns: [reviews.id],
            name: 'review_likes_review_id_fkey',
        }).onDelete('cascade'),
        unique('review_likes_user_review_unique').on(
            table.userId,
            table.reviewId,
        ),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'review_likes_user_id_fkey',
        }).onDelete('cascade'),
    ],
);

export const collections = pgTable(
    'collections',
    {
        id: varchar({ length: 36 }).primaryKey().notNull(),
        userId: varchar('user_id', { length: 36 }).notNull(),
        title: varchar({ length: 255 })
            .default('Untitled collection')
            .notNull(),
        description: varchar({ length: 255 }),
        isPublic: boolean('is_public').default(false).notNull(),
        createdAt: timestamp('created_at', { mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { mode: 'string' }),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'fk_collections_user_id',
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
    ],
);

export const gamePlatforms = pgTable(
    'game_platforms',
    {
        id: varchar({ length: 36 }).primaryKey().notNull(),
        gameId: varchar('game_id', { length: 36 }).notNull(),
        platformName: varchar('platform_name', { length: 50 }).notNull(),
    },
    (table) => [
        index('idx_game_platforms_platform_name').using(
            'btree',
            table.platformName.asc().nullsLast().op('text_ops'),
        ),
        foreignKey({
            columns: [table.gameId],
            foreignColumns: [games.id],
            name: 'game_platforms_game_id_fkey',
        }),
        unique('game_platforms_platform_name_key').on(table.platformName),
    ],
);

export const gameStats = pgTable(
    'game_stats',
    {
        gameId: varchar('game_id', { length: 36 }).primaryKey().notNull(),
        avgRating: numeric('avg_rating', { precision: 3, scale: 2 }),
        reviewsCount: integer('reviews_count'),
        backlogCount: integer('backlog_count'),
        playingCount: integer('playing_count'),
        playedCount: integer('played_count'),
        droppedCount: integer('dropped_count'),
    },
    (table) => [
        foreignKey({
            columns: [table.gameId],
            foreignColumns: [games.id],
            name: 'game_stats_game_id_fkey',
        }),
    ],
);

export const userActivity = pgTable(
    'user_activity',
    {
        id: varchar({ length: 36 }).primaryKey().notNull(),
        userId: varchar('user_id', { length: 36 }).notNull(),
        gameId: varchar('game_id', { length: 36 }).notNull(),
        reviewId: varchar('review_id', { length: 36 }),
        createdAt: timestamp('created_at', { mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { mode: 'string' }),
    },
    (table) => [
        foreignKey({
            columns: [table.gameId],
            foreignColumns: [games.id],
            name: 'fk_user_activity_game_id',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.reviewId],
            foreignColumns: [reviews.id],
            name: 'fk_user_activity_review_id',
        }),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'fk_user_activity_user_id',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.gameId],
            foreignColumns: [games.id],
            name: 'user_activity_game_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.reviewId],
            foreignColumns: [reviews.id],
            name: 'user_activity_review_id_fkey',
        }),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'user_activity_user_id_fkey',
        }).onDelete('cascade'),
    ],
);

export const reviews = pgTable(
    'reviews',
    {
        id: varchar({ length: 36 }).primaryKey().notNull(),
        userId: varchar('user_id', { length: 36 }).notNull(),
        gameId: varchar('game_id', { length: 36 }).notNull(),
        body: text(),
        rating: numeric({ precision: 2, scale: 1 }).notNull(),
        createdAt: timestamp('created_at', { mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { mode: 'string' }),
    },
    (table) => [
        unique('reviews_user_game_unique').on(table.userId, table.gameId),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'reviews_user_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.gameId],
            foreignColumns: [games.id],
            name: 'reviews_game_id_fkey',
        }).onDelete('cascade'),

        index('idx_reviews_game_created').using(
            'btree',
            table.gameId.asc(),
            table.createdAt.desc(),
        ),
        // Índice compuesto para obtener reviews de un usuario ordenadas por rating
        index('idx_reviews_user_rating').using(
            'btree',
            table.userId.asc(),
            table.rating.desc(),
        ),
    ],
);

export const usersSocialLinks = pgTable(
    'users_social_links',
    {
        id: varchar({ length: 36 }).primaryKey().notNull(),
        userId: varchar('user_id', { length: 36 }).notNull(),
        platform: varchar({ length: 50 }).notNull(),
        url: text().notNull(),
        createdAt: timestamp('created_at', { mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { mode: 'string' }),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'fk_users_social_links_user_id',
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
    ],
);

export const collectionGames = pgTable(
    'collection_games',
    {
        id: varchar({ length: 36 }).primaryKey().notNull(),
        collectionId: varchar('collection_id', { length: 36 }).notNull(),
        gameId: varchar('game_id', { length: 36 }).notNull(),
    },
    (table) => [
        unique('collection_games_collection_game_unique').on(
            table.collectionId,
            table.gameId,
        ),
        foreignKey({
            columns: [table.collectionId],
            foreignColumns: [collections.id],
            name: 'collection_games_collection_id_fkey',
        }),
        foreignKey({
            columns: [table.gameId],
            foreignColumns: [games.id],
            name: 'collection_games_game_id_fkey',
        }),
    ],
);

export const users = pgTable(
    'users',
    {
        id: varchar({ length: 36 }).primaryKey().notNull(),
        username: varchar({ length: 50 }).notNull(),
        email: varchar({ length: 255 }).notNull(),
        passwordHash: varchar('password_hash', { length: 255 }),
        steamId: varchar('steam_id', { length: 50 }),
        profilePictureUrl: text('profile_picture_url'),
        bio: text(),
        createdAt: timestamp('created_at', { mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { mode: 'string' }),
    },
    (table) => [
        index('idx_users_email').using(
            'btree',
            table.email.asc().nullsLast().op('text_ops'),
        ),
        index('idx_users_username').using(
            'btree',
            table.username.asc().nullsLast().op('text_ops'),
        ),
        unique('users_username_key').on(table.username),
        unique('users_email_key').on(table.email),
    ],
);

export const userGames = pgTable(
    'user_games',
    {
        id: varchar({ length: 36 }).primaryKey().notNull(),
        userId: varchar('user_id', { length: 36 }).notNull(),
        gameId: varchar('game_id', { length: 36 }).notNull(),
        status: userGameStatus().notNull(),
        rating: numeric({ precision: 2, scale: 1 }),
        createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
        updatedAt: timestamp('updated_at', { mode: 'string' }),
    },
    (table) => [
        index('idx_user_games_rating').using(
            'btree',
            table.rating.asc().nullsLast().op('numeric_ops'),
        ),
        index('idx_user_games_status').using(
            'btree',
            table.status.asc().nullsLast().op('enum_ops'),
        ),
        unique('user_games_user_game_unique').on(table.userId, table.gameId),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'user_games_user_id_fkey',
        }),
        foreignKey({
            columns: [table.gameId],
            foreignColumns: [games.id],
            name: 'user_games_game_id_fkey',
        }),
    ],
);

export type HowlongtobeatData = typeof howlongtobeatData.$inferSelect;
export type NewHowlongtobeatData = typeof howlongtobeatData.$inferInsert;

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

export type GameGenre = typeof gameGenres.$inferSelect;
export type NewGameGenre = typeof gameGenres.$inferInsert;

export type ReviewLike = typeof reviewLikes.$inferSelect;
export type NewReviewLike = typeof reviewLikes.$inferInsert;

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;

export type GamePlatform = typeof gamePlatforms.$inferSelect;
export type NewGamePlatform = typeof gamePlatforms.$inferInsert;

export type GameStats = typeof gameStats.$inferSelect;
export type NewGameStats = typeof gameStats.$inferInsert;

export type UserActivity = typeof userActivity.$inferSelect;
export type NewUserActivity = typeof userActivity.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type UserSocialLink = typeof usersSocialLinks.$inferSelect;
export type NewUserSocialLink = typeof usersSocialLinks.$inferInsert;

export type CollectionGame = typeof collectionGames.$inferSelect;
export type NewCollectionGame = typeof collectionGames.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserGame = typeof userGames.$inferSelect;
export type NewUserGame = typeof userGames.$inferInsert;

export type Genre = typeof genres.$inferSelect;
export type NewGenre = typeof genres.$inferInsert;

// Enum types
export type ActivityType = (typeof activityType.enumValues)[number];
export type UserGameStatus = (typeof userGameStatus.enumValues)[number];
