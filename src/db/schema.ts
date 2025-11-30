import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Artists table
export const artists = sqliteTable('artists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  bio: text('bio'),
  imageUrl: text('image_url'),
  followersCount: integer('followers_count').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

// Albums table
export const albums = sqliteTable('albums', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  artistName: text('artist_name').notNull(),
  releaseYear: integer('release_year'),
  coverImageUrl: text('cover_image_url'),
  createdAt: text('created_at').notNull(),
});

// Songs table
export const songs = sqliteTable('songs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  artistName: text('artist_name').notNull(),
  albumName: text('album_name'),
  durationSeconds: integer('duration_seconds').notNull(),
  coverImageUrl: text('cover_image_url'),
  audioUrl: text('audio_url'),
  playCount: integer('play_count').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

// Playlists table
export const playlists = sqliteTable('playlists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  coverImageUrl: text('cover_image_url'),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});

// Playlist songs junction table
export const playlistSongs = sqliteTable('playlist_songs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playlistId: integer('playlist_id').notNull().references(() => playlists.id),
  songId: integer('song_id').notNull().references(() => songs.id),
  position: integer('position').notNull(),
  addedAt: text('added_at').notNull(),
});


// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});