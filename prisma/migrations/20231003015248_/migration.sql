-- CreateTable
CREATE TABLE "ConfigKV" (
    "id" TEXT NOT NULL DEFAULT '',
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "scope" TEXT NOT NULL,

    CONSTRAINT "ConfigKV_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfigKV_key_key" ON "ConfigKV"("key");
