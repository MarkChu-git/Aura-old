# Apply Liquid Glass Style to Announcement Components

## Context

### Original Request
将 Announcement 栏中所有的框框都变成 liquid-glass-react 样式

### Interview Summary
**Key Discussions**:
- Apply liquid glass to ALL elements (containers, buttons, navigation dots)
- Visual intensity: Medium (displacementScale: 70, blurAmount: 0.0625)
- Background: Light (overLight: true)
- Elasticity: Medium (0.15)
- Setup Vitest + React Testing Library for testing

**Research Findings**:
- liquid-glass-react v1.1.1 is installed in dependencies
- No existing test infrastructure in project
- AnnouncementBanner is used in Layout component
- Project uses React 19 + Vite

### Metis Review
**Identified Gaps** (addressed):
- None (Metis call failed, manual review performed)

---

## Work Objectives

### Core Objective
Apply liquid-glass-react effect to AnnouncementBar and AnnouncementBanner components with all UI elements wrapped in glass effect.

### Concrete Deliverables
- Modified `/Users/mark/Aura/frontend/src/components/AnnouncementBar.jsx`
- Modified `/Users/mark/Aura/frontend/src/components/AnnouncementBanner.jsx`
- Updated `/Users/mark/Aura/frontend/package.json` with test dependencies
- Created Vitest configuration file
- Created test files for both components

### Definition of Done
- [ ] Both announcement components use LiquidGlass wrapper
- [ ] Main container has liquid glass effect
- [ ] Close button (X) has liquid glass effect
- [ ] Navigation dots have liquid glass effect (AnnouncementBanner)
- [ ] Test infrastructure installed and configured
- [ ] Automated tests pass (`npm test`)
- [ ] Visual verification in browser (`npm run dev`)

### Must Have
- LiquidGlass imported from 'liquid-glass-react'
- Main container wrapped with LiquidGlass
- Close button wrapped with LiquidGlass
- Navigation dots wrapped with LiquidGlass (if multiple announcements)
- Vitest installed and configured
- At least one test file per component

### Must NOT Have (Guardrails)
- DO NOT change any background **outside** the announcement components (global/background styling stays as-is)
- DO NOT modify the API calls or data fetching logic
- DO NOT change the announcement dismissal functionality
- DO NOT modify icons (Info, Megaphone) - keep them outside glass for clarity
- DO NOT break existing styling except to add LiquidGlass wrappers
- DO NOT add complex animations beyond what LiquidGlass provides

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO
- **User wants tests**: YES (Setup Vitest + Manual verification)
- **Framework**: Vitest + React Testing Library

### Test Setup Tasks

- [ ] 0. Setup Test Infrastructure
  - Install: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
  - Config: Create `vitest.config.js`
  - Update package.json: Add test scripts
  - Verify: `npm test -- --run` → shows Vitest help or runs tests

### Each TODO includes both automated tests and manual verification

---

## Task Flow

```
Task 0 (Test Setup) → Task 1 (AnnouncementBar) → Task 2 (AnnouncementBanner) → Task 3 (Verification)
```

## Parallelization

No parallelization - tasks must be sequential (test setup first, then components).

---

## TODOs

- [ ] 0. Setup Test Infrastructure

  **What to do**:
  - Install Vitest and testing libraries
  - Create Vitest configuration file
  - Update package.json with test scripts
  - Create example test to verify setup

  **Parallelizable**: NO (first task, must complete)

  **References** (CRITICAL - Be Exhaustive):

  **External References**:
  - Official Vitest docs: `https://vitest.dev/guide/` - Configuration and setup guide
  - React Testing Library: `https://testing-library.com/react/` - Testing patterns for React components
  - Example vitest config for React: Standard pattern with `@vitejs/plugin-react`

  **WHY Each Reference Matters**:
  - Vitest configuration needs to match the project's Vite setup
  - React Testing Library patterns ensure tests are maintainable and focus on user behavior

  **Acceptance Criteria**:

  **Automated Test Verification**:
  - [ ] Dependencies installed: Check `package.json` has new devDependencies
  - [ ] Config file created: `vitest.config.js` exists in `/Users/mark/Aura/frontend/`
  - [ ] Test scripts added: `package.json` has `"test": "vitest"` and `"test:run": "vitest --run"`
  - [ ] `npm test -- --run` → runs without errors (0 tests or passes example test)

  **Manual Execution Verification**:
  - [ ] Run: `cd /Users/mark/Aura/frontend && npm test -- --run`
  - [ ] Expected output: No errors, shows "Test Files" count or passes example test

  **Commit**: NO

---

