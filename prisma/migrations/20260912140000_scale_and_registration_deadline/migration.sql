-- AlterTable: Add registrationDeadline
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "registrationDeadline" TIMESTAMP(3);

-- CreateIndex: Performance indexes for high-concurrency (2000+ students)
CREATE INDEX IF NOT EXISTS "Event_status_idx" ON "Event"("status");
CREATE INDEX IF NOT EXISTS "Event_category_idx" ON "Event"("category");
CREATE INDEX IF NOT EXISTS "Event_festId_idx" ON "Event"("festId");
CREATE INDEX IF NOT EXISTS "EventOrganizer_userId_idx" ON "EventOrganizer"("userId");
CREATE INDEX IF NOT EXISTS "EventRegistration_eventId_status_idx" ON "EventRegistration"("eventId", "status");
CREATE INDEX IF NOT EXISTS "EventRegistration_userId_idx" ON "EventRegistration"("userId");
CREATE INDEX IF NOT EXISTS "Attendance_eventId_idx" ON "Attendance"("eventId");
CREATE INDEX IF NOT EXISTS "Attendance_userId_idx" ON "Attendance"("userId");
