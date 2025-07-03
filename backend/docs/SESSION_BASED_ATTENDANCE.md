# Session-Based Attendance Management System

## 🎯 Overview

The CRM system now implements a **session-based attendance management** approach where each work session follows a structured 4-step flow:

```
SESSION = Check-in → Break Start → Break End → Check-out
```

## 🔄 Session Flow Logic

### **Complete Session Structure**

```
Session 1:
├── Step 1: Login  → Check-in     (9:00 AM)
├── Step 2: Logout → Break Start  (1:00 PM)
├── Step 3: Login  → Break End    (2:00 PM)
└── Step 4: Logout → Check-out    (6:00 PM) ✅ SESSION COMPLETE

Session 2:
├── Step 1: Login  → Check-in     (8:00 PM)
├── Step 2: Logout → Break Start  (9:30 PM)
├── Step 3: Login  → Break End    (10:00 PM)
└── Step 4: Logout → Check-out    (11:30 PM) ✅ SESSION COMPLETE
```

### **Session States**

- **`new_session`**: Ready to start new session (0 entries)
- **`checked_in`**: After check-in (1 entry)
- **`on_break`**: After break start (2 entries)
- **`back_from_break`**: After break end (3 entries)
- **`session_complete`**: After check-out (4 entries) → Ready for new session

## 📊 Data Structure

### **Enhanced TimeTracking Model**

```typescript
interface ITimeTracking {
  userId: ObjectId;
  employeeId: ObjectId;
  date: Date;
  entries: ITimeEntry[];
  currentSessionNumber: number; // Current session being tracked
  totalSessions: number; // Total completed sessions
  status: "checked_in" | "checked_out" | "on_break" | "session_complete";
  totalWorkHours: number; // Sum of all sessions
  totalBreakHours: number; // Sum of all breaks
}
```

### **Session Information**

```typescript
interface IWorkSession {
  sessionNumber: number;
  checkInTime?: Date;
  breakStartTime?: Date;
  breakEndTime?: Date;
  checkOutTime?: Date;
  workHours: number;
  breakHours: number;
  totalHours: number;
  status: "in_progress" | "completed";
  entries: ITimeEntry[];
}
```

### **Time Entry with Session Number**

```typescript
interface ITimeEntry {
  type: "check_in" | "check_out" | "break_start" | "break_end";
  timestamp: Date;
  source: "manual" | "login" | "logout" | "auto";
  notes?: string;
  sessionNumber: number; // Links entry to specific session
}
```

## 🛠️ API Endpoints

### **Core Endpoints**

```
GET  /api/time-tracking/status              # Get current status + session info
GET  /api/time-tracking/history             # Get history with session breakdown
POST /api/time-tracking/entry               # Manual time entry with session support
GET  /api/time-tracking/summary             # Weekly/monthly summary with sessions
```

### **Session-Specific Endpoints**

```
GET  /api/time-tracking/session/current     # Get current session details
POST /api/time-tracking/session/complete    # Force complete current session
POST /api/time-tracking/session/start       # Start new session manually
GET  /api/time-tracking/session/stats       # Get session statistics
```

## 🔧 Usage Examples

### **1. Get Current Session Status**

```bash
GET /api/time-tracking/session/current
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "currentSession": {
      "sessionNumber": 2,
      "checkInTime": "2024-01-15T20:00:00.000Z",
      "breakStartTime": "2024-01-15T21:30:00.000Z",
      "breakEndTime": "2024-01-15T22:00:00.000Z",
      "workHours": 1.5,
      "breakHours": 0.5,
      "totalHours": 2.0,
      "status": "in_progress"
    },
    "sessionState": "back_from_break",
    "sessionProgress": {
      "current": 2,
      "total": 1,
      "status": "back_from_break"
    },
    "nextAction": "End session (Logout)"
  }
}
```

### **2. Get Full Status with All Sessions**

```bash
GET /api/time-tracking/status
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "timeTracking": {
      /* full record */
    },
    "currentStatus": "checked_in",
    "sessionState": "back_from_break",
    "sessionProgress": {
      "current": 2,
      "total": 1,
      "status": "back_from_break"
    },
    "currentSession": {
      /* current session details */
    },
    "allSessions": [
      {
        "sessionNumber": 1,
        "checkInTime": "2024-01-15T09:00:00.000Z",
        "breakStartTime": "2024-01-15T13:00:00.000Z",
        "breakEndTime": "2024-01-15T14:00:00.000Z",
        "checkOutTime": "2024-01-15T18:00:00.000Z",
        "workHours": 8.0,
        "breakHours": 1.0,
        "totalHours": 9.0,
        "status": "completed"
      },
      {
        "sessionNumber": 2,
        "checkInTime": "2024-01-15T20:00:00.000Z",
        "workHours": 1.5,
        "breakHours": 0.5,
        "totalHours": 2.0,
        "status": "in_progress"
      }
    ],
    "totalWorkHours": 9.5,
    "totalBreakHours": 1.5,
    "totalSessions": 2
  }
}
```

