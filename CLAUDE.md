# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Villding is a React Native project management application built with Expo. It provides functionality for managing projects, tracking activities, and collaborating with team members.

## Development Commands

```bash
# Start the development server
npm start

# Run on Android emulator/device
npm run android

# Run on iOS simulator/device
npm run ios

# Run in web browser
npm run web
```

## Build Commands

The project uses EAS (Expo Application Services) for builds:

```bash
# Development build (internal distribution)
eas build --profile development

# Preview build (internal distribution)
eas build --profile preview

# Production build (APK for Android)
eas build --profile production --platform android
```

## Architecture

### Navigation Structure

The app uses React Navigation with a native stack navigator (App.tsx). The navigation flow is session-based:

1. **Unauthenticated flow**: Login → Password / CreacionCuenta → HomeProject (automatic session)
2. **Authenticated flow**: HomeProject → Project → Activity
3. **Additional screens**: EditProject, NewProject, EditUser, VistaMiembros

Initial routing logic (App.tsx:82-83):
- If no session → Login
- If session + current project → Project screen
- If session + no project → HomeProject

### State Management

The app uses AsyncStorage for persistent client-side storage with custom hooks:

- **Session management** (`src/hooks/localStorageUser.tsx`): Handles user authentication state with `@session_Key`
- **Current project** (`src/hooks/localStorageCurrentProject.ts`): Stores active project with `@current_Project`
- **Project list** (`src/hooks/localStorageProject.tsx`): Manages project lists
- **Current activity** (`src/hooks/localStorageCurrentActvity.ts`): Tracks active activities

### API Configuration

All API requests go through a centralized axios instance in `src/config/api.ts`.

**IMPORTANT**: The API base URL (`API_BASE_URL` at line 4) is environment-specific and frequently changes between:
- Local development: `https://villding.lat` (or other local IPs)
- Production: `https://villding.lat`

The axios instance includes request/response interceptors for logging and error handling.

### Component Organization

**Views** (`src/views/`):
- `Login/`: Authentication screens (Login, Password, CreacionCuenta, EditUser)
- `Projects/`: Project management (HomeProject, Project, NewProject, EditProject)
- `Accesos/`: Team member management (VistaMiembros, MemberModal)

**Components** (`src/components/`):
- `Activities/`: Activity tracking system with sub-components for creating, updating, and displaying activities
- `Project/`: Project cards and lists with search functionality
- `Alerta/`: Reusable modals (ConfirmationModal, LoadingModal)
- `Hamburguesa.tsx`: Navigation drawer component

### Type System

Core interfaces are defined in `src/types/interfaces.ts`:
- `User`: User profile and authentication data
- `Project`: Project metadata including week tracking
- `Tracking`: Activity/task tracking with status and dates
- `TrackingSection`: Grouped trackings by ID

## Key Technical Details

- **Framework**: Expo SDK 54 with React Native 0.81.4
- **React version**: 19.1.0
- **TypeScript**: Strict mode enabled
- **Navigation**: React Navigation v7 (native-stack, drawer, stack)
- **UI Library**: React Native Paper 5.12.5
- **Image handling**: expo-image-picker, expo-image-manipulator
- **Date/Time**: @react-native-community/datetimepicker

## Common Development Patterns

1. **Session checking**: Always verify session state before rendering authenticated screens
2. **Project context**: Most screens expect a current project from AsyncStorage or navigation params
3. **Week-based tracking**: Projects track activities by week number (`week_current`, `week`)
4. **API error handling**: Axios interceptors log all requests/responses; handle errors at component level
