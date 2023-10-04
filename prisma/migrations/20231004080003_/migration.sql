-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL DEFAULT '',
    "nid" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "allow_comment" BOOLEAN NOT NULL DEFAULT true,
    "password" TEXT NOT NULL DEFAULT '',
    "public_at" TIMESTAMP(3),
    "mood" TEXT,
    "weather" TEXT,
    "coordinates" JSONB,
    "location" TEXT,
    "count" JSONB NOT NULL DEFAULT '{"read": 0, "like": 0}',
    "images" JSONB NOT NULL DEFAULT '[]',
    "meta" JSONB DEFAULT '{}',
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "topicId" TEXT,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteTopic" (
    "description" TEXT NOT NULL DEFAULT '',
    "introduce" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL DEFAULT '',
    "slug" VARCHAR(255) NOT NULL,
    "subtitle" VARCHAR(80) NOT NULL DEFAULT '',
    "text" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "allow_comment" BOOLEAN NOT NULL DEFAULT true,
    "count" JSONB NOT NULL DEFAULT '{"read": 0, "like": 0}',
    "images" JSONB NOT NULL DEFAULT '[]',
    "meta" JSONB DEFAULT '{}',
    "categoryId" TEXT,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Note_nid_key" ON "Note"("nid");

-- CreateIndex
CREATE INDEX "Note_created_at_idx" ON "Note"("created_at");

-- CreateIndex
CREATE INDEX "Note_nid_idx" ON "Note"("nid");

-- CreateIndex
CREATE UNIQUE INDEX "NoteTopic_name_key" ON "NoteTopic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NoteTopic_slug_key" ON "NoteTopic"("slug");

-- CreateIndex
CREATE INDEX "Page_slug_idx" ON "Page"("slug");

-- CreateIndex
CREATE INDEX "Page_created_at_idx" ON "Page"("created_at");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "NoteTopic"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
