import {
  boolean,
  doublePrecision,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

export const user = pgTable(
  'User',
  {
    id: text('id').default('').primaryKey().notNull(),
    username: varchar('username', { length: 80 }).notNull(),
    name: varchar('name', { length: 80 }).notNull(),
    introduce: varchar('introduce', { length: 255 }),
    avatar: varchar('avatar', { length: 1024 }),
    password: varchar('password', { length: 80 }).notNull(),
    mail: varchar('mail', { length: 80 }),
    url: varchar('url', { length: 1024 }),
    lastLoginTime: timestamp('last_login_time', {
      precision: 3,
      mode: 'string',
    }),
    lastLoginIp: text('last_login_ip'),
    socialIds: jsonb('social_ids').default({}),
    authCode: text('auth_code').notNull(),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' }),
  },
  (table) => {
    return {
      usernameKey: uniqueIndex('User_username_key').on(table.username),
    }
  },
)

export const apiToken = pgTable(
  'ApiToken',
  {
    id: text('id').default('').primaryKey().notNull(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    created: timestamp('created', { precision: 3, mode: 'string' })
      .defaultNow()
      .notNull(),
    token: text('token').notNull(),
    expired: timestamp('expired', { precision: 3, mode: 'string' }),
    name: text('name').notNull(),
  },
  (table) => {
    return {
      nameKey: uniqueIndex('ApiToken_name_key').on(table.name),
    }
  },
)

export const oauth = pgTable('OAuth', {
  id: text('id').default('').primaryKey().notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  platform: text('platform').notNull(),
  oauthId: text('oauthId').notNull(),
})

export const post = pgTable(
  'Post',
  {
    id: text('id').default('').primaryKey().notNull(),
    slug: text('slug').notNull(),
    text: text('text').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' }),
    categoryId: text('categoryId')
      .notNull()
      .references(() => category.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    copyright: boolean('copyright').default(true).notNull(),
    allowComment: boolean('allow_comment').default(true).notNull(),
    count: jsonb('count').default({ like: 0, read: 0 }).notNull(),
    pin: boolean('pin').default(false).notNull(),
    pinOrder: integer('pin_order').default(0).notNull(),
    relatedById: text('related_by_id'),
  },
  (table) => {
    return {
      slugIdx: index('Post_slug_idx').on(table.slug),
      createdAtIdx: index('Post_created_at_idx').on(table.createdAt),
      slugCategoryIdKey: uniqueIndex('Post_slug_categoryId_key').on(
        table.slug,
        table.categoryId,
      ),
      postRelatedByIdFkey: foreignKey({
        columns: [table.relatedById],
        foreignColumns: [table.id],
      })
        .onUpdate('cascade')
        .onDelete('set null'),
    }
  },
)

export const postImage = pgTable('PostImage', {
  id: text('id').default('').primaryKey().notNull(),
  src: text('src').notNull(),
  width: doublePrecision('width').notNull(),
  height: doublePrecision('height').notNull(),
  accent: text('accent').notNull(),
  mineType: text('mine_type').notNull(),
  postId: text('postId').references(() => post.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
})

export const postTag = pgTable(
  'PostTag',
  {
    id: text('id').default('').primaryKey().notNull(),
    name: text('name').notNull(),
    postId: text('postId').references(() => post.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
  },
  (table) => {
    return {
      nameKey: uniqueIndex('PostTag_name_key').on(table.name),
    }
  },
)

export const category = pgTable(
  'Category',
  {
    id: text('id').default('').primaryKey().notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      nameKey: uniqueIndex('Category_name_key').on(table.name),
      slugKey: uniqueIndex('Category_slug_key').on(table.slug),
      slugIndex: index('slugIndex').on(table.slug),
    }
  },
)
