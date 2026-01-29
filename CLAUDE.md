# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

No Caddy Needed is a golf practice companion and on-course decision-making app built with Expo and React Native. It tracks practice drill results, displays professional golfer statistics, and manages a personal wedge distance chart — all stored locally via SQLite.

## Commands

```bash
npm test                  # Run all tests (168 tests, 25 suites)
npm run test:watch        # Interactive watch mode for TDD
npm run test:coverage     # Generate coverage report (50% threshold enforced)
npm run test:changed      # Test only files related to changed code
npm run lint              # Run Expo linter
npm start                 # Start Expo dev server
npm run ios               # Run on iOS simulator
npm run android           # Run on Android emulator
```

Run a single test file:
```bash
npx jest __tests__/service/DbService-test.tsx
```

## Development Process: Test-Driven Development (TDD)

All code must follow TDD. No production code without a failing test first.

1. Write a failing test for the new behavior
2. Run tests — confirm failure
3. Implement the minimum code to pass
4. Run tests — confirm success
5. Refactor, then run tests again
6. Commit (pre-commit hook runs lint + related tests via Husky/lint-staged)

Coverage must include happy paths, edge cases, and error conditions. Never skip or disable tests.

## Architecture

### Layers

```
Screens (app/)  →  Services (service/)  →  Database (database/)
```

- **Screens** call service functions, never the database directly
- **DbService** wraps database queries and applies business logic (date formatting, stat aggregation)
- **database/db.tsx** handles raw SQLite operations via `expo-sqlite`

### Navigation (Expo Router — file-based)

```
app/_layout.tsx              # Root: DB init, theme, toast provider, network status
app/(tabs)/_layout.tsx       # Bottom tabs: Home, Practice, On Course, Settings
app/(tabs)/index.tsx         # Home
app/(tabs)/practice.tsx      # Practice hub (drills, tools, history)
app/(tabs)/on-course.tsx     # Course strategies, pro stats
app/(tabs)/settings.tsx      # Wedge chart management
app/short-game/*.tsx         # Putting, chipping, pitching, bunker screens
app/tools/*.tsx              # Random selector, tempo tool
```

### Data Persistence (SQLite)

Database: `NoCaddyNeeded.db` with two tables:
- **WedgeChart** — club distances (half/three-quarter/full swings)
- **Drills** — practice attempts with name, boolean result, timestamp

Writes are async (prepared statements). Reads are synchronous (`openDatabaseSync` + `getAllSync`).

### Styling

Direct `StyleSheet.create()` — no CSS-in-JS library. Centralized colors in `assets/colours.tsx` (primary yellow `#ffd33d`, background dark `#25292e`, accent green `#00C851`). Font sizes in `assets/font-sizes.tsx`.

## Test Patterns

Tests live in `__tests__/` mirroring source structure. Key patterns:

**Database mocking** — mock `database/db` module, never hit real SQLite in tests:
```typescript
jest.mock('../../database/db', () => ({
    getAllDrillHistory: jest.fn(),
}));
const mockGetAllDrillHistory = getAllDrillHistory as jest.Mock;
```

**Component tests** use `@testing-library/react-native` with `render`, `fireEvent`, `getByTestId`.

**Screen tests** mock `react-native-gesture-handler`, `expo-router`, and database modules.

## UI Patterns

- Screens wrap content in `GestureHandlerRootView` (required for scrolling)
- Sections within screens use `SubMenu` component with conditional rendering via `displaySection()`
- Horizontal pagination uses `FlatList` with `pagingEnabled` and dot indicators
- Toast notifications via `react-native-toast-notifications` (`useToast` hook)
- Pull-to-refresh via `RefreshControl` with loading states
