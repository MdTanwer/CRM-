# Canova CRM API Documentation

## Overview

Canova CRM is a comprehensive Customer Relationship Management system built with Node.js, Express, TypeScript, MongoDB, and Socket.IO. This API provides endpoints for lead management, employee management, time tracking, authentication, and real-time notifications.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [User Management](#user-management)
  - [Lead Management](#lead-management)
  - [Time Tracking](#time-tracking)
  - [Employee Management](#employee-management)
  - [Admin](#admin)
- [Real-time Events](#real-time-events)
- [Response Format](#response-format)
- [Error Handling](#error-handling)

## Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run in production mode
npm start
```

## Configuration

The application uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/canova-crm
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=30d
NODE_ENV=development
```

## API Endpoints

### Authentication

| Method | Endpoint            | Description                   | Request Body                                              | Response                                                                   |
| ------ | ------------------- | ----------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| POST   | /api/v1/auth/login  | Login with email and lastname | `{ "email": "user@example.com", "password": "LastName" }` | `{ "status": "success", "token": "jwt_token", "data": { "user": {...} } }` |
| GET    | /api/v1/auth/me     | Get current user profile      | -                                                         | `{ "status": "success", "data": { "user": {...} } }`                       |
| POST   | /api/v1/auth/logout | Logout and end session        | -                                                         | `{ "status": "success", "message": "Logged out successfully" }`            |
| GET    | /api/v1/auth/deals  | Get user's deal activities    | -                                                         | `{ "status": "success", "results": 10, "data": { "activities": [...] } }`  |

### User Management

| Method | Endpoint                        | Description                   | Request Body                                                                   | Response                                                                  |
| ------ | ------------------------------- | ----------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| GET    | /api/v1/users/profile           | Get user profile              | -                                                                              | `{ "status": "success", "data": { "user": {...} } }`                      |
| PATCH  | /api/v1/users/profile           | Update user profile           | `{ "firstName": "John", "lastName": "Doe" }`                                   | `{ "status": "success", "data": { "user": {...} } }`                      |
| PATCH  | /api/v1/users/update-password   | Update user password          | `{ "currentPassword": "old", "newPassword": "new", "confirmPassword": "new" }` | `{ "status": "success", "message": "Password updated successfully" }`     |
| GET    | /api/v1/users/recent-activities | Get 10 most recent activities | -                                                                              | `{ "status": "success", "results": 10, "data": { "activities": [...] } }` |

### Lead Management

| Method | Endpoint                          | Description                   | Query Parameters                                                | Request Body                                                                                                                                                 |
| ------ | --------------------------------- | ----------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GET    | /api/v1/leads                     | Get all leads                 | `page`, `limit`, `status`, `type`, `search`, `assignedEmployee` | -                                                                                                                                                            |
| POST   | /api/v1/leads                     | Create new lead               | -                                                               | `{ "name": "Lead Name", "email": "lead@example.com", "phone": "+1234567890", "language": "English", "location": "Pune", "type": "Hot", "autoAssign": true }` |
| GET    | /api/v1/leads/:id                 | Get lead by ID                | -                                                               | -                                                                                                                                                            |
| PATCH  | /api/v1/leads/:id                 | Update lead                   | -                                                               | `{ "name": "Updated Name", "status": "Ongoing" }`                                                                                                            |
| DELETE | /api/v1/leads/:id                 | Delete lead                   | -                                                               | -                                                                                                                                                            |
| POST   | /api/v1/leads/upload-csv          | Upload leads via CSV          | -                                                               | Form data with `file` (CSV) and `distributionStrategy`                                                                                                       |
| GET    | /api/v1/leads/stats               | Get lead statistics           | -                                                               | -                                                                                                                                                            |
| GET    | /api/v1/leads/sales-analytics     | Get sales analytics           | `startDate`, `endDate`                                          | -                                                                                                                                                            |
| GET    | /api/v1/leads/recent              | Get recent leads              | `limit`                                                         | -                                                                                                                                                            |
| GET    | /api/v1/leads/unassigned/count    | Get count of unassigned leads | -                                                               | -                                                                                                                                                            |
| GET    | /api/v1/leads/assigned/count      | Get count of assigned leads   | -                                                               | -                                                                                                                                                            |
| GET    | /api/v1/leads/total/count         | Get total leads count         | -                                                               | -                                                                                                                                                            |
| GET    | /api/v1/leads/closed/count        | Get closed leads count        | -                                                               | -                                                                                                                                                            |
| GET    | /api/v1/leads/my-leads            | Get leads assigned to user    | `page`, `limit`, `status`, `type`                               | -                                                                                                                                                            |
| PUT    | /api/v1/leads/:id/status          | Update lead status            | -                                                               | `{ "status": "Closed" }`                                                                                                                                     |
| PATCH  | /api/v1/leads/:id/type            | Update lead type              | -                                                               | `{ "type": "Hot" }`                                                                                                                                          |
| POST   | /api/v1/leads/:id/schedule        | Schedule call for lead        | -                                                               | `{ "scheduledDate": "2024-07-15", "scheduledTime": "14:30", "notes": "Follow up call" }`                                                                     |
| GET    | /api/v1/leads/:id/schedules       | Get schedules for a lead      | -                                                               | -                                                                                                                                                            |
| GET    | /api/v1/leads/my-schedule         | Get user's schedule           | -                                                               | -                                                                                                                                                            |
| GET    | /api/v1/leads/my-schedule/:date   | Get user's schedule for date  | -                                                               | -                                                                                                                                                            |
| PATCH  | /api/v1/leads/schedule/:id/status | Update schedule status        | -                                                               | `{ "status": "completed" }`                                                                                                                                  |

### Time Tracking

| Method | Endpoint                               | Description                      | Request Body                                                                                               | Response                                                                                    |
| ------ | -------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| GET    | /api/v1/time-tracking/status           | Get current time tracking status | -                                                                                                          | `{ "status": "success", "data": { "currentStatus": "checked_in", "timeTracking": {...} } }` |
| GET    | /api/v1/time-tracking/history          | Get time tracking history        | `startDate`, `endDate`, `page`, `limit`                                                                    | `{ "status": "success", "results": 10, "data": { "records": [...] } }`                      |
| GET    | /api/v1/time-tracking/summary          | Get time summary                 | `period` (daily/weekly/monthly)                                                                            | `{ "status": "success", "data": { "summary": {...} } }`                                     |
| POST   | /api/v1/time-tracking/entry            | Manual time entry                | `{ "type": "check_in", "timestamp": "2024-07-15T09:00:00Z", "notes": "Manual entry", "sessionNumber": 1 }` | `{ "status": "success", "data": { "entry": {...} } }`                                       |
| GET    | /api/v1/time-tracking/session/current  | Get current session details      | -                                                                                                          | `{ "status": "success", "data": { "session": {...} } }`                                     |
| POST   | /api/v1/time-tracking/session/complete | Complete current session         | -                                                                                                          | `{ "status": "success", "data": { "session": {...} } }`                                     |
| POST   | /api/v1/time-tracking/session/start    | Start new session                | -                                                                                                          | `{ "status": "success", "data": { "session": {...} } }`                                     |
| GET    | /api/v1/time-tracking/session/stats    | Get session statistics           | -                                                                                                          | `{ "status": "success", "data": { "stats": {...} } }`                                       |

### Employee Management

| Method | Endpoint                 | Description             | Request Body                                                                                                                  | Response                                                                 |
| ------ | ------------------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| GET    | /api/v1/employees        | Get all employees       | -                                                                                                                             | `{ "status": "success", "results": 10, "data": { "employees": [...] } }` |
| POST   | /api/v1/employees        | Create new employee     | `{ "firstName": "John", "lastName": "Doe", "email": "john@example.com", "location": "Pune", "preferredLanguage": "English" }` | `{ "status": "success", "data": { "employee": {...} } }`                 |
| GET    | /api/v1/employees/:id    | Get employee by ID      | -                                                                                                                             | `{ "status": "success", "data": { "employee": {...} } }`                 |
| PATCH  | /api/v1/employees/:id    | Update employee         | `{ "firstName": "John", "status": "inactive" }`                                                                               | `{ "status": "success", "data": { "employee": {...} } }`                 |
| DELETE | /api/v1/employees/:id    | Delete employee         | -                                                                                                                             | `{ "status": "success", "message": "Employee deleted" }`                 |
| GET    | /api/v1/employees/stats  | Get employee statistics | -                                                                                                                             | `{ "status": "success", "data": { "stats": {...} } }`                    |
| GET    | /api/v1/employees/recent | Get recent employees    | -                                                                                                                             | `{ "status": "success", "data": { "employees": [...] } }`                |

### Admin

| Method | Endpoint                 | Description                 | Request Body                                             | Response                                                   |
| ------ | ------------------------ | --------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| GET    | /api/v1/admin            | Get super admin info        | -                                                        | `{ "status": "success", "data": { "admin": {...} } }`      |
| PATCH  | /api/v1/admin/update     | Update super admin          | `{ "name": "Admin Name", "email": "admin@example.com" }` | `{ "status": "success", "data": { "admin": {...} } }`      |
| GET    | /api/v1/admin/activities | Get latest admin activities | -                                                        | `{ "status": "success", "data": { "activities": [...] } }` |

## Real-time Events

The API uses Socket.IO for real-time communication. Here are the main events:

### Employee Events

- `lead_assigned`: Triggered when leads are assigned to an employee
- `deal_closed`: Triggered when an employee closes a deal

### Admin Events

- `employee_created`: Triggered when a new employee is added
- `employee_edited`: Triggered when employee information is updated
- `employee_deleted`: Triggered when an employee is removed
- `leads_uploaded`: Triggered when leads are uploaded via CSV

### Activity Events

- `activity_update`: General activity updates
- `employee_activity_update`: Employee-specific activities
- `admin_activity_update`: Admin-specific activities

## Response Format

All API endpoints follow a consistent response structure:

### Success Response

```json
{
  "status": "success",
  "message": "Optional success message",
  "data": {
    "resource": {},
    "meta": {}
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response

```json
{
  "status": "fail" | "error",
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Error Handling

The API implements comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Authentication failed or token expired
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Server Error**: Internal server error

In development mode, detailed error information is provided. In production, only safe error messages are returned to prevent information leakage.
