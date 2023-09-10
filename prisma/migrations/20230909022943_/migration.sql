-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT '',
    "username" VARCHAR(80) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "introduce" VARCHAR(255),
    "avatar" VARCHAR(1024),
    "password" VARCHAR(80) NOT NULL,
    "mail" VARCHAR(80),
    "url" VARCHAR(1024),
    "last_login_time" TIMESTAMP(3),
    "last_login_ip" TEXT,
    "social_ids" JSONB DEFAULT '{}',
    "auth_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiToken" (
    "id" TEXT NOT NULL DEFAULT '',
    "userId" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,
    "expired" TIMESTAMP(3),
    "name" TEXT NOT NULL,

    CONSTRAINT "ApiToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuth" (
    "id" TEXT NOT NULL DEFAULT '',
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "oauthId" TEXT NOT NULL,

    CONSTRAINT "OAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostImage" (
    "id" TEXT NOT NULL DEFAULT '',
    "src" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "accent" TEXT NOT NULL,
    "mine_type" TEXT NOT NULL,
    "postId" TEXT,

    CONSTRAINT "PostImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTag" (
    "id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "postId" TEXT,

    CONSTRAINT "PostTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "categoryId" TEXT NOT NULL,
    "copyright" BOOLEAN NOT NULL DEFAULT true,
    "allow_comment" BOOLEAN NOT NULL DEFAULT true,
    "count" JSONB NOT NULL DEFAULT '{"read": 0, "like": 0}',
    "pin" BOOLEAN NOT NULL DEFAULT false,
    "pin_order" INTEGER NOT NULL DEFAULT 0,
    "related_by_id" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ApiToken_name_key" ON "ApiToken"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PostTag_name_key" ON "PostTag"("name");

-- CreateIndex
CREATE INDEX "Post_slug_idx" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_created_at_idx" ON "Post"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_categoryId_key" ON "Post"("slug", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "slugIndex" ON "Category"("slug");

-- AddForeignKey
ALTER TABLE "ApiToken" ADD CONSTRAINT "ApiToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuth" ADD CONSTRAINT "OAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostImage" ADD CONSTRAINT "PostImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_related_by_id_fkey" FOREIGN KEY ("related_by_id") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
