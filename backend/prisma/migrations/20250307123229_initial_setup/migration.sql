-- CreateEnum
CREATE TYPE "StatusType" AS ENUM ('ACCEPTED', 'REJECTED', 'PENDING');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profilePic" TEXT,
    "online" BOOLEAN NOT NULL,
    "lastSeenOnline" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "byWhichUser" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "groupSize" INTEGER NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupAndUser" (
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "admin" BOOLEAN NOT NULL,

    CONSTRAINT "GroupAndUser_pkey" PRIMARY KEY ("userId","groupId")
);

-- CreateTable
CREATE TABLE "SeenBy" (
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,

    CONSTRAINT "SeenBy_pkey" PRIMARY KEY ("userId","chatId")
);

-- CreateTable
CREATE TABLE "GroupJoiningRequest" (
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "initiatorId" INTEGER NOT NULL,
    "status" "StatusType" NOT NULL,

    CONSTRAINT "GroupJoiningRequest_pkey" PRIMARY KEY ("userId","groupId")
);

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupAndUser" ADD CONSTRAINT "GroupAndUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupAndUser" ADD CONSTRAINT "GroupAndUser_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeenBy" ADD CONSTRAINT "SeenBy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeenBy" ADD CONSTRAINT "SeenBy_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupJoiningRequest" ADD CONSTRAINT "GroupJoiningRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupJoiningRequest" ADD CONSTRAINT "GroupJoiningRequest_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
