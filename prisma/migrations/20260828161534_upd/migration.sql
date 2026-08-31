/*
  Warnings:

  - The values [Bluebeard's Bride,Heckin' Good Doggos,Stalwart '85] on the enum `GameSystem` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `slug` on the `permissions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to drop the column `role_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `roles_on_permissions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GameSystem_new" AS ENUM ('Dungeons & Dragons 5e', 'Pathfinder 2e', 'Daggerheart', 'Homebrew Game', 'Call of Cthulhu', 'Vampire: The Masquerade 5th Edition', 'Pathfinder 1e', 'Monster of the Week', 'Shadowdark RPG', 'Game Master Workshop', 'Cyberpunk Red', 'Dark Matter', 'Draw Steel', 'Dungeon Crawl Classics', 'Cosmere Roleplaying Game', 'Lancer', 'Star Wars RPG by Fantasy Flight Games', 'Legend in the Mist', 'Indie TTRPG', 'Mothership', 'Marvel Multiverse Role-Playing Game', 'Savage Worlds', 'Warhammer Fantasy Roleplay', 'Blades in the Dark', 'Delta Green', 'Dungeons & Dragons 3/3.5e', 'Fallout: The Roleplaying Game', 'Star Wars 5e', 'Alien: The Roleplaying Game', 'Starfinder', 'Advanced Dungeons & Dragons 1e', 'Dragonbane', 'Fabula Ultima', 'Thirsty Sword Lesbians', 'World of Darkness', 'Seminar', 'Candela Obscura', 'Masks: A New Generation', 'Old-School Essentials', 'Mage the Ascension 20th Anniversary', 'Cypher System', 'Discworld', 'Avatar Legends: The RPG', 'Starfinder 2e', 'Vampire: The Masquerade 20th Anniversary Edition', 'D6 System', 'Pirate Borg', 'Level Up Advanced 5th Edition', 'Shadowrun', 'Fate Core System', 'Pokemon Tabletop United', 'Dungeons & Dragons 0e', 'Kids on Bikes', 'Dungeons & Dragons B/X', 'Star Trek Adventures', 'Traveller', 'Werewolf: The Apocalypse 5th Edition', 'Chronicles of Darkness', 'Werewolf: The Apocalypse 20th Anniversary Edition', 'City of Mist', 'Warhammer 40,000 Imperium Maledictum', 'Hunter: The Reckoning', 'Mutants and Masterminds (3e)', 'Alice is Missing', 'FATE', 'MonsterHearts 2', 'Outgunned', 'The One Ring 2e', 'Vaesen', 'GURPS', 'Star Trek Adventures - Second Edition', 'Advanced Dungeons & Dragons 2e', 'Dune: Adventures in the Imperium', 'Ten Candles', 'Kids on Brooms', 'Mythic Bastionland', 'Warhammer 40,000 Roleplay', 'Tales From the Loop', 'D20 Modern', 'Mass Effect 5e', 'Power Rangers Roleplaying Game', 'Exalted 3rd Edition', 'Fate Accelerated', 'Pulp Cthulhu', 'Tales of the Valiant', 'Transformers Roleplaying Game', 'Deadlands', 'Legend of the Five Rings 5th Edition', 'Mörk Borg', 'Playtest', 'Playtest Game', 'Warhammer 40,000 Wrath & Glory', 'Dragon Age', 'Fantasy AGE RPG', 'Grimwild', 'Into the Odd', 'Never Stop Blowing Up', ':Otherscape', 'Pokemon: The Roleplaying Game', '7th Sea', 'Dungeon World', 'Pendragon 6th Edition', 'd20 OGL', 'Deathwatch', 'Dungeons && Dragons 4e', 'Forbidden Lands', 'Good Society', 'KULT', 'Storypath', 'The Land Roleplaying System', 'The Lord of the Rings™ Roleplaying 5e', 'The Wildsea', 'BattleTech RPG', 'Brindlewood Bay', 'Dark Heresy 2e', 'DC20', 'Old Gods of Appalachia', 'Palladium', 'Pokemon Tabletop Adventures 3', 'RuneQuest: Roleplaying in Glorantha', 'Stars Without Numbers (Revised)', 'Twilight 2000', 'Blade Runner: The Roleplaying Game', 'Changeling: The Lost Second Edition', 'Conan: Adventures in an Age Undreamed Of', 'Curseborne', 'CY_BORG', 'For The Queen', 'Mage: The Awakening 2nd Edition', 'Odyssey of the Dragonlords', 'Scion 2e', 'Star Wars: Saga Edition', 'Symbaroum', 'The Between', 'Troika!', 'Vampire: The Requiem 2nd Edition', 'Achtung! Cthulhu 2d20', 'Apocalypse World 2e', 'Black Crusade', 'Cairn', 'Dungeons & Dragons 2e', 'Girl by Moonlight', 'Household', 'Mistborn Adventure Game', 'One Shot RPG System', 'Paranoia', 'The Witch is Dead', 'Urban Shadows 1e', 'Age of Sigmar Soulbound', 'Changeling: The Dreaming 20th Anniversary Edition', 'Deadlands Classic: 20th Anniversary Edition', 'Earthdawn', 'Epitaph', 'Glitter Hearts', 'Heart: The City Beneath RPG', 'Lasers & Feelings', 'Mausritter', 'Rifts', 'Roll for Shoes', 'Scum and Villainy', 'Spire: The City Must Fall RPG', 'Trophy Dark', 'Urban Shadows 2e', 'A Song of Ice and Fire RPG', 'Burn Bryte', 'Coyote & Crow', 'Cyberpunk 2020', 'DARK SOULS: The Roleplaying Game', 'Demon: The Fallen', 'Doctor Who RPG', 'Fablecraft', 'Genesys', 'Ghostbusters RPG', 'Godbound', 'HERO System', 'Honey Heist', 'King Arthur Pendragon RPG', 'Mutant: Year Zero', 'My Little Pony Roleplaying Game', 'Pathways To Adventure', 'Perils & Princesses', 'Polymorph', 'Public Access', 'Stargate SG-1 RPG', 'The Walking Dead Universe Roleplaying Game', 'Vampire: The Masquerade Revised Edition', 'Wanderhome', 'Aberrant', 'Band of Blades', 'BASIC Fantasy', 'BREAK!!', 'Castles & Crusades', 'Dark Heresy 1e', 'Death in Space', 'DUMP Quest', 'Dungeons & Dragons 1e', 'EAT THE REICH', 'EZD6', 'Free Kriegsspiel Revolution', 'Hackmaster', 'Hunter: The Vigil', 'Lancer Battlegroup', 'Legend of the Five Rings 4th Edition', 'Mark of the Odd', 'Marvel Super-Heroes FASERIP', 'Modern AGE RPG', 'Moonlight on Roseville Beach', 'Mutant Crawl Classics', 'Numenera', 'Risus: The Anything RPG', 'Rivers of London', 'Rogue Trader', 'Root: The Roleplaying Game', 'Ryuutama', 'Scarred Lands', 'Scion 1e', 'Shadow of the Demon Lord', 'Star Wars D6', 'Steel Hearts', 'Stewpot', 'The Expanse RPG', 'The Witcher TTRPG', 'Torg Eternity', 'Trinity Continuum', 'Warhammer Age of Sigmar Soulbound', 'Wild Talents', 'Worlds without Number', '13th Age', 'Absurdia', 'Aces & Eights Reloaded', 'Adventurer Conqueror King', 'Adventures in Middle-earth', 'Adventure Skeletons', 'A Familiar Problem', 'Afterlife: Wandering Souls', 'Age of Adventure', 'All Flesh Must Be Eaten', 'Ars Magica Fifth Edition', 'Ashes Without Number', 'Beam Saber', 'Birthright', 'Brave Zenith', 'CAIN', 'Capers', 'Chrome', 'Conan', 'Coriolis – The Third Horizon', 'Dead of Night', 'DIE RPG', 'Eldritch Automata', 'Electric Bastionland', 'Everyday Heroes', 'Exalted 2nd Edition', 'Exalted Essence', 'Fiasco', 'Fudge', 'Gumshoe', 'ICRPG Index Card RPG', 'Inevitable', 'In Nomine', 'Interstitial: Our Hearts Intertwined', 'Ironsworn', 'Ironsworn: Starforged', 'Knave', 'Lady Blackbird', 'Land of Eem', 'LARP', 'Legend of the Five Rings First Edition', 'Only War RPG', 'Orbital Blues', 'Rapscallion', 'Rolemaster', 'Runarcana', 'Sentinel Comics', 'Serenity RPG', 'Slugblaster', 'SOJOURN', 'Teatime Adventures', 'Teens in Space', 'The Burning Wheel', 'The Dresden Files RPG', 'The Mecha Hack', 'The Quiet Year', 'The Silt Verses', 'The Ultimate Micro-RPG Book', 'They Came From', 'This Discord Has Ghosts in It', 'Tiny Supers', 'Toon Roleplaying Game', 'Torg', 'Trail of Cthulhu', 'Triangle Agency', 'Tunnels & Trolls', 'Unknown Armies 3e', 'Valor: the Heroic Roleplay System', 'Vampire: The Dark Ages', 'Vampire: The Masquerade (2nd Edition)', 'Warhammer: the Old World Roleplaying Game', 'Warlock!', 'Welcome to Dolmenwood', 'Werewolf the Forsaken 2e', 'World Wide Wrestling 2e', 'Wraith: The Oblivion 20th Anniversary Edition', 'Xcrawl Classics', 'Zweihander', '4d6', 'ABSOLUTE POWER', 'Age of Vikings', 'Agon', 'Amber Diceless', 'Anima Beyond Fantasy', 'Anime e Sangue', 'Antagonist', 'Apocalypse Keys', 'Arkham Horror', 'Ascendant', 'Babes in the Woods', 'Basic Roleplaying', 'Better Angels', 'Between Clouds', 'Big Eyes, Small Mouth', 'Blood, Sweat & Steel', 'Boot Hill', 'Brinkwood: The Blood of Tyrants', 'Bunkers & Badasses', 'Bunnies & Burrows', 'Caltrop Core', 'Capes, Cowls and Villains Foul', 'Carbon 2185', 'Castle Falkenstein', 'Changeling: The Lost First Edition', 'Cogent Roleplay', 'Cortex RPG', 'Coven & Crucible', 'DC Heroes Roleplaying Game', 'Deathmatch Island', 'Definitely Wizards', 'Demon Gate', 'Dishonored', 'Dresden Files Accelerated Edition', 'Dungeon! Board Game', 'Eldritch RPG', 'Elthos RPG', 'Empire of the Petal Throne', 'Epyllion', 'Esper Genesis', 'Fading Suns', 'Fate of Cthulhu', 'Fathomless Gears', 'Fear Itself', 'Feng Shui 2', 'Final Fantasy RPG 4th Edition', 'FIST', 'Frontier Scum', 'FUNdamental RPG', 'G.I. JOE Roleplaying Game', 'Gloomhaven', 'Goblin With A Fat Ass', 'Golden Sky Stories', 'Harnmaster', 'Heroes & Hardships', 'HeroQuest', 'High Magic Lowlives', 'Hit the Streets: Defend the Block', 'Holler', 'ICONS Superpowered Roleplaying', 'Impulse Drive', 'Infinity', 'Ironclaw', 'Knave 2e', 'Kobolds Ate My Baby!', 'Liminal', 'Log Horizon', 'Low Fantasy Gaming', 'LUMEN', 'Mage: The Awakening 1e', 'Marvel Heroic Roleplaying', 'Memento Mori', 'Metamorphosis Alpha', 'Microscope', 'Middle-earth Role Playing - MERP', 'Monad Echo', 'Monsters and Other Childish Things', 'MOONGRAVE', 'Mutants & Masterminds', 'Nemesis', 'Never Going Home', 'Nobilis: the Game of Sovereign Powers (2002 Edition)', 'Outcast Silver Raiders', 'Paleomythic', 'Passing', 'Pequeños Detectives de Monstruos', 'Perfect Draw!', 'Phantasy Star Tabletop RPG', 'Point System Gaming', 'Polaris', 'Promethean: The Created 2nd Edition', 'Punk Apocalyptic', 'Quest', 'Realms of Pugmire', 'Reign', 'Righteous Blood, Ruthless Blades', 'S5E: Superheroic Roleplaying', 'Salvage Union', 'Sensōji TTRPG', 'Shadow of the Weird Wizard', 'SLAYERS', 'Spectaculars', 'Spindlewheel', 'Star Frontiers', 'Talislanta', 'Teenagers from Outerspace', 'TEETH', 'The Beast', 'The Darkest House', 'The Dark Eye', 'The Dee Sanction', 'The Electric State Roleplaying Game', 'The Fifth Season', 'The Grimoire of Heart', 'The One Ring 1e', 'The Sprawl', 'The Spy Game', 'They Came from Beyond the Grave!', 'Things from the Flood', 'Through The Breach', 'TimeWatch', 'Tiny Dungeon', 'Tiny Gods', 'tremulus', 'Trivia', 'Ultraviolet Grasslands', 'Unbelievably Simple Role-playing', 'Uncharted Worlds', 'Vagabond', 'Vaults of Vaarn', 'Weird Frontiers', 'Werewolf the Forsaken', 'Wicked Ones', 'Xas Irkalla', 'Z-LAND', 'Bluebeard''s Bride', 'Heckin'' Good Doggos', 'Stalwart ''85');
ALTER TABLE "events" ALTER COLUMN "gameSystem" TYPE "GameSystem_new" USING ("gameSystem"::text::"GameSystem_new");
ALTER TYPE "GameSystem" RENAME TO "GameSystem_old";
ALTER TYPE "GameSystem_new" RENAME TO "GameSystem";
DROP TYPE "public"."GameSystem_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "roles_on_permissions" DROP CONSTRAINT "roles_on_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "roles_on_permissions" DROP CONSTRAINT "roles_on_permissions_role_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- DropIndex
DROP INDEX "roles_name_key";

-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(150);

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "description" TEXT,
ADD COLUMN     "slug" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role_id";

-- DropTable
DROP TABLE "roles_on_permissions";

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoleToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "roles_slug_key" ON "roles"("slug");

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
