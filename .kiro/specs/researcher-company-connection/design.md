# Design Document

## Overview

The researcher-company connection feature builds upon the existing enrollment system to provide enhanced connectivity and real-time notifications. The system will leverage the current Next.js 15 architecture with Prisma ORM, PostgreSQL database, and the existing authentication framework to create seamless connections between researchers and companies.

The design extends the current enrollment functionality by adding notification capabilities and enhanced connection management, ensuring companies are immediately informed when researchers join their programs.

## Architecture

### System Components

The feature integrates with the existing architecture:

- **Frontend**: Next.js 15 with React 19, TypeScript, and Tailwind CSS
- **Backend**: Next.js API routes with server-side rendering
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication with existing AuthService
- **Notifications**: Email notifications using Nodemailer (existing dependency)

### Data Flow

1. **Connection Initiation**: Researcher enrolls in program via existing enrollment API
2. **Connection Processing**: System creates enrollment record and triggers notification workflow
3. **Notification Delivery**: Company receives immediate email notification with researcher details
4. **Connection Management**: Both parties can view connection status through enhanced dashboards

## Components and Interfaces

### 1. Enhanced Enrollment API

**Endpoint**: `POST /api/programs/[id]/enroll` (existing, to be enhanced)

**Current Functionality**: Creates enrollment record
**Enhancement**: Add notification trigger after successful enrollment

```typescript
interface EnrollmentResponse {
  message: string;
  enrollment: {
    id: string;
    enrolledAt: Date;
    program: {
      title: string;
      company: {
        name: string;
        email: string;
      };
    };
  };
}
```

### 2. Notification Service

**New Component**: `NotificationService`

```typescript
interface NotificationService {
  sendResearcherConnectionNotification(
    companyEmail: string,
    researcherData: ResearcherConnectionData,
    programData: ProgramData
  ): Promise<boolean>;
  
  createNotificationRecord(
    userId: string,
    type: NotificationType,
    message: string
  ): Promise<Notification>;
}

interface ResearcherConnectionData {
  id: string;
  name: string;
  email: string;
  enrolledAt: Date;
}

interface ProgramData {
  id: string;
  title: string;
  description: string;
}
```

### 3. Enhanced Company Dashboard

**Component**: Company program management interface
**Enhancement**: Add connected researchers section

```typescript
interface ConnectedResearcher {
  id: string;
  name: string;
  email: string;
  enrolledAt: Date;
  reportsCount: number;
}

interface ProgramWithConnections extends Program {
  connectedResearchers: ConnectedResearcher[];
  totalConnections: number;
}
```

### 4. Connection Status Component

**New Component**: Real-time connection status display

```typescript
interface ConnectionStatus {
  programId: string;
  researcherId: string;
  status: 'connected' | 'pending' | 'disconnected';
  connectedAt?: Date;
  lastActivity?: Date;
}
```

## Data Models

### Enhanced Notification Model

The existing `Notification` model will be extended to support connection notifications:

```prisma
enum NotificationType {
  ReportUpdate
  Reward
  System
  ResearcherConnection  // New type
}
```

### Connection Audit Model

**New Model**: Track connection events for audit purposes

```prisma
model ConnectionAudit {
  id          String   @id @default(uuid())
  userId      String   // Researcher ID
  programId   String   // Program ID
  companyId   String   // Company ID
  action      ConnectionAction
  details     Json?    // Additional connection details
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
  program     Program  @relation(fields: [programId], references: [id])
  company     User     @relation(fields: [companyId], references: [id])
}

enum ConnectionAction {
  CONNECTED
  DISCONNECTED
  NOTIFICATION_SENT
  NOTIFICATION_FAILED
}
```

## Error Handling

### Notification Failures

1. **Email Delivery Failures**
   - Implement retry mechanism with exponential backoff
   - Log failed notifications for manual review
   - Provide fallback in-app notifications

2. **Connection Process Failures**
   - Rollback enrollment if notification fails critically
   - Maintain data consistency between enrollment and notification states
   - Provide clear error messages to users

### Data Consistency

1. **Transaction Management**
   - Wrap enrollment and notification in database transactions
   - Ensure atomic operations for connection creation
   - Handle concurrent enrollment attempts

2. **Audit Trail**
   - Log all connection events for troubleshooting
   - Track notification delivery status
   - Maintain connection history for compliance

## Testing Strategy

### Unit Tests

1. **NotificationService Tests**
   - Email template rendering
   - Notification delivery success/failure scenarios
   - Retry mechanism validation

2. **Enhanced Enrollment API Tests**
   - Connection creation with notification trigger
   - Error handling for notification failures
   - Data consistency validation

### Integration Tests

1. **End-to-End Connection Flow**
   - Researcher enrollment → Company notification → Dashboard update
   - Multiple researcher connections to same program
   - Connection status accuracy across interfaces

2. **Email Notification Tests**
   - Template rendering with real data
   - Email delivery to company addresses
   - Notification record creation

### Performance Tests

1. **Concurrent Connections**
   - Multiple researchers joining simultaneously
   - Notification queue processing under load
   - Database performance with connection queries

2. **Notification Scalability**
   - Bulk notification processing
   - Email service rate limiting
   - Queue management for high-volume scenarios

## Security Considerations

### Data Privacy

1. **Researcher Information Sharing**
   - Only share necessary researcher details with companies
   - Respect user privacy preferences
   - Implement data minimization principles

2. **Email Security**
   - Use secure email templates
   - Prevent email injection attacks
   - Validate all email addresses

### Access Control

1. **Connection Visibility**
   - Companies can only see their own program connections
   - Researchers control their profile visibility
   - Admin oversight for connection management

2. **Notification Authorization**
   - Verify company ownership before sending notifications
   - Prevent unauthorized notification triggers
   - Rate limiting for notification requests

## Implementation Phases

### Phase 1: Core Connection Enhancement
- Enhance existing enrollment API with notification triggers
- Implement basic NotificationService
- Create email templates for connection notifications

### Phase 2: Dashboard Integration
- Add connected researchers section to company dashboard
- Enhance researcher program view with connection status
- Implement real-time connection status updates

### Phase 3: Advanced Features
- Add connection audit logging
- Implement notification retry mechanisms
- Create connection analytics and reporting

### Phase 4: Optimization
- Performance optimization for large-scale connections
- Advanced notification preferences
- Connection management automation