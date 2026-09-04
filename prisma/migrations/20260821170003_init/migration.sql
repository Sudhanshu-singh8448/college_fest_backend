-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "collegeId" TEXT,
    "branchId" TEXT,
    "batchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "College" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrationNumberFormat" (
    "id" TEXT NOT NULL,
    "regex" TEXT NOT NULL,
    "formatMap" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistrationNumberFormat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "autoAssignRule" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("groupId","userId")
);

-- CreateTable
CREATE TABLE "Fest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "guidelines" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FestRegistration" (
    "id" TEXT NOT NULL,
    "festId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FestRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "festId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "qrSecret" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "festId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,
    "maxParticipants" INTEGER,
    "minTeamSize" INTEGER NOT NULL DEFAULT 1,
    "maxTeamSize" INTEGER NOT NULL DEFAULT 1,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "bannerUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventOrganizer" (
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "EventOrganizer_pkey" PRIMARY KEY ("eventId","userId")
);

-- CreateTable
CREATE TABLE "EventForm" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventFormSubmission" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventFormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "submissionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowStage" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "approverRole" TEXT,

    CONSTRAINT "WorkflowStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTransition" (
    "id" TEXT NOT NULL,
    "fromStageId" TEXT NOT NULL,
    "toStageId" TEXT NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "WorkflowTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowInstance" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "currentStageId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowAction" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scannedBy" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "categoryId" TEXT NOT NULL,
    "submitterId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "receiptUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "eventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMember" (
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationMember_pkey" PRIMARY KEY ("conversationId","userId")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "replyToId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageReaction" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserXp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserXp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BadgeDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BadgeDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "freezes" INTEGER NOT NULL DEFAULT 0,
    "lastCheckIn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardCache" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "totalXp" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "adminResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventWinner" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "prize" TEXT,
    "note" TEXT,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventWinner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_registrationNumber_key" ON "User"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_registrationNumber_idx" ON "User"("registrationNumber");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_key" ON "Permission"("action");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_domain_key" ON "Organization"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "College_code_key" ON "College"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_collegeId_code_key" ON "Branch"("collegeId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "FestRegistration_festId_userId_key" ON "FestRegistration"("festId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketNumber_key" ON "Ticket"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_festId_userId_key" ON "Ticket"("festId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventForm_eventId_key" ON "EventForm"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_submissionId_key" ON "EventRegistration"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_eventId_userId_key" ON "EventRegistration"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowDefinition_name_key" ON "WorkflowDefinition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_eventId_userId_key" ON "Attendance"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_name_key" ON "ExpenseCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_eventId_key" ON "Conversation"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageReaction_messageId_userId_emoji_key" ON "MessageReaction"("messageId", "userId", "emoji");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_type_key" ON "NotificationPreference"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceToken_token_key" ON "DeviceToken"("token");

-- CreateIndex
CREATE INDEX "DeviceToken_userId_idx" ON "DeviceToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "File_key_key" ON "File"("key");

-- CreateIndex
CREATE UNIQUE INDEX "UserXp_userId_key" ON "UserXp"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BadgeDefinition_name_key" ON "BadgeDefinition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserStreak_userId_key" ON "UserStreak"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardCache_userId_key" ON "LeaderboardCache"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AppSetting_key_key" ON "AppSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "EventWinner_eventId_userId_key" ON "EventWinner"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventWinner_eventId_position_key" ON "EventWinner"("eventId", "position");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "College" ADD CONSTRAINT "College_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FestRegistration" ADD CONSTRAINT "FestRegistration_festId_fkey" FOREIGN KEY ("festId") REFERENCES "Fest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FestRegistration" ADD CONSTRAINT "FestRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_festId_fkey" FOREIGN KEY ("festId") REFERENCES "Fest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_festId_fkey" FOREIGN KEY ("festId") REFERENCES "Fest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOrganizer" ADD CONSTRAINT "EventOrganizer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOrganizer" ADD CONSTRAINT "EventOrganizer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventForm" ADD CONSTRAINT "EventForm_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFormSubmission" ADD CONSTRAINT "EventFormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "EventForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFormSubmission" ADD CONSTRAINT "EventFormSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "EventFormSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStage" ADD CONSTRAINT "WorkflowStage_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "WorkflowDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTransition" ADD CONSTRAINT "WorkflowTransition_fromStageId_fkey" FOREIGN KEY ("fromStageId") REFERENCES "WorkflowStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTransition" ADD CONSTRAINT "WorkflowTransition_toStageId_fkey" FOREIGN KEY ("toStageId") REFERENCES "WorkflowStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowInstance" ADD CONSTRAINT "WorkflowInstance_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "WorkflowDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowInstance" ADD CONSTRAINT "WorkflowInstance_currentStageId_fkey" FOREIGN KEY ("currentStageId") REFERENCES "WorkflowStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowAction" ADD CONSTRAINT "WorkflowAction_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "WorkflowInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowAction" ADD CONSTRAINT "WorkflowAction_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMember" ADD CONSTRAINT "ConversationMember_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMember" ADD CONSTRAINT "ConversationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserXp" ADD CONSTRAINT "UserXp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "BadgeDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStreak" ADD CONSTRAINT "UserStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventWinner" ADD CONSTRAINT "EventWinner_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventWinner" ADD CONSTRAINT "EventWinner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventWinner" ADD CONSTRAINT "EventWinner_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
