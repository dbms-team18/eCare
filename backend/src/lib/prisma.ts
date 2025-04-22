// backend/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'], // 可選：開發時顯示 SQL 查詢
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
