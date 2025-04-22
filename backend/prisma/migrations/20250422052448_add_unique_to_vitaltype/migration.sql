/*
  Warnings:

  - A unique constraint covering the columns `[typeName]` on the table `VitalType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "VitalType_typeName_key" ON "VitalType"("typeName");