### **3. Manual Time Entry with Session Support**

```bash
POST /api/time-tracking/entry
Content-Type: application/json

{
  "type": "check_in",
  "timestamp": "2024-01-15T09:00:00.000Z",
  "notes": "Manual session start",
  "sessionNumber": 1
}
```

### **4. Force Complete Current Session**

```bash
POST /api/time-tracking/session/complete
```

**Response:**

```json
{
  "status": "success",
  "message": "Session completed successfully",
  "data": {
    "completedSession": {
      "sessionNumber": 2,
      "workHours": 2.0,
      "breakHours": 0.5,
      "totalHours": 2.5,
      "status": "completed"
    },
    "nextSessionNumber": 3
  }
}
```

### **5. Get Session Statistics**

```bash
GET /api/time-tracking/session/stats?startDate=2024-01-01&endDate=2024-01-31
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "stats": {
      "totalDays": 20,
      "totalSessions": 35,
      "totalWorkHours": 160.5,
      "totalBreakHours": 25.0,
      "averageSessionsPerDay": 1.75,
      "averageWorkHoursPerSession": 4.58,
      "averageBreakHoursPerSession": 0.71,
      "sessionDistribution": {
        "1": 12, // 12 days with 1 session
        "2": 6, // 6 days with 2 sessions
        "3": 2 // 2 days with 3 sessions
      },
      "completedSessions": 33,
      "incompleteSessions": 2
    }
  }
}
```

## 🎮 Frontend Integration

### **Session State Management**

```typescript
// Frontend session state
interface SessionState {
  currentSession: IWorkSession | null;
  sessionState: "new_session" | "checked_in" | "on_break" | "back_from_break";
  sessionProgress: {
    current: number;
    total: number;
    status: string;
  };
  nextAction: string;
  allSessions: IWorkSession[];
}
```

### **UI Components**

```typescript
// Session progress indicator
<SessionProgress
  current={sessionState.sessionProgress.current}
  total={sessionState.sessionProgress.total}
  status={sessionState.sessionState}
/>

// Next action button
<ActionButton
  action={sessionState.nextAction}
  state={sessionState.sessionState}
  onClick={handleSessionAction}
/>

// Session history
<SessionHistory
  sessions={sessionState.allSessions}
  showDetails={true}
/>
```

## 🔄 Automatic Login/Logout Integration

### **Login Flow**

```typescript
// When user logs in
const handleLogin = async (credentials) => {
  const response = await login(credentials);

  // Login automatically triggers session logic:
  // - If new day/no session: Start new session (check-in)
  // - If on break: End break (back from break)
  // - If already checked in: Handle gracefully

  return response;
};
```

### **Logout Flow**

```typescript
// When user logs out
const handleLogout = async () => {
  // Logout automatically triggers session logic:
  // - If checked in: Start break
  // - If back from break: Complete session
  // - If on break/not checked in: Handle gracefully

  const response = await logout();
  return response;
};
```

## 🕛 Midnight Auto-Checkout

The system automatically handles cross-day scenarios:

```typescript
// If user doesn't logout by midnight
// System automatically:
// 1. Completes current session at 23:59:59
// 2. Creates new day record if needed
// 3. Handles cross-day login scenarios
```

## 🧪 Testing

Run the test script to verify session logic:

```bash
node backend/test-session-flow.js
```

Expected output:

```
🎯 === TESTING SESSION 1 ===
1️⃣ User logs in (Check-in)
Status: checked_in, Session: 1, State: checked_in

2️⃣ User logs out (Break start)
Status: on_break, Session: 1, State: on_break

3️⃣ User logs in again (Break end)
Status: checked_in, Session: 1, State: back_from_break

4️⃣ User logs out again (Session complete)
Status: session_complete, Session: 2, State: new_session

📊 Session 1 Results:
- Work Hours: 8.00
- Break Hours: 1.00
- Total Hours: 9.00
- Status: completed
```

## 🎯 Key Benefits

1. **Clear Work Periods**: Each session represents a distinct work period
2. **Flexible Scheduling**: Multiple sessions per day support flexible work schedules
3. **Accurate Tracking**: Precise break and work time calculation
4. **Better Analytics**: Session-based insights and reporting
5. **User-Friendly**: Clear progression through session states
6. **Robust Logic**: Handles edge cases and cross-day scenarios

## 🔧 Migration Notes

Existing time tracking records will continue to work. The system:

- Automatically assigns `sessionNumber: 1` to existing entries
- Calculates session information from existing data
- Maintains backward compatibility

## 📈 Future Enhancements

1. **Session Templates**: Predefined session patterns
2. **Break Reminders**: Automatic break suggestions
3. **Session Goals**: Target work hours per session
4. **Team Sessions**: Collaborative work sessions
5. **Session Analytics**: Advanced session performance metrics
