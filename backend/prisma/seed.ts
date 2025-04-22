
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10)

  // 1. upsert 使用者（避免 email 重複）
  const user = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      name: 'Alice',
      email: 'alice@example.com',
      password: hashedPassword,
      phone: '0912345678',
      role: 0,
      createdAt: new Date()
    }
  })

  // 2. upsert VitalType（血壓）
  const bpType = await prisma.vitalType.upsert({
    where: { typeName: 'Blood Pressure' },
    update: {},
    create: {
      typeName: 'Blood Pressure',
      unit: 'mmHg',
      upperBound: 140,
      lowerBound: 90
    }
  })

  // 3. upsert 病人（與使用者關聯）
  const existingPatient = await prisma.patient.findFirst({
    where: { userId: user.id }
  })

  const patient = existingPatient ?? await prisma.patient.create({
    data: {
      userId: user.id,
      height: 160,
      weight: 55,
      disease: 'Hypertension',
      allergies: 'Penicillin'
    }
  })

  // 4. 建立測量紀錄（不重複建）
  const existingMeasurement = await prisma.vitalMeasurement.findFirst({
    where: {
      patientId: patient.id,
      vitalTypeId: bpType.id,
      value: 135
    }
  })

  if (!existingMeasurement) {
    await prisma.vitalMeasurement.create({
      data: {
        patientId: patient.id,
        vitalTypeId: bpType.id,
        value: 135,
        notes: 'Morning reading',
        recordDate: new Date(),
        recordTime: new Date(),
        creatorId: user.id
      }
    })
  }

  console.log('✅ 資料初始化完成')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ 建立失敗:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