- [ ] 1. Apply LiquidGlass to AnnouncementBar

  **What to do**:
  - Import LiquidGlass from 'liquid-glass-react'
  - Replace gradient background div with LiquidGlass wrapper
  - Wrap close button (X) in separate LiquidGlass component
  - Remove inline styles that conflict with LiquidGlass
  - Keep Info icon outside LiquidGlass for clarity

  **Must NOT do**:
  - DO NOT modify the `loadAnnouncement`, `handleDismiss`, or state logic
  - DO NOT change the API calls or localStorage handling
  - DO NOT remove the Info icon

  **Parallelizable**: NO

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `/Users/mark/Aura/frontend/src/components/AnnouncementBar.jsx:5-96` - Current implementation to modify
  - `/Users/mark/Aura/frontend/src/components/AnnouncementBanner.jsx:58-118` - Similar pattern for reference

  **External References** (libraries and frameworks):
  - liquid-glass-react docs: `https://github.com/rdev/liquid-glass-react` - Props and usage examples
  - LiquidGlass button example from docs: Pattern for wrapping buttons with LiquidGlass

  **WHY Each Reference Matters**:
  - Current implementation shows exact structure to preserve (state management, API calls)
  - External docs show how to properly wrap elements with LiquidGlass

  **Acceptance Criteria**:

  **Automated Test Verification**:
  - [ ] Test file created: `/Users/mark/Aura/frontend/src/components/__tests__/AnnouncementBar.test.jsx`
  - [ ] Test imports: `import { render, screen } from '@testing-library/react'`
  - [ ] Test renders without errors: `render(<AnnouncementBar />)` → no errors
  - [ ] Test renders LiquidGlass: Check for presence of glass effect classes or structure
  - [ ] `npm test AnnouncementBar` → PASS (at least 1 test)

  **Manual Execution Verification**:

  **For Component Changes**:
  - [ ] Run: `cd /Users/mark/Aura/frontend && npm run dev`
  - [ ] Navigate to: `http://localhost:5173` (or the dev server URL)
  - [ ] Verify: AnnouncementBar at top of page shows liquid glass effect
  - [ ] Action: Move mouse over the announcement
  - [ ] Verify: Glass effect follows mouse movement (displacement/refraction)
  - [ ] Action: Click the X button
  - [ ] Verify: Close button has liquid glass effect
  - [ ] Action: Click to dismiss
  - [ ] Verify: Announcement disappears (functionality preserved)
  - [ ] Evidence: Take screenshot of announcement with liquid glass effect

  **Commit**: YES
  - Message: `feat(announcement): apply liquid glass effect to AnnouncementBar`
  - Files: `frontend/src/components/AnnouncementBar.jsx`, `frontend/src/components/__tests__/AnnouncementBar.test.jsx`
  - Pre-commit: `npm test -- --run`

---

- [ ] 2. Apply LiquidGlass to AnnouncementBanner

  **What to do**:
  - Import LiquidGlass from 'liquid-glass-react'
  - Replace gradient background div with LiquidGlass wrapper
  - Wrap close button (X) in separate LiquidGlass component
  - Wrap navigation dots in LiquidGlass (each dot as separate small LiquidGlass)
  - Remove inline styles that conflict with LiquidGlass
  - Keep Megaphone icon outside LiquidGlass for clarity

  **Must NOT do**:
  - DO NOT modify the `loadAnnouncements`, `handleDismiss`, or state logic
  - DO NOT change the API calls or localStorage handling
  - DO NOT remove the Megaphone icon

  **Parallelizable**: NO (depends on Task 1 for patterns)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `/Users/mark/Aura/frontend/src/components/AnnouncementBanner.jsx:5-121` - Current implementation to modify
  - `/Users/mark/Aura/frontend/src/components/AnnouncementBar.jsx` - Task 1 result for pattern reference

  **API/Type References** (contracts to implement against):
  - Announcement API response shape from existing code usage

  **External References** (libraries and frameworks):
  - liquid-glass-react docs: `https://github.com/rdev/liquid-glass-react` - Props and usage examples

  **WHY Each Reference Matters**:
  - Current implementation shows exact structure to preserve (multi-announcement logic, dots navigation)
  - Task 1 provides working LiquidGlass implementation pattern to follow

  **Acceptance Criteria**:

  **Automated Test Verification**:
  - [ ] Test file created: `/Users/mark/Aura/frontend/src/components/__tests__/AnnouncementBanner.test.jsx`
  - [ ] Test imports: `import { render, screen, fireEvent } from '@testing-library/react'`
  - [ ] Test renders without errors: `render(<AnnouncementBanner />)` → no errors
  - [ ] Test renders LiquidGlass: Check for presence of glass effect classes or structure
  - [ ] Test navigation dots: Verify dots are rendered when multiple announcements
  - [ ] Test dismiss functionality: Verify clicking dismiss button removes announcement
  - [ ] `npm test AnnouncementBanner` → PASS (at least 3 tests: render, dots, dismiss)

  **Manual Execution Verification**:

  **For Component Changes**:
  - [ ] Run: `cd /Users/mark/Aura/frontend && npm run dev`
  - [ ] Navigate to: `http://localhost:5173` (or the dev server URL)
  - [ ] Verify: AnnouncementBanner at top of page shows liquid glass effect
  - [ ] Action: Move mouse over the announcement
  - [ ] Verify: Glass effect follows mouse movement (displacement/refraction)
  - [ ] Action: If multiple announcements, click navigation dots
  - [ ] Verify: Each dot has liquid glass effect and clicking switches announcements
  - [ ] Action: Click the X button
  - [ ] Verify: Close button has liquid glass effect
  - [ ] Action: Click to dismiss
  - [ ] Verify: Announcement disappears and next one shows (or banner hides if last)
  - [ ] Evidence: Take screenshot of announcement with liquid glass effect (showing dots if applicable)

  **Commit**: YES
  - Message: `feat(announcement): apply liquid glass effect to AnnouncementBanner`
  - Files: `frontend/src/components/AnnouncementBanner.jsx`, `frontend/src/components/__tests__/AnnouncementBanner.test.jsx`
  - Pre-commit: `npm test -- --run`

