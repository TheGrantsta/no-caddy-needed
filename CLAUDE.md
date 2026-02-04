# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

No Caddy Needed is a golf practice companion and on-course decision-making app built with Expo and React Native. It tracks practice drill results, displays professional golfer statistics, and manages a personal wedge distance chart — all stored locally via SQLite.

## Commands

```bash
npm test                  # Run all tests (285 tests, 37 suites)
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

All code contributions must follow Test-Driven Development practices.

### Core Rules

1. **Write tests before implementation**
   - Every new feature or behavior must begin with a failing test.
   - No production code may be written unless a failing test exists that requires it.

2. **Red → Green → Refactor cycle**
   - Red: Write a test that fails for the desired behavior.
   - Green: Implement the minimum code necessary to pass the test.
   - Refactor: Improve code structure without changing behavior, ensuring all tests still pass.

3. **Test coverage requirements**
   - New code must include tests covering:
     - Expected behavior (happy paths)
     - Edge cases
     - Error conditions
   - Code without tests will not be accepted.

4. **Test readability**
   - Tests should be descriptive and document system behavior.
   - Test names must clearly state intent:
     - Example: `shouldRejectEmptyPassword()`

5. **No skipping tests**
   - Do not disable or skip tests to pass CI.
   - Fix the code or fix the test.

6. **Continuous verification**
   - All tests must pass locally before committing.
   - CI pipelines must run the full test suite on every change.

7. **Pre-push requirement**
   - Run the full test suite (`npm test`) and confirm all tests pass without warning messages before every push to remote.
   - If there are warning messages in the tests, resolve warnings messages and commit changes with an appropriate comment.
   - Never push if any tests are failing.

### Example Workflow

1. Write failing test for new requirement.
2. Run tests → confirm failure.
3. Implement minimal code to pass.
4. Run tests → confirm success.
5. Refactor.
6. Run tests again.
7. Commit.

### Definition of Done

A task is complete only when:
- All tests pass.
- New functionality is fully tested.
- No untested production code exists.

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
