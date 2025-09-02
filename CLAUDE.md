# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension for exporting schedules from My ITMO (my.itmo.ru) to ICS calendar format. Built with Vue 3, TypeScript, and Vite using the CRXJS plugin for Chrome extension development.

## Build and Development Commands

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Build extension for production
npm run build

# Lint and fix code
npm run lint

# Preview production build
npm run preview

# Create release zip (after building)
zip -r extension.zip dist
```

## Architecture

### Core Components

- **Manifest V3 Chrome Extension**: Uses CRXJS Vite plugin for modern development workflow
- **Popup UI** (`src/popup/`): Vue 3 single-page app for user interaction
  - `app.vue`: Main component with date selection and export functionality
  - `parseSchedule.ts`: Core logic for authentication, API calls, and ICS generation
- **Background Service Worker** (`src/background/index.ts`): Handles extension background tasks
- **Configuration**: 
  - `manifest.config.ts`: Dynamic Chrome extension manifest configuration
  - `vite.config.ts`: Build configuration with auto-imports and component resolution

### Key Features Implementation

1. **Authentication**: Retrieves auth token from ITMO cookies (`auth._id_token.itmoId`)
2. **Schedule Fetching**: Makes authenticated API calls to `https://my.itmo.ru/api/schedule/schedule/personal`
3. **ICS Generation**: Converts JSON schedule data to ICS format with UTC timezone handling
4. **Export**: Uses Chrome Downloads API to save the ICS file

### Technology Stack

- **Frontend**: Vue 3 with Composition API, TypeScript
- **Styling**: Tailwind CSS with custom component styles
- **Build Tools**: Vite with CRXJS plugin for Chrome extension bundling
- **Auto-imports**: Configured for Vue, Vue Router, VueUse, and custom composables
- **Icons**: Unplugin Icons with MDI icon set

## Chrome Extension Permissions

- `cookies`: Access ITMO authentication cookies
- `activeTab`: Interact with current tab
- `storage`: Store user preferences
- `downloads`: Save ICS files
- `host_permissions`: Access to all URLs for API calls

## API Response Structure

The ITMO schedule API (`/api/schedule/schedule/personal`) returns data in the following structure (example in `docs/schedule-response.json`):

- **Day object**: Contains `date`, `day_number`, `week_number`, `lessons[]`, and `intersections[]` (scheduling conflicts)
- **Lesson object**: Includes:
  - Core info: `subject`, `type`, `time_start`, `time_end`
  - Location: `room`, `building`, `format` (Очный/Дистанционный/Очно-дистанционный)
  - Teacher: `teacher_name`, `teacher_id`
  - Additional: `zoom_url` for remote classes, `note` for special instructions
  - Group info: `group`, `flow_id`, `work_type`

### Lesson Formats
- `format_id: 1` - In-person (Очный)
- `format_id: 2` - Hybrid (Очно-дистанционный)
- `format_id: 3` - Remote (Дистанционный)

### Work Types
- Лекции (Lectures)
- Лабораторные занятия (Lab sessions)
- Занятия спортом (Sports activities)

## Release Process

GitHub Actions workflow (`/.github/workflows/release.yml`) automatically:
1. Builds the extension on push to master
2. Creates a zip file of the dist folder
3. Creates a draft GitHub release with the extension.zip attachment