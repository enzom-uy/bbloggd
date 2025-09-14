import {
    pgTable,
    index,
    foreignKey,
    varchar,
    bigint,
    numeric,
    timestamp,
    unique,
    boolean,
    integer,
    text,
    date,
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
export const userRole = pgEnum('user_role', ['user', 'supporter', 'admin']);

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

export const verifications = pgTable('verifications', {
    id: varchar({ length: 36 }).primaryKey().notNull(),
    identifier: varchar({ length: 100 }).notNull(),
    value: varchar({ length: 100 }).notNull(),
    expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }),
});

export const accounts = pgTable(
    'accounts',
    {
        id: varchar({ length: 36 }).primaryKey().notNull(),
        userId: varchar('user_id', { length: 36 }).notNull(),
        accountId: varchar('account_id', { length: 50 }).notNull(),
        providerId: varchar('provider_id', { length: 50 }).notNull(),
        accessToken: varchar('access_token', { length: 255 }),
        refreshToken: varchar('refresh_token', { length: 255 }),
        accessTokenExpiresAt: timestamp('access_token_expires_at', {
            mode: 'string',
        }),
        refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
            mode: 'string',
        }),
        scope: varchar({ length: 255 }),
        idToken: varchar('id_token', { length: 255 }),
        password: varchar({ length: 255 }),
        createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
        updatedAt: timestamp('updated_at', { mode: 'string' }),
    },
    (table) => [
        index('idx_accounts_account_id').using(
            'btree',
            table.accountId.asc().nullsLast().op('text_ops'),
        ),
        index('idx_accounts_user_id').using(
            'btree',
            table.userId.asc().nullsLast().op('text_ops'),
        ),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'accounts_user_id_fkey',
        }).onDelete('cascade'),
        unique('accounts_account_id_key').on(table.accountId),
    ],
);

export const userSessions = pgTable(
    'user_sessions',
    {
        id: varchar({ length: 36 }).primaryKey().notNull(),
        userId: varchar('user_id', { length: 36 }).notNull(),
        token: varchar({ length: 255 }).notNull(),
        expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
        ipAddress: varchar('ip_address', { length: 50 }),
        userAgent: varchar('user_agent', { length: 255 }),
        createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
        updatedAt: timestamp('updated_at', { mode: 'string' }),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'user_sessions_user_id_fkey',
        }).onDelete('cascade'),
        unique('user_sessions_token_key').on(table.token),
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
        unique('game_genres_game_genre_unique').on(table.gameId, table.genreId),
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
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'review_likes_user_id_fkey',
        }).onDelete('cascade'),
        unique('review_likes_user_review_unique').on(
            table.reviewId,
            table.userId,
        ),
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
        avgRating: numeric('avg_rating', {
            precision: 3,
            scale: 2,
            mode: 'number',
        }),
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

export const games = pgTable(
    'games',
    {
        id: varchar({ length: 36 }).primaryKey().notNull(),
        title: varchar({ length: 255 }).notNull(),
        description: text(),
        releaseDate: date('release_date'),
        coverUrl: text('cover_url'),
        developer: varchar({ length: 255 }),
        publisher: varchar({ length: 255 }),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        igdbId: bigint('igdb_id', { mode: 'number' }).notNull(),
        createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
        updatedAt: timestamp('updated_at', { mode: 'string' }),
        slug: text().notNull(),
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
        unique('games_igdb_id_unique').on(table.igdbId),
        unique('games_slug_unique').on(table.slug),
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
        index('idx_reviews_game_created').using(
            'btree',
            table.gameId.asc().nullsLast().op('text_ops'),
            table.createdAt.desc().nullsLast().op('text_ops'),
        ),
        index('idx_reviews_user_rating').using(
            'btree',
            table.userId.asc().nullsLast().op('text_ops'),
            table.rating.desc().nullsLast().op('numeric_ops'),
        ),
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
        unique('reviews_user_game_unique').on(table.userId, table.gameId),
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
        emailVerified: boolean('email_verified').default(false).notNull(),
        role: userRole().notNull(),
        displayUsername: varchar('display_username', { length: 50 }).notNull(),
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
        unique('users_steam_id_key').on(table.steamId),
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
        unique('collection_games_collection_game_unique').on(
            table.collectionId,
            table.gameId,
        ),
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
        unique('user_games_user_game_unique').on(table.userId, table.gameId),
    ],
);
