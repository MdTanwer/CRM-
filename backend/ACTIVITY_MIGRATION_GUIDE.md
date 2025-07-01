# Activity System Migration Guide

## Overview

The activity system has been separated into two distinct collections and controllers:

- **Employee Activities** → `empactivity` collection
- **Admin Activities** → `adminactivity` collection

## New Structure

### Models

- `EmployeeActivity.ts` → Stores in `empactivity` collection
- `AdminActivity.ts` → Stores in `adminactivity` collection
- `Activity.ts` → Legacy model (kept for backward compatibility)

### Controllers

- `employeeActivityController.ts` → Handles employee activities
- `adminActivityController.ts` → Handles admin activities
- `activityController.ts` → Legacy controller (kept for backward compatibility)

### Routes

- `/api/v1/employee-activities/*` → Employee activity endpoints
- `/api/v1/admin-activities/*` → Admin activity endpoints
- `/api/v1/activities/*` → Legacy endpoints (kept for backward compatibility)

## API Endpoints

### Employee Activities

```
POST   /api/v1/employee-activities           # Create employee activity
GET    /api/v1/employee-activities/recent    # Get recent employee activities
GET    /api/v1/employee-activities           # Get all with pagination
GET    /api/v1/employee-activities/user/:id  # Get activities for specific user
PATCH  /api/v1/employee-activities/:id/read  # Mark as read
DELETE /api/v1/employee-activities/:id       # Delete activity
```

### Admin Activities

```
POST   /api/v1/admin-activities                      # Create admin activity
GET    /api/v1/admin-activities/recent               # Get recent admin activities
GET    /api/v1/admin-activities                      # Get all with pagination
GET    /api/v1/admin-activities/critical             # Get critical activities
GET    /api/v1/admin-activities/system               # Get system activities
GET    /api/v1/admin-activities/employee-management  # Get employee mgmt activities
PATCH  /api/v1/admin-activities/:id/read             # Mark as read
DELETE /api/v1/admin-activities/:id                  # Delete activity
```

## Activity Types

### Employee Activity Types

- `profile_updated`
- `lead_assigned`
- `lead_status_changed`
- `deal_closed`
- `call_scheduled`
- `lead_created`
- `user_logout`
- `time_entry`
- `auto_checkin`
- `auto_checkout`

### Admin Activity Types

- `employee_added`
- `employee_deleted`
- `employee_edited`
- `lead_assigned`
- `lead_status_changed`
- `deal_closed`
- `call_scheduled`
- `lead_created`
- `user_logout`
- `system_config_changed`
- `bulk_lead_upload`
- `employee_status_changed`
- `admin_login`
- `data_export`
- `system_backup`

## Usage Examples

### Using the Activity Utility

```typescript
import { createActivityCreator } from "../utils/activityUtils";

// In your controller
export const updateLead = async (req: Request, res: Response) => {
  // ... update lead logic ...

  // Create activity based on user type
  const activityCreator = createActivityCreator(req, "employee");
  await activityCreator.createLeadStatusChanged(
    leadId,
    leadName,
    oldStatus,
    newStatus
  );

  res.json({ status: "success" });
};
```

### Manual Activity Creation

```typescript
import { createActivityByUserType } from "../utils/activityUtils";

// For employee activities
await createActivityByUserType(req, "employee", {
  message: "Employee updated their profile",
  type: "profile_updated",
  userId: "employee123",
  userName: "John Doe",
  entityType: "profile",
});

// For admin activities
await createActivityByUserType(req, "admin", {
  message: "New employee added to system",
  type: "employee_added",
  userId: "admin123",
  userName: "Admin User",
  entityId: "emp456",
  entityType: "employee",
  priority: "medium",
});
```

### Direct Controller Usage

```typescript
import { createAndBroadcastEmployeeActivity } from "../controller/employeeActivityController";
import { createAndBroadcastAdminActivity } from "../controller/adminActivityController";

// Employee activity
await createAndBroadcastEmployeeActivity(req, {
  message: "Lead status changed",
  type: "lead_status_changed",
  userId: "emp123",
  userName: "Jane Smith",
  entityId: "lead456",
  entityType: "lead",
});

// Admin activity
await createAndBroadcastAdminActivity(req, {
  message: "System backup completed",
  type: "system_backup",
  userId: "admin123",
  userName: "Admin User",
  entityType: "system",
  priority: "low",
});
```

## Socket.IO Events

### Employee Activities

- Event: `employee_activity_update`
- Payload: Employee activity data

### Admin Activities

- Event: `admin_activity_update`
- Payload: Admin activity data

### Legacy Activities

- Event: `activity_update`
- Payload: General activity data

## Database Collections

### `empactivity` Collection

```javascript
{
  "_id": ObjectId,
  "message": String,
  "type": String, // Employee activity types only
  "timestamp": Date,
  "entityId": String,
  "entityType": String,
  "userId": String,      // Required
  "userName": String,    // Required
  "userType": "employee", // Fixed value
  "metadata": Object,
  "isRead": Boolean,
  "createdAt": Date,
  "updatedAt": Date
}
```

### `adminactivity` Collection

```javascript
{
  "_id": ObjectId,
  "message": String,
  "type": String, // Admin activity types
  "timestamp": Date,
  "entityId": String,
  "entityType": String,
  "userId": String,
  "userName": String,
  "userType": "admin", // Fixed value
  "metadata": Object,
  "isRead": Boolean,
  "priority": String, // low, medium, high, critical
  "createdAt": Date,
  "updatedAt": Date
}
```

## Migration Steps

1. **Update Controllers**: Replace activity creation calls with the new separated controllers
2. **Update Frontend**: Update API calls to use new endpoints
3. **Update Socket Listeners**: Listen for both `employee_activity_update` and `admin_activity_update`
4. **Test Both Systems**: Ensure activities are saved to correct collections
5. **Optional**: Migrate existing activities from `activities` to respective collections

## Backward Compatibility

The legacy system is still available:

- Original `Activity` model and controller remain unchanged
- Original routes `/api/v1/activities/*` still work
- Original Socket.IO event `activity_update` still broadcasts

## Benefits of Separation

1. **Better Performance**: Separate collections reduce query load
2. **Cleaner Data**: Each collection has its specific schema
3. **Better Indexing**: Optimized indexes for each user type
4. **Scalability**: Can scale admin and employee systems independently
5. **Security**: Easier to implement role-based access control
6. **Maintenance**: Easier to maintain and extend each system separately
