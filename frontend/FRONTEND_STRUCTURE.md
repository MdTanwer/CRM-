# CRM Frontend Structure

## 📁 Complete Folder Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   └── index.html
│
├── src/
│   ├── components/
│   │   ├── ui/                          # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Alert.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── forms/                       # Form-specific components
│   │   │   ├── FormField.tsx
│   │   │   ├── FormSelect.tsx
│   │   │   ├── FormTextarea.tsx
│   │   │   ├── FormDatePicker.tsx
│   │   │   ├── FormFileUpload.tsx
│   │   │   ├── FormValidation.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/                      # Layout components
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── BottomNavigation.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── features/                    # Feature-specific components
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   ├── ForgotPasswordForm.tsx
│   │   │   │   ├── AuthGuard.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardStats.tsx
│   │   │   │   ├── ActivityFeed.tsx
│   │   │   │   ├── ConversionChart.tsx
│   │   │   │   ├── QuickActions.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── leads/
│   │   │   │   ├── LeadCard.tsx
│   │   │   │   ├── LeadTable.tsx
│   │   │   │   ├── LeadForm.tsx
│   │   │   │   ├── LeadFilters.tsx
│   │   │   │   ├── LeadStatusBadge.tsx
│   │   │   │   ├── LeadTypeBadge.tsx
│   │   │   │   ├── BulkLeadUpload.tsx
│   │   │   │   ├── LeadDetailModal.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── schedule/
│   │   │   │   ├── CallList.tsx
│   │   │   │   ├── CallCard.tsx
│   │   │   │   ├── CallForm.tsx
│   │   │   │   ├── CallFilters.tsx
│   │   │   │   ├── Calendar.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── employees/
│   │   │   │   ├── EmployeeTable.tsx
│   │   │   │   ├── EmployeeCard.tsx
│   │   │   │   ├── EmployeeForm.tsx
│   │   │   │   ├── EmployeeFilters.tsx
│   │   │   │   ├── EmployeeStatusBadge.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── attendance/
│   │   │   │   ├── CheckInOut.tsx
│   │   │   │   ├── BreakTracker.tsx
│   │   │   │   ├── AttendanceHistory.tsx
│   │   │   │   ├── AttendanceStats.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   ├── ProfileForm.tsx
│   │   │   │   ├── ProfileAvatar.tsx
│   │   │   │   ├── PasswordChangeForm.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── settings/
│   │   │       ├── GeneralSettings.tsx
│   │   │       ├── LeadAssignmentSettings.tsx
│   │   │       ├── NotificationSettings.tsx
│   │   │       ├── WorkingHoursSettings.tsx
│   │   │       └── index.ts
│   │   │
│   │   └── common/                      # Common/shared components
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── NotFound.tsx
│   │       ├── SearchBar.tsx
│   │       ├── StatusIndicator.tsx
│   │       ├── ConfirmationModal.tsx
│   │       └── index.ts
│   │
│   ├── pages/                           # Page components
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ForgotPasswordPage.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   │
│   │   ├── leads/
│   │   │   ├── LeadsPage.tsx
│   │   │   ├── CreateLeadPage.tsx
│   │   │   ├── EditLeadPage.tsx
│   │   │   └── LeadDetailPage.tsx
│   │   │
│   │   ├── schedule/
│   │   │   └── SchedulePage.tsx
│   │   │
│   │   ├── employees/
│   │   │   ├── EmployeesPage.tsx
│   │   │   ├── CreateEmployeePage.tsx
│   │   │   └── EditEmployeePage.tsx
│   │   │
│   │   ├── attendance/
│   │   │   └── AttendancePage.tsx
│   │   │
│   │   ├── profile/
│   │   │   └── ProfilePage.tsx
│   │   │
│   │   ├── settings/
│   │   │   └── SettingsPage.tsx
│   │   │
│   │   └── NotFoundPage.tsx
│   │
│   ├── hooks/                           # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   ├── usePagination.ts
│   │   ├── useFilters.ts
│   │   ├── useTable.ts
│   │   ├── useModal.ts
│   │   ├── useToast.ts
│   │   ├── useWebSocket.ts
│   │   ├── usePermissions.ts
│   │   ├── useLeads.ts
│   │   ├── useEmployees.ts
│   │   ├── useSchedule.ts
│   │   ├── useAttendance.ts
│   │   ├── useDashboard.ts
│   │   └── index.ts
│   │
│   ├── services/                        # API services
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── leads.service.ts
│   │   ├── employees.service.ts
│   │   ├── schedule.service.ts
│   │   ├── attendance.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── upload.service.ts
│   │   ├── notification.service.ts
│   │   └── index.ts
│   │
│   ├── context/                         # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   ├── NotificationContext.tsx
│   │   ├── PermissionContext.tsx
│   │   └── index.ts
│   │
│   ├── store/                           # State management (Redux/Zustand)
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── leadsSlice.ts
│   │   │   ├── employeesSlice.ts
│   │   │   ├── scheduleSlice.ts
│   │   │   ├── attendanceSlice.ts
│   │   │   ├── dashboardSlice.ts
│   │   │   └── uiSlice.ts
│   │   │
│   │   ├── store.ts
│   │   ├── rootReducer.ts
│   │   └── index.ts
│   │
│   ├── utils/                           # Utility functions
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   ├── storage.ts
│   │   ├── date.ts
│   │   ├── csv.ts
│   │   ├── permissions.ts
│   │   ├── api-helpers.ts
│   │   ├── constants-helpers.ts
│   │   └── index.ts
│   │
│   ├── types/                           # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   ├── leads.types.ts
│   │   ├── employees.types.ts
│   │   ├── schedule.types.ts
│   │   ├── attendance.types.ts
│   │   ├── dashboard.types.ts
│   │   └── common.types.ts
│   │
│   ├── constants/                       # Application constants
│   │   ├── index.ts
│   │   ├── api.constants.ts
│   │   ├── routes.constants.ts
│   │   ├── validation.constants.ts
│   │   ├── theme.constants.ts
│   │   └── permissions.constants.ts
│   │
│   ├── styles/                          # Styling files
│   │   ├── globals.css
│   │   ├── components.css
│   │   ├── utilities.css
│   │   └── themes/
│   │       ├── light.css
│   │       └── dark.css
│   │
│   ├── assets/                          # Static assets
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   ├── avatar-placeholder.png
│   │   │   └── illustrations/
│   │   │
│   │   ├── icons/
│   │   │   ├── home.svg
│   │   │   ├── leads.svg
│   │   │   ├── schedule.svg
│   │   │   └── ...
│   │   │
│   │   └── fonts/
│   │       └── custom-fonts.woff2
│   │
│   ├── config/                          # Configuration files
│   │   ├── env.ts
│   │   ├── routes.tsx
│   │   ├── permissions.ts
│   │   └── theme.ts
│   │
│   ├── lib/                             # Third-party library configurations
│   │   ├── axios.ts
│   │   ├── date-fns.ts
│   │   ├── chart.ts
│   │   └── validation.ts
│   │
│   ├── __tests__/                       # Test files
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── __mocks__/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   ├── vite-env.d.ts
│   └── index.css
│
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── .gitignore
└── README.md
```

## 🏗️ Architecture Principles

### 1. **Feature-Based Organization**

- Components are organized by features (auth, leads, dashboard, etc.)
- Each feature has its own folder with related components
- Promotes modularity and maintainability

### 2. **Separation of Concerns**

- **UI Components**: Reusable, stateless components in `components/ui/`
- **Feature Components**: Business logic components in `components/features/`
- **Pages**: Route-level components in `pages/`
- **Services**: API calls and external integrations
- **Utils**: Pure utility functions
- **Types**: TypeScript definitions

### 3. **Scalability**

- Easy to add new features without disrupting existing code
- Clear boundaries between different parts of the application
- Consistent naming conventions and folder structure

### 4. **Reusability**

- Common UI components can be used across features
- Utility functions are centralized and shared
- Custom hooks encapsulate reusable logic

## 📋 Key Features Covered

### 1. **Attendance Management**

- Check-in/Check-out functionality
- Break tracking with timestamps
- Visual status indicators
- Date-wise attendance records

### 2. **Lead Management**

- Lead cards with contact information
- Status management (Ongoing, Closed, Unassigned)
- Lead type classification (Hot, Warm, Cold)
- Color-coded visual indicators
- Bulk lead upload via CSV
- Lead assignment and distribution

### 3. **Scheduled Calls**

- Call scheduling and management
- Lead association with calls
- Call type categorization
- Filter by date and status
- Restriction: Cannot close leads with upcoming calls

### 4. **Dashboard Overview**

- Quick stats cards (unassigned leads, weekly leads, active salespeople, conversion rate)
- Interactive conversion rate chart
- Recent activity feed
- Real-time updates

### 5. **Employee Management**

- Employee CRUD operations
- Lead assignment tracking
- Status management (Active/Inactive)
- Performance metrics

### 6. **User Profile**

- Personal information management
- Password change functionality
- Preferences and settings

### 7. **Navigation**

- Responsive sidebar navigation
- Bottom navigation for mobile
- Breadcrumb navigation
- Global search functionality

## 🎨 UI/UX Features

### 1. **Modern Design**

- Clean, professional interface
- Tailwind CSS for consistent styling
- Responsive design for all devices
- Dark/light theme support

### 2. **Interactive Elements**

- Loading states and skeleton screens
- Hover effects and transitions
- Modal dialogs and confirmations
- Toast notifications

### 3. **Data Visualization**

- Charts for conversion rates
- Progress indicators
- Status badges and indicators
- Statistics cards

### 4. **Form Handling**

- Real-time validation
- File upload with progress
- Auto-save functionality
- Error handling and recovery

## 🔧 Technology Stack

### Core Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling

### State Management

- **React Context** - Global state
- **Custom Hooks** - Local state logic
- **Redux Toolkit** (optional) - Complex state

### Routing & Navigation

- **React Router** - Client-side routing
- **Protected Routes** - Authentication guards

### Data Fetching

- **Axios** - HTTP client
- **React Query** (optional) - Server state management

### Form Handling

- **React Hook Form** - Form management
- **Zod** - Schema validation

### Date & Time

- **date-fns** - Date utilities
- **React DatePicker** - Date selection

### Charts & Visualization

- **Recharts** - Chart library
- **React Charts** - Alternative charts

### File Handling

- **Papa Parse** - CSV parsing
- **React Dropzone** - File uploads

## 📱 Responsive Design

The application is designed to work seamlessly across all devices:

- **Desktop**: Full sidebar navigation with detailed layouts
- **Tablet**: Collapsible sidebar with optimized spacing
- **Mobile**: Bottom navigation with stacked layouts

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-based Access Control** - Permission system
- **Input Validation** - Client and server-side validation
- **XSS Protection** - Sanitized inputs and outputs
- **CSRF Protection** - Request validation

## 🚀 Performance Optimizations

- **Code Splitting** - Lazy loading of routes
- **Component Memoization** - React.memo and useMemo
- **Virtual Scrolling** - Large data sets
- **Image Optimization** - Lazy loading and compression
- **Bundle Optimization** - Tree shaking and minification

This structure provides a solid foundation for a professional CRM system that can scale with business needs while maintaining code quality and developer experience.
