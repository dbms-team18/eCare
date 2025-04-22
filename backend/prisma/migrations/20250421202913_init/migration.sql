-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roleId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "height" REAL,
    "weight" REAL,
    "disease" TEXT,
    "allergies" TEXT
);

-- CreateTable
CREATE TABLE "VitalMeasurement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "vitalTypeId" INTEGER NOT NULL,
    "value" REAL NOT NULL,
    "notes" TEXT,
    "recordDate" DATETIME NOT NULL,
    "recordTime" DATETIME NOT NULL,
    "creatorId" INTEGER NOT NULL,
    CONSTRAINT "VitalMeasurement_vitalTypeId_fkey" FOREIGN KEY ("vitalTypeId") REFERENCES "VitalType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VitalMeasurement_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VitalType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "typeName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "upperBound" REAL NOT NULL,
    "lowerBound" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "alertType" TEXT NOT NULL,
    "alertMessage" TEXT NOT NULL,
    "alertTime" DATETIME NOT NULL,
    "vitalMeasurementId" INTEGER NOT NULL,
    CONSTRAINT "Alert_vitalMeasurementId_fkey" FOREIGN KEY ("vitalMeasurementId") REFERENCES "VitalMeasurement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Alert_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trigger" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vitalMeasurementId" INTEGER NOT NULL,
    "alertId" INTEGER NOT NULL,
    CONSTRAINT "Trigger_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trigger_vitalMeasurementId_fkey" FOREIGN KEY ("vitalMeasurementId") REFERENCES "VitalMeasurement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tracking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "patientId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    CONSTRAINT "Tracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tracking_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Own" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "patientId" INTEGER NOT NULL,
    CONSTRAINT "Own_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Own_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_Maintainer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_Maintainer_A_fkey" FOREIGN KEY ("A") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_Maintainer_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Patient_userId_idx" ON "Patient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Trigger_vitalMeasurementId_key" ON "Trigger"("vitalMeasurementId");

-- CreateIndex
CREATE UNIQUE INDEX "Trigger_alertId_key" ON "Trigger"("alertId");

-- CreateIndex
CREATE UNIQUE INDEX "Own_userId_patientId_key" ON "Own"("userId", "patientId");

-- CreateIndex
CREATE UNIQUE INDEX "_Maintainer_AB_unique" ON "_Maintainer"("A", "B");

-- CreateIndex
CREATE INDEX "_Maintainer_B_index" ON "_Maintainer"("B");
