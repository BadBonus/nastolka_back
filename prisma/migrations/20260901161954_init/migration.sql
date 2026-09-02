-- CreateEnum
CREATE TYPE "EAccProviders" AS ENUM ('EMAIL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PREPARE', 'ACTIVE', 'FINISHED', 'CANCELED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED', 'WAITLIST', 'CANCELED');

-- CreateEnum
CREATE TYPE "EventFormat" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('ONE_SHOT', 'CAMPAIGN', 'SESSION_ZERO');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('EUR', 'USD', 'RUB', 'BYN');

-- CreateEnum
CREATE TYPE "GameGenres" AS ENUM ('FANTASY', 'HORROR', 'SCIFI', 'POSTAPOCALYPTIC', 'MODERN', 'HISTORICAL', 'CYBERPUNK');

-- CreateEnum
CREATE TYPE "GameSystem" AS ENUM ('Dungeons & Dragons 5e', 'Pathfinder 2e', 'Daggerheart', 'Homebrew Game', 'Call of Cthulhu', 'Vampire: The Masquerade 5th Edition', 'Pathfinder 1e', 'Monster of the Week', 'Shadowdark RPG', 'Game Master Workshop', 'Cyberpunk Red', 'Dark Matter', 'Draw Steel', 'Dungeon Crawl Classics', 'Cosmere Roleplaying Game', 'Lancer', 'Star Wars RPG by Fantasy Flight Games', 'Legend in the Mist', 'Indie TTRPG', 'Mothership', 'Marvel Multiverse Role-Playing Game', 'Savage Worlds', 'Warhammer Fantasy Roleplay', 'Blades in the Dark', 'Delta Green', 'Dungeons & Dragons 3/3.5e', 'Fallout: The Roleplaying Game', 'Star Wars 5e', 'Alien: The Roleplaying Game', 'Starfinder', 'Advanced Dungeons & Dragons 1e', 'Dragonbane', 'Fabula Ultima', 'Thirsty Sword Lesbians', 'World of Darkness', 'Seminar', 'Candela Obscura', 'Masks: A New Generation', 'Old-School Essentials', 'Mage the Ascension 20th Anniversary', 'Cypher System', 'Discworld', 'Avatar Legends: The RPG', 'Starfinder 2e', 'Vampire: The Masquerade 20th Anniversary Edition', 'D6 System', 'Pirate Borg', 'Level Up Advanced 5th Edition', 'Shadowrun', 'Fate Core System', 'Pokemon Tabletop United', 'Dungeons & Dragons 0e', 'Kids on Bikes', 'Dungeons & Dragons B/X', 'Star Trek Adventures', 'Traveller', 'Werewolf: The Apocalypse 5th Edition', 'Chronicles of Darkness', 'Werewolf: The Apocalypse 20th Anniversary Edition', 'City of Mist', 'Warhammer 40,000 Imperium Maledictum', 'Hunter: The Reckoning', 'Mutants and Masterminds (3e)', 'Alice is Missing', 'FATE', 'MonsterHearts 2', 'Outgunned', 'The One Ring 2e', 'Vaesen', 'GURPS', 'Star Trek Adventures - Second Edition', 'Advanced Dungeons & Dragons 2e', 'Dune: Adventures in the Imperium', 'Ten Candles', 'Kids on Brooms', 'Mythic Bastionland', 'Warhammer 40,000 Roleplay', 'Tales From the Loop', 'D20 Modern', 'Mass Effect 5e', 'Power Rangers Roleplaying Game', 'Exalted 3rd Edition', 'Fate Accelerated', 'Pulp Cthulhu', 'Tales of the Valiant', 'Transformers Roleplaying Game', 'Deadlands', 'Legend of the Five Rings 5th Edition', 'Mörk Borg', 'Playtest', 'Playtest Game', 'Warhammer 40,000 Wrath & Glory', 'Dragon Age', 'Fantasy AGE RPG', 'Grimwild', 'Into the Odd', 'Never Stop Blowing Up', ':Otherscape', 'Pokemon: The Roleplaying Game', '7th Sea', 'Dungeon World', 'Pendragon 6th Edition', 'd20 OGL', 'Deathwatch', 'Dungeons && Dragons 4e', 'Forbidden Lands', 'Good Society', 'KULT', 'Storypath', 'The Land Roleplaying System', 'The Lord of the Rings™ Roleplaying 5e', 'The Wildsea', 'BattleTech RPG', 'Brindlewood Bay', 'Dark Heresy 2e', 'DC20', 'Old Gods of Appalachia', 'Palladium', 'Pokemon Tabletop Adventures 3', 'RuneQuest: Roleplaying in Glorantha', 'Stars Without Numbers (Revised)', 'Twilight 2000', 'Blade Runner: The Roleplaying Game', 'Changeling: The Lost Second Edition', 'Conan: Adventures in an Age Undreamed Of', 'Curseborne', 'CY_BORG', 'For The Queen', 'Mage: The Awakening 2nd Edition', 'Odyssey of the Dragonlords', 'Scion 2e', 'Star Wars: Saga Edition', 'Symbaroum', 'The Between', 'Troika!', 'Vampire: The Requiem 2nd Edition', 'Achtung! Cthulhu 2d20', 'Apocalypse World 2e', 'Black Crusade', 'Cairn', 'Dungeons & Dragons 2e', 'Girl by Moonlight', 'Household', 'Mistborn Adventure Game', 'One Shot RPG System', 'Paranoia', 'The Witch is Dead', 'Urban Shadows 1e', 'Age of Sigmar Soulbound', 'Changeling: The Dreaming 20th Anniversary Edition', 'Deadlands Classic: 20th Anniversary Edition', 'Earthdawn', 'Epitaph', 'Glitter Hearts', 'Heart: The City Beneath RPG', 'Lasers & Feelings', 'Mausritter', 'Rifts', 'Roll for Shoes', 'Scum and Villainy', 'Spire: The City Must Fall RPG', 'Trophy Dark', 'Urban Shadows 2e', 'A Song of Ice and Fire RPG', 'Burn Bryte', 'Coyote & Crow', 'Cyberpunk 2020', 'DARK SOULS: The Roleplaying Game', 'Demon: The Fallen', 'Doctor Who RPG', 'Fablecraft', 'Genesys', 'Ghostbusters RPG', 'Godbound', 'HERO System', 'Honey Heist', 'King Arthur Pendragon RPG', 'Mutant: Year Zero', 'My Little Pony Roleplaying Game', 'Pathways To Adventure', 'Perils & Princesses', 'Polymorph', 'Public Access', 'Stargate SG-1 RPG', 'The Walking Dead Universe Roleplaying Game', 'Vampire: The Masquerade Revised Edition', 'Wanderhome', 'Aberrant', 'Band of Blades', 'BASIC Fantasy', 'BREAK!!', 'Castles & Crusades', 'Dark Heresy 1e', 'Death in Space', 'DUMP Quest', 'Dungeons & Dragons 1e', 'EAT THE REICH', 'EZD6', 'Free Kriegsspiel Revolution', 'Hackmaster', 'Hunter: The Vigil', 'Lancer Battlegroup', 'Legend of the Five Rings 4th Edition', 'Mark of the Odd', 'Marvel Super-Heroes FASERIP', 'Modern AGE RPG', 'Moonlight on Roseville Beach', 'Mutant Crawl Classics', 'Numenera', 'Risus: The Anything RPG', 'Rivers of London', 'Rogue Trader', 'Root: The Roleplaying Game', 'Ryuutama', 'Scarred Lands', 'Scion 1e', 'Shadow of the Demon Lord', 'Star Wars D6', 'Steel Hearts', 'Stewpot', 'The Expanse RPG', 'The Witcher TTRPG', 'Torg Eternity', 'Trinity Continuum', 'Warhammer Age of Sigmar Soulbound', 'Wild Talents', 'Worlds without Number', '13th Age', 'Absurdia', 'Aces & Eights Reloaded', 'Adventurer Conqueror King', 'Adventures in Middle-earth', 'Adventure Skeletons', 'A Familiar Problem', 'Afterlife: Wandering Souls', 'Age of Adventure', 'All Flesh Must Be Eaten', 'Ars Magica Fifth Edition', 'Ashes Without Number', 'Beam Saber', 'Birthright', 'Brave Zenith', 'CAIN', 'Capers', 'Chrome', 'Conan', 'Coriolis – The Third Horizon', 'Dead of Night', 'DIE RPG', 'Eldritch Automata', 'Electric Bastionland', 'Everyday Heroes', 'Exalted 2nd Edition', 'Exalted Essence', 'Fiasco', 'Fudge', 'Gumshoe', 'ICRPG Index Card RPG', 'Inevitable', 'In Nomine', 'Interstitial: Our Hearts Intertwined', 'Ironsworn', 'Ironsworn: Starforged', 'Knave', 'Lady Blackbird', 'Land of Eem', 'LARP', 'Legend of the Five Rings First Edition', 'Only War RPG', 'Orbital Blues', 'Rapscallion', 'Rolemaster', 'Runarcana', 'Sentinel Comics', 'Serenity RPG', 'Slugblaster', 'SOJOURN', 'Teatime Adventures', 'Teens in Space', 'The Burning Wheel', 'The Dresden Files RPG', 'The Mecha Hack', 'The Quiet Year', 'The Silt Verses', 'The Ultimate Micro-RPG Book', 'They Came From', 'This Discord Has Ghosts in It', 'Tiny Supers', 'Toon Roleplaying Game', 'Torg', 'Trail of Cthulhu', 'Triangle Agency', 'Tunnels & Trolls', 'Unknown Armies 3e', 'Valor: the Heroic Roleplay System', 'Vampire: The Dark Ages', 'Vampire: The Masquerade (2nd Edition)', 'Warhammer: the Old World Roleplaying Game', 'Warlock!', 'Welcome to Dolmenwood', 'Werewolf the Forsaken 2e', 'World Wide Wrestling 2e', 'Wraith: The Oblivion 20th Anniversary Edition', 'Xcrawl Classics', 'Zweihander', '4d6', 'ABSOLUTE POWER', 'Age of Vikings', 'Agon', 'Amber Diceless', 'Anima Beyond Fantasy', 'Anime e Sangue', 'Antagonist', 'Apocalypse Keys', 'Arkham Horror', 'Ascendant', 'Babes in the Woods', 'Basic Roleplaying', 'Better Angels', 'Between Clouds', 'Big Eyes, Small Mouth', 'Blood, Sweat & Steel', 'Boot Hill', 'Brinkwood: The Blood of Tyrants', 'Bunkers & Badasses', 'Bunnies & Burrows', 'Caltrop Core', 'Capes, Cowls and Villains Foul', 'Carbon 2185', 'Castle Falkenstein', 'Changeling: The Lost First Edition', 'Cogent Roleplay', 'Cortex RPG', 'Coven & Crucible', 'DC Heroes Roleplaying Game', 'Deathmatch Island', 'Definitely Wizards', 'Demon Gate', 'Dishonored', 'Dresden Files Accelerated Edition', 'Dungeon! Board Game', 'Eldritch RPG', 'Elthos RPG', 'Empire of the Petal Throne', 'Epyllion', 'Esper Genesis', 'Fading Suns', 'Fate of Cthulhu', 'Fathomless Gears', 'Fear Itself', 'Feng Shui 2', 'Final Fantasy RPG 4th Edition', 'FIST', 'Frontier Scum', 'FUNdamental RPG', 'G.I. JOE Roleplaying Game', 'Gloomhaven', 'Goblin With A Fat Ass', 'Golden Sky Stories', 'Harnmaster', 'Heroes & Hardships', 'HeroQuest', 'High Magic Lowlives', 'Hit the Streets: Defend the Block', 'Holler', 'ICONS Superpowered Roleplaying', 'Impulse Drive', 'Infinity', 'Ironclaw', 'Knave 2e', 'Kobolds Ate My Baby!', 'Liminal', 'Log Horizon', 'Low Fantasy Gaming', 'LUMEN', 'Mage: The Awakening 1e', 'Marvel Heroic Roleplaying', 'Memento Mori', 'Metamorphosis Alpha', 'Microscope', 'Middle-earth Role Playing - MERP', 'Monad Echo', 'Monsters and Other Childish Things', 'MOONGRAVE', 'Mutants & Masterminds', 'Nemesis', 'Never Going Home', 'Nobilis: the Game of Sovereign Powers (2002 Edition)', 'Outcast Silver Raiders', 'Paleomythic', 'Passing', 'Pequeños Detectives de Monstruos', 'Perfect Draw!', 'Phantasy Star Tabletop RPG', 'Point System Gaming', 'Polaris', 'Promethean: The Created 2nd Edition', 'Punk Apocalyptic', 'Quest', 'Realms of Pugmire', 'Reign', 'Righteous Blood, Ruthless Blades', 'S5E: Superheroic Roleplaying', 'Salvage Union', 'Sensōji TTRPG', 'Shadow of the Weird Wizard', 'SLAYERS', 'Spectaculars', 'Spindlewheel', 'Star Frontiers', 'Talislanta', 'Teenagers from Outerspace', 'TEETH', 'The Beast', 'The Darkest House', 'The Dark Eye', 'The Dee Sanction', 'The Electric State Roleplaying Game', 'The Fifth Season', 'The Grimoire of Heart', 'The One Ring 1e', 'The Sprawl', 'The Spy Game', 'They Came from Beyond the Grave!', 'Things from the Flood', 'Through The Breach', 'TimeWatch', 'Tiny Dungeon', 'Tiny Gods', 'tremulus', 'Trivia', 'Ultraviolet Grasslands', 'Unbelievably Simple Role-playing', 'Uncharted Worlds', 'Vagabond', 'Vaults of Vaarn', 'Weird Frontiers', 'Werewolf the Forsaken', 'Wicked Ones', 'Xas Irkalla', 'Z-LAND');

