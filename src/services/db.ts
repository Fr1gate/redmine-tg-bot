import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (prisma == null) {
    prisma = new PrismaClient();
  }

  return prisma;
}
