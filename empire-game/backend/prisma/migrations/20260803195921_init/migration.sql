-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Village" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ownerId" TEXT,
    "isCapital" BOOLEAN NOT NULL DEFAULT false,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "gold" REAL NOT NULL DEFAULT 0,
    "food" REAL NOT NULL DEFAULT 0,
    "wood" REAL NOT NULL DEFAULT 0,
    "lastTick" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isNpc" BOOLEAN NOT NULL DEFAULT false,
    "npcTier" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Village_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Player" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "villageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "workersAssigned" INTEGER NOT NULL DEFAULT 0,
    "upgradeEndsAt" DATETIME,
    "slotX" INTEGER NOT NULL,
    "slotY" INTEGER NOT NULL,
    CONSTRAINT "Building_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "villageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "trainingCount" INTEGER NOT NULL DEFAULT 0,
    "trainingEndsAt" DATETIME,
    CONSTRAINT "Unit_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BattleLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attackerId" TEXT NOT NULL,
    "attackerVillageId" TEXT NOT NULL,
    "defenderVillageId" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "lootGold" REAL NOT NULL DEFAULT 0,
    "lootFood" REAL NOT NULL DEFAULT 0,
    "lootWood" REAL NOT NULL DEFAULT 0,
    "xpGained" INTEGER NOT NULL DEFAULT 0,
    "conquered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BattleLog_attackerId_fkey" FOREIGN KEY ("attackerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_username_key" ON "Player"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");

-- CreateIndex
CREATE INDEX "Village_ownerId_idx" ON "Village"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Village_x_y_key" ON "Village"("x", "y");

-- CreateIndex
CREATE INDEX "Building_villageId_idx" ON "Building"("villageId");

-- CreateIndex
CREATE UNIQUE INDEX "Building_villageId_slotX_slotY_key" ON "Building"("villageId", "slotX", "slotY");

-- CreateIndex
CREATE INDEX "Unit_villageId_idx" ON "Unit"("villageId");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_villageId_type_key" ON "Unit"("villageId", "type");

-- CreateIndex
CREATE INDEX "BattleLog_attackerId_idx" ON "BattleLog"("attackerId");