---

- [ ] 3. Final Verification and Documentation

  **What to do**:
  - Run all tests to ensure everything passes
  - Start dev server and manually verify visual effect
  - Check browser console for any errors or warnings
  - Document the changes made

  **Must NOT do**:
  - DO NOT add new features beyond what was requested

  **Parallelizable**: NO (depends on Tasks 1 and 2)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `/Users/mark/Aura/frontend/src/components/Layout.jsx` - Where announcements are used
  - All modified components from Tasks 1 and 2

  **WHY Each Reference Matters**:
  - Layout component shows where announcements are rendered in the app
  - Previous task results show what was changed

  **Acceptance Criteria**:

  **Automated Test Verification**:
  - [ ] All tests pass: `npm test -- --run` → All tests green, 0 failures
  - [ ] No console errors: Check browser console after loading app

  **Manual Execution Verification**:

  **For Visual QA**:
  - [ ] Run: `cd /Users/mark/Aura/frontend && npm run dev`
  - [ ] Navigate to: `http://localhost:5173`
  - [ ] Verify: AnnouncementBanner (if announcements exist) shows liquid glass effect
  - [ ] Action: Test hover effects on main container
  - [ ] Verify: Glass effect responds to mouse movement smoothly
  - [ ] Action: Test hover effects on close button
  - [ ] Verify: Button glass effect responds to mouse
  - [ ] Action: If multiple announcements, test hover on navigation dots
  - [ ] Verify: Dot glass effects respond to mouse
  - [ ] Action: Test dismiss functionality
  - [ ] Verify: Dismissal works, no JavaScript errors
  - [ ] Verify: No layout shifts or broken styles
  - [ ] Verify: LiquidGlass effects look good on light background
  - [ ] Evidence: Screenshot showing liquid glass announcement in action

  **Commit**: NO (verify only, no new commits)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 0 | `chore(testing): setup vitest and react testing library` | package.json, vitest.config.js, example test | npm test -- --run |
| 1 | `feat(announcement): apply liquid glass effect to AnnouncementBar` | AnnouncementBar.jsx, AnnouncementBar.test.jsx | npm test -- --run |
| 2 | `feat(announcement): apply liquid glass effect to AnnouncementBanner` | AnnouncementBanner.jsx, AnnouncementBanner.test.jsx | npm test -- --run |

---

## Success Criteria

### Verification Commands
```bash
cd /Users/mark/Aura/frontend

# Run all tests
npm test -- --run

# Start dev server
npm run dev

# Expected: Server starts at http://localhost:5173
# Visual: Announcement components show liquid glass effect
```

### Final Checklist
- [ ] All automated tests pass
- [ ] LiquidGlass effect visible on announcement containers
- [ ] LiquidGlass effect visible on close buttons
- [ ] LiquidGlass effect visible on navigation dots (if multiple announcements)
- [ ] Mouse hover interactions work correctly on all glass elements
- [ ] Announcement dismissal functionality preserved
- [ ] Navigation dots work (AnnouncementBanner)
- [ ] No console errors or warnings
- [ ] No layout breaks or style conflicts
