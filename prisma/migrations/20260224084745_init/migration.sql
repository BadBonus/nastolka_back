-- CreateEnum
CREATE TYPE "EAccProviders" AS ENUM ('EMAIL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "ESocLinks" AS ENUM ('VK', 'TELEGRAM', 'DISCORD', 'INSTAGRAM', 'X', 'REDDIT');

-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider" "EAccProviders" NOT NULL DEFAULT 'EMAIL',
    "provider_account_id" TEXT NOT NULL,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT,
    "nickname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "description" TEXT,
    "birthdate" TIMESTAMP(3),
    "slug" VARCHAR(256) NOT NULL,
    "avatar_url" TEXT,
    "sub" JSONB NOT NULL DEFAULT '{"events": [], "gamemasters": []}',
    "timezone" VARCHAR(100) DEFAULT 'UTC',
    "soclinks" JSONB,
    "gameHistory" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refresh_token_key" ON "sessions"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_slug_key" ON "users"("slug");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
