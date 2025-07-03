# Canova CRM Frontend

## Overview

The frontend of Canova CRM is built with React, TypeScript, and Vite. It provides a responsive and intuitive user interface for managing leads, tracking time, scheduling calls, and monitoring employee activities.

## Pages

### User Pages

#### UserDashboardPage

- **Path**: `/dashboard`
- **Description**: The main landing page for regular users (employees) after login.
- **Features**:
  - Time tracking status with check-in/check-out functionality
  - Recent activity feed showing the latest 10 activities
  - Current session information with break management
  - Quick statistics about assigned leads and closed deals
  - Real-time notifications for new lead assignments

#### UserLeadsPage

- **Path**: `/leads`
- **Description**: Displays and manages leads assigned to the current user.
- **Features**:
  - Filterable and searchable lead list
  - Lead status updates (Open, Ongoing, Pending, Closed)
  - Lead type management (Hot, Warm, Cold)
  - Detailed lead information view
  - Call scheduling functionality

#### UserSchedulePage

- **Path**: `/schedule`
- **Description**: Calendar view of scheduled calls and appointments.
- **Features**:
  - Daily, weekly, and monthly calendar views
  - Upcoming call notifications
  - Call status management (upcoming, completed, cancelled)
  - Add notes to scheduled calls
  - Prevent closing leads with future scheduled calls

#### UserProfilePage

- **Path**: `/profile`
- **Description**: User profile management page.
- **Features**:
  - View and edit personal information
  - Change password functionality
  - View performance statistics
  - Activity history

### Admin Pages

#### AdminDashboard

- **Path**: `/admin`
- **Description**: Main dashboard for administrators.
- **Features**:
  - System-wide statistics and metrics
  - Recent activities across the platform
  - Quick access to employee and lead management
  - Real-time notifications for system events

#### EmployeesPage

- **Path**: `/admin/employees`
- **Description**: Employee management interface for admins.
- **Features**:
  - Add, edit, and delete employees
  - View employee performance metrics
  - Assign leads to employees
  - Filter and search employee records
  - Activate/deactivate employee accounts

#### LeadsPage

- **Path**: `/admin/leads`
- **Description**: Admin interface for lead management.
- **Features**:
  - View all leads in the system
  - Bulk lead import via CSV
  - Lead assignment strategies (equal, location-based, language-based, smart)
  - Lead status and type management
  - Advanced filtering and search

#### AttendancePage

- **Path**: `/admin/attendance`
- **Description**: Time tracking and attendance monitoring for all employees.
- **Features**:
  - Daily, weekly, and monthly attendance reports
  - Working hours statistics
  - Break time tracking
  - Session management
  - Export attendance data

#### SettingsPage

- **Path**: `/admin/settings`
- **Description**: System configuration and settings.
- **Features**:
  - Update admin profile
  - Configure system parameters
  - Manage notification settings
  - Backup and restore options

### Other Pages

#### LoginPage

- **Path**: `/login`
- **Description**: Authentication page for users to log in.
- **Features**:
  - Email and password authentication
  - Error handling for invalid credentials
  - Automatic time tracking initiation on successful login

#### NotFoundPage

- **Path**: `*` (any undefined route)
- **Description**: 404 error page shown when a route doesn't exist.
- **Features**:
  - User-friendly error message
  - Navigation back to dashboard
  - Animated illustration

## Component Structure

The pages are built using a component-based architecture:

- **Layout Components**: Header, Sidebar, Footer, etc.
- **Feature Components**: LeadCard, TimeTracker, ActivityFeed, etc.
- **UI Components**: Button, Input, Modal, Dropdown, etc.

## State Management

- **Context API**: Authentication, theme, and global state
- **Local State**: Component-specific state using React hooks
- **Socket Service**: Real-time updates and notifications

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom CSS**: Component-specific styles in separate CSS files

## Services

The frontend communicates with the backend through service modules:

- `auth.service.ts`: Authentication and user management
- `leads.service.ts`: Lead CRUD operations
- `timeTracking.service.ts`: Time tracking functionality
- `activities.service.ts`: Activity tracking and notifications
- `socketService.ts`: Real-time communication
- `schedule.service.ts`: Calendar and scheduling
- `userSocket.service.ts`: User-specific socket events

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Configuration

Create a `.env` file in the root directory with:

```
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
```