-- CreateEnum
CREATE TYPE "GamePlatform" AS ENUM ('Above VTT', 'Alchemy', 'Arkenforge', 'Bag of Mapping', 'D&D Beyond', 'D&D Beyond Maps', 'Demiplane', 'Discord', 'Fantasy Grounds', 'Foundry VTT', 'Google Meet', 'MapTool', 'Microsoft Teams', 'One More Multiverse', 'Owlbear Rodeo', 'Physical Battlemap', 'Quest Portal', 'Role', 'Roleplay.tv', 'Roll20', 'RPG Sessions', 'Shard Tabletop', 'Sigil', 'Tableplop', 'Tabletop Simulator', 'Tale Spire', 'Tarrasque.io', 'Text/Play by Post', 'Zoom');

-- CreateEnum
CREATE TYPE "KindOfRate" AS ENUM ('CREATIVITY', 'STORYTELLING', 'WIKIPEDIA_RULES', 'THEATRICALISE');

-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "ESocLinks" AS ENUM ('VK', 'TELEGRAM', 'DISCORD', 'INSTAGRAM', 'X', 'REDDIT');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "EAccProviders" NOT NULL DEFAULT 'EMAIL',
    "provider_account_id" TEXT NOT NULL,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(256) NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "add_info" TEXT,
    "preview_url" TEXT,
    "min_users" INTEGER NOT NULL DEFAULT 1,
    "max_users" INTEGER,
    "is_beginner_friendly" BOOLEAN NOT NULL DEFAULT true,
    "age_limit" INTEGER,
    "auto_approve" BOOLEAN NOT NULL DEFAULT false,
    "cost_value" INTEGER,
    "cost_currency" "Currency",
    "format" "EventFormat" NOT NULL,
    "session_type" "SessionType" NOT NULL,
    "address" TEXT,
    "map_url" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'PREPARE',
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "canceled_at" TIMESTAMP(3),
    "cancel_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "genres" "GameGenres"[],
    "platforms" "GamePlatform"[],
    "game_system" "GameSystem" NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_requests" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "is_attended" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orgs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "slug" VARCHAR(256) NOT NULL,
    "nickname" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "avatar_url" TEXT,
    "timezone" VARCHAR(100) DEFAULT 'UTC',
    "soclinks" JSONB,
    "gameHistory" JSONB NOT NULL DEFAULT '[]',
    "email" TEXT NOT NULL,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "orgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_reviews" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "comment" TEXT,
    "rates" "KindOfRate"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportMessage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "full_name" TEXT,
    "nickname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "description" TEXT,
    "birthdate" TIMESTAMP(3),
    "slug" VARCHAR(256) NOT NULL,
    "avatar_url" TEXT,
    "timezone" VARCHAR(100) DEFAULT 'UTC',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "id" TEXT NOT NULL,
    "sub" JSONB NOT NULL DEFAULT '{"events": [], "gamemasters": []}',
    "soclinks" JSONB,
    "gameHistory" JSONB NOT NULL DEFAULT '[]',
    "is_banned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_schedules" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" INTEGER NOT NULL,
    "end_time" INTEGER NOT NULL,

    CONSTRAINT "user_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_sent_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoleToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_user_id_key" ON "accounts"("provider", "provider_account_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_slug_idx" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_status_starts_at_idx" ON "events"("status", "starts_at");

-- CreateIndex
CREATE INDEX "event_requests_event_id_status_idx" ON "event_requests"("event_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "event_requests_event_id_user_id_key" ON "event_requests"("event_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "orgs_user_id_key" ON "orgs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "orgs_slug_key" ON "orgs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "orgs_email_key" ON "orgs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "event_reviews_event_id_user_id_key" ON "event_reviews"("event_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_slug_key" ON "roles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_slug_key" ON "permissions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refresh_token_key" ON "sessions"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_slug_key" ON "users"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "verification_codes_email_key" ON "verification_codes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_userId_key" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_requests" ADD CONSTRAINT "event_requests_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_requests" ADD CONSTRAINT "event_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orgs" ADD CONSTRAINT "orgs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_reviews" ADD CONSTRAINT "event_reviews_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_reviews" ADD CONSTRAINT "event_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_reviews" ADD CONSTRAINT "event_reviews_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_schedules" ADD CONSTRAINT "user_schedules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
