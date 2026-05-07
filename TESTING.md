# Testing Strategy

End-to-end tests written in **Playwright + TypeScript**. All test code lives under `tests/` — no test files are co-located with source code.

## Quick reference

| Command | What it does |
|---|---|
| `npm test` | Runs the full Playwright suite headless |
| `npm run test:ui` | Opens the Playwright UI runner — step through tests visually |
| `npm run test:headed` | Runs tests in a visible browser window |
| `npm run test:debug` | Pauses on each step in the Playwright Inspector |
| `npm run test:report` | Opens the HTML report from the last run |

The Playwright config auto-builds the app (`npm run build && npm run preview`) before running tests, so tests always run against a real production bundle.

## Folder layout

```
tests/
├── tsconfig.json        # TypeScript config scoped to the tests folder
├── helpers.ts           # Shared utilities: resetState, loginAsAdmin, gotoBugs, logBug
├── auth.spec.ts         # Login / signup / logout / session persistence (7 tests)
├── bug-crud.spec.ts     # Create / edit / close / delete + validation (10 tests)
├── filters.spec.ts      # Severity / status / priority / search / combined (9 tests)
└── dashboard.spec.ts    # Stat cards + charts + reactive updates (6 tests)
```

**32 tests total, ~12 seconds for the full run.**

## Conventions

- **Real persistence, no mocks.** Tests run against a real production build with real localStorage. Each `beforeEach` calls `resetState()` to clear localStorage and reload, so tests are isolated.
- **Accessibility-friendly locators** — `getByRole`, `getByLabel`, `getByPlaceholder` over `getByTestId`. Tests double as accessibility checks.
- **Auto-retry assertions** — Playwright's `expect(...).toBeVisible()` automatically waits and retries. We never use `waitForTimeout`.
- **Shared helpers in `helpers.ts`** — login, navigation, and "log a bug" flows are extracted so spec files focus on what's being tested, not setup boilerplate.
- **TypeScript strict mode** — catches selector typos and bad helper signatures at edit time.

## CI

`playwright.config.ts` is CI-aware:
- `forbidOnly: true` (fail if `.only` is committed)
- 2 retries on CI, 0 locally
- `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, `trace: 'on-first-retry'`
- `reporter: 'github'` on CI for inline annotations, `'list'` locally
