// GEN ALIXIR - Prisma Database Client
// Instance unique réutilisable du client Prisma

import { PrismaClient } from '@prisma/client';

// Singleton pattern pour éviter trop de connexions en développement
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
