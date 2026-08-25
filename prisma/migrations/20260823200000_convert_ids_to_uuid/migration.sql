-- Destructive migration: converts all integer primary/foreign keys to UUID strings.
-- Existing rows are truncated before type conversion; re-run seed after applying.

-- Drop foreign keys
ALTER TABLE "SupportMessage" DROP CONSTRAINT IF EXISTS "SupportMessage_ticketId_fkey";
ALTER TABLE "SupportTicket" DROP CONSTRAINT IF EXISTS "SupportTicket_userId_fkey";
ALTER TABLE "user_schedules" DROP CONSTRAINT IF EXISTS "user_schedules_user_id_fkey";
ALTER TABLE "password_reset_tokens" DROP CONSTRAINT IF EXISTS "password_reset_tokens_userId_fkey";
ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_user_id_fkey";
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_user_id_fkey";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_role_id_fkey";
ALTER TABLE "roles_on_permissions" DROP CONSTRAINT IF EXISTS "roles_on_permissions_role_id_fkey";
ALTER TABLE "roles_on_permissions" DROP CONSTRAINT IF EXISTS "roles_on_permissions_permission_id_fkey";

TRUNCATE TABLE "SupportMessage", "SupportTicket", "user_schedules", "password_reset_tokens", "verification_codes", "roles_on_permissions", "sessions", "accounts", "users", "roles", "permissions" RESTART IDENTITY CASCADE;

-- users
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE IF EXISTS "users_id_seq";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_pkey";
ALTER TABLE "users" ALTER COLUMN "id" TYPE TEXT USING gen_random_uuid()::text;
ALTER TABLE "users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
ALTER TABLE "users" ALTER COLUMN "role_id" TYPE TEXT USING gen_random_uuid()::text;

-- roles
ALTER TABLE "roles" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE IF EXISTS "roles_id_seq";
ALTER TABLE "roles" DROP CONSTRAINT IF EXISTS "roles_pkey";
ALTER TABLE "roles" ALTER COLUMN "id" TYPE TEXT USING gen_random_uuid()::text;
ALTER TABLE "roles" ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");

-- permissions
ALTER TABLE "permissions" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE IF EXISTS "permissions_id_seq";
ALTER TABLE "permissions" DROP CONSTRAINT IF EXISTS "permissions_pkey";
ALTER TABLE "permissions" ALTER COLUMN "id" TYPE TEXT USING gen_random_uuid()::text;
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");

-- roles_on_permissions
ALTER TABLE "roles_on_permissions" DROP CONSTRAINT IF EXISTS "roles_on_permissions_pkey";
ALTER TABLE "roles_on_permissions" ALTER COLUMN "role_id" TYPE TEXT USING gen_random_uuid()::text;
ALTER TABLE "roles_on_permissions" ALTER COLUMN "permission_id" TYPE TEXT USING gen_random_uuid()::text;
ALTER TABLE "roles_on_permissions" ADD CONSTRAINT "roles_on_permissions_pkey" PRIMARY KEY ("role_id", "permission_id");

-- accounts
ALTER TABLE "accounts" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE IF EXISTS "accounts_id_seq";
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_pkey";
ALTER TABLE "accounts" ALTER COLUMN "id" TYPE TEXT USING gen_random_uuid()::text;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");
ALTER TABLE "accounts" ALTER COLUMN "user_id" TYPE TEXT USING gen_random_uuid()::text;

-- sessions
ALTER TABLE "sessions" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE IF EXISTS "sessions_id_seq";
ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_pkey";
ALTER TABLE "sessions" ALTER COLUMN "id" TYPE TEXT USING gen_random_uuid()::text;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");
ALTER TABLE "sessions" ALTER COLUMN "user_id" TYPE TEXT USING gen_random_uuid()::text;

-- verification_codes
ALTER TABLE "verification_codes" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE IF EXISTS "verification_codes_id_seq";
ALTER TABLE "verification_codes" DROP CONSTRAINT IF EXISTS "verification_codes_pkey";
ALTER TABLE "verification_codes" ALTER COLUMN "id" TYPE TEXT USING gen_random_uuid()::text;
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id");

-- password_reset_tokens
ALTER TABLE "password_reset_tokens" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE IF EXISTS "password_reset_tokens_id_seq";
ALTER TABLE "password_reset_tokens" DROP CONSTRAINT IF EXISTS "password_reset_tokens_pkey";
ALTER TABLE "password_reset_tokens" ALTER COLUMN "id" TYPE TEXT USING gen_random_uuid()::text;
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id");
ALTER TABLE "password_reset_tokens" ALTER COLUMN "userId" TYPE TEXT USING gen_random_uuid()::text;

-- user_schedules
ALTER TABLE "user_schedules" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE IF EXISTS "user_schedules_id_seq";
ALTER TABLE "user_schedules" DROP CONSTRAINT IF EXISTS "user_schedules_pkey";
ALTER TABLE "user_schedules" ALTER COLUMN "id" TYPE TEXT USING gen_random_uuid()::text;
ALTER TABLE "user_schedules" ADD CONSTRAINT "user_schedules_pkey" PRIMARY KEY ("id");
ALTER TABLE "user_schedules" ALTER COLUMN "user_id" TYPE TEXT USING gen_random_uuid()::text;

-- Re-add foreign keys
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_schedules" ADD CONSTRAINT "user_schedules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "roles_on_permissions" ADD CONSTRAINT "roles_on_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "roles_on_permissions" ADD CONSTRAINT "roles_on_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
