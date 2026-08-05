-- CreateEnum
CREATE TYPE "CharacterStatus" AS ENUM ('ALIVE', 'DECEASED', 'MISSING', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('PARENT_OF', 'SIBLING_OF', 'MARRIED_TO', 'PARTNER_OF', 'MENTOR_OF', 'ENEMY_OF', 'FRIEND_OF', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "description" TEXT,
    "avatarUrl" TEXT,
    "status" "CharacterStatus" NOT NULL DEFAULT 'ALIVE',
    "statusNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookId" TEXT NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterRelation" (
    "id" TEXT NOT NULL,
    "type" "RelationType" NOT NULL,
    "note" TEXT,
    "bookId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mapImageUrl" TEXT,
    "xPercent" DOUBLE PRECISION,
    "yPercent" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookId" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookId" TEXT NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterAppearance" (
    "id" TEXT NOT NULL,
    "statusAtPoint" TEXT,
    "notes" TEXT,
    "chapterId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,

    CONSTRAINT "ChapterAppearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookId" TEXT NOT NULL,
    "ownerId" TEXT,
    "locationId" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookId" TEXT NOT NULL,
    "locationId" TEXT,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEventCharacter" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,

    CONSTRAINT "TimelineEventCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Book_ownerId_idx" ON "Book"("ownerId");

-- CreateIndex
CREATE INDEX "Character_bookId_idx" ON "Character"("bookId");

-- CreateIndex
CREATE INDEX "CharacterRelation_bookId_idx" ON "CharacterRelation"("bookId");

-- CreateIndex
CREATE INDEX "CharacterRelation_fromId_idx" ON "CharacterRelation"("fromId");

-- CreateIndex
CREATE INDEX "CharacterRelation_toId_idx" ON "CharacterRelation"("toId");

-- CreateIndex
CREATE INDEX "Location_bookId_idx" ON "Location"("bookId");

-- CreateIndex
CREATE INDEX "Chapter_bookId_idx" ON "Chapter"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_bookId_order_key" ON "Chapter"("bookId", "order");

-- CreateIndex
CREATE INDEX "ChapterAppearance_characterId_idx" ON "ChapterAppearance"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterAppearance_chapterId_characterId_key" ON "ChapterAppearance"("chapterId", "characterId");

-- CreateIndex
CREATE INDEX "Item_bookId_idx" ON "Item"("bookId");

-- CreateIndex
CREATE INDEX "TimelineEvent_bookId_idx" ON "TimelineEvent"("bookId");

-- CreateIndex
CREATE INDEX "TimelineEventCharacter_characterId_idx" ON "TimelineEventCharacter"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "TimelineEventCharacter_eventId_characterId_key" ON "TimelineEventCharacter"("eventId", "characterId");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterRelation" ADD CONSTRAINT "CharacterRelation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterRelation" ADD CONSTRAINT "CharacterRelation_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterRelation" ADD CONSTRAINT "CharacterRelation_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterAppearance" ADD CONSTRAINT "ChapterAppearance_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterAppearance" ADD CONSTRAINT "ChapterAppearance_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEventCharacter" ADD CONSTRAINT "TimelineEventCharacter_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TimelineEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEventCharacter" ADD CONSTRAINT "TimelineEventCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
