/*
  Warnings:

  - A unique constraint covering the columns `[key,scope]` on the table `ConfigKV` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ConfigKV_key_scope_key" ON "ConfigKV"("key", "scope");
