import { boolean, integer, pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

import type {
  ModelBasicInfo,
  ModelCardContent,
  ModelCategory,
  ModelEvaluation,
  ModelFilesInfo,
  ModelLicense,
  ModelPricing,
  ModelTechnical,
  ModelTraining,
  ModelUsage,
} from '../../zod-schema/upload-model-schema';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified')
    .$defaultFn(() => false)
    .notNull(),
  image: text('image'),
  role: text('role')
    .$defaultFn(() => 'user')
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  issuer: text('issuer').notNull(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const model = pgTable('model', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  niche: text('niche').notNull(),
  category: text('category').$type<ModelCategory>().notNull(),
  task: text('task').notNull(),
  version: text('version').notNull(),
  endpointUrl: text('endpoint_url').notNull(),
  downloads: integer('downloads').notNull().default(0),
  likes: integer('likes').notNull().default(0),
  isVerified: boolean('is_verified').notNull().default(false),
  basicInfo: jsonb('basic_info').$type<ModelBasicInfo>().notNull(),
  files: jsonb('files').$type<ModelFilesInfo>().notNull(),
  technical: jsonb('technical').$type<ModelTechnical>().notNull(),
  training: jsonb('training').$type<ModelTraining>().notNull(),
  evaluation: jsonb('evaluation').$type<ModelEvaluation>().notNull(),
  usage: jsonb('usage').$type<ModelUsage>().notNull(),
  license: jsonb('license').$type<ModelLicense>().notNull(),
  pricing: jsonb('pricing').$type<ModelPricing>().notNull(),
  modelCard: jsonb('model_card').$type<ModelCardContent>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const schema = { user, session, account, verification, model };
