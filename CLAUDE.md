# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Integrated business tests for DurvalCRM using Playwright. Tests validate acceptance criteria from user stories, organized by sprint. Written in TypeScript with a focus on business flows, not technical implementation.

## Essential Commands

### Running Tests

```bash
# Run all tests
npm test

# Run with visual browser
npm run test:headed

# Interactive debug mode
npm run test:debug

# Interactive UI mode
npm run test:ui

# Specific sprint or user story
npm run test:sprint01
npm run test:us060          # Bank accounts
npm run test:us061          # Payment receipts

# Debug authentication issues
npm run test:debug-login

# View test report
npm run report

# Generate test code from browser interaction
npm run codegen
```

### Running Single Test

```bash
# By test name pattern
npx playwright test -g "Deve permitir cadastrar conta"

# With browser visible
npx playwright test -g "test name pattern" --headed

# Step-by-step debugging
npx playwright test -g "test name pattern" --debug

# Specific file
npx playwright test tests/sprint01/us060-contas-bancarias.spec.ts
```

### Installation

```bash
npm install
npx playwright install        # Install browsers
npx playwright install chromium  # Only Chromium
```

## Architecture

### Test Organization

```
tests/
├── sprint01/                    # Organized by sprint
│   ├── us060-contas-bancarias.spec.ts
│   └── us061-registro-recebimentos.spec.ts
└── debug-login.spec.ts          # Auth diagnostics

helpers/
├── auth.helper.ts               # Keycloak OAuth2/OIDC login
└── navigation.helper.ts         # Page navigation

fixtures/
├── contas.fixture.ts            # Bank account test data
└── recebimentos.fixture.ts      # Receipt test data
```

### Authentication Pattern

**Critical**: All tests require Keycloak authentication before execution.

The `AuthHelper` class handles OAuth2/OIDC PKCE flow with multiple fallback strategies:
1. Check if already authenticated (redirect to `/painel`, `/dashboard`, or other internal pages)
2. Find login button on app page → redirect to Keycloak
3. Fill Keycloak credentials (username/password)
4. Wait for redirect back to app (expects `/painel`, `/dashboard`, `/associados`, `/contas`, or `/mensalidades`)

**Usage in tests:**

```typescript
import { AuthHelper } from '../../helpers/auth.helper';

test.beforeEach(async ({ page }) => {
  const authHelper = new AuthHelper(page);
  await authHelper.login();  // Default: tesouraria/cairbar@2025
});
```

### Test Structure

Tests follow AAA pattern (Arrange, Act, Assert):

```typescript
test.describe('US-XXX: Feature Name', () => {
  let authHelper: AuthHelper;
  let navHelper: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    navHelper = new NavigationHelper(page);
    await authHelper.login();
  });

  test('Deve validar critério de aceitação X', async ({ page }) => {
    // Arrange: prepare test data

    // Act: perform user action

    // Assert: verify expected behavior
    await expect(page.locator('[data-testid="element"]')).toBeVisible();
  });
});
```

## Test Isolation and Data Management

**Critical**: Tests operate on a shared database and run sequentially.

- Each test should be **independent** - not rely on data from previous tests
- Use unique identifiers (timestamps, UUIDs) for test data when possible
- Consider cleanup in `afterEach` hooks if tests create persistent data
- AuthHelper automatically handles authentication state management

## Configuration

### playwright.config.ts

- **baseURL**: `http://localhost:9080/crm` (development WildFly)
  - Staging: `https://localhost:9443`
  - Vite dev: `http://localhost:3000`
  - Production: `https://crm.durvalcrm.org`
- **timeout**: 60 seconds (increased for WildFly startup)
- **actionTimeout**: 15 seconds
- **navigationTimeout**: 20 seconds
- **workers**: 1 (sequential execution to avoid conflicts)
- **retries**: 1 in dev, 2 in CI

### Environment Variables

Create `.env` (optional):

```env
BASE_URL=http://localhost:9080/crm
TEST_USERNAME=tesouraria
TEST_PASSWORD=cairbar@2025
```

## Writing Tests

### Naming Conventions

- **File**: `usXXX-feature-name.spec.ts` (e.g., `us060-contas-bancarias.spec.ts`)
- **Test description**: Start with "Deve..." (Portuguese) describing expected behavior
- **Selectors**: Use `[data-testid="..."]` for stable element selection

### Test Data

Use fixtures for reusable test data:

```typescript
import { contasBancariasFixtures } from '../../fixtures/contas.fixture';
import { recebimentosFixtures } from '../../fixtures/recebimentos.fixture';

test('test name', async ({ page }) => {
  const conta = contasBancariasFixtures.contaPix;
  await page.fill('[data-testid="nome"]', conta.nome);
});
```

### Common Patterns

**Wait for elements:**
```typescript
await page.waitForSelector('[data-testid="element"]', { state: 'visible' });
```

**Navigate:**
```typescript
await navHelper.goToNovaContaBancaria();  // Navigate to new bank account page
await navHelper.goToListaContas();         // Navigate to accounts list
```

**Interact with forms:**
```typescript
await page.fill('[data-testid="input-field"]', 'value');
await page.click('[data-testid="submit-button"]');
```

**Assertions:**
```typescript
await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
await expect(page.locator('[data-testid="total"]')).toHaveText('R$ 100,00');
```

## Debugging

### Authentication Issues

If tests fail at login:

1. Run diagnostic test:
   ```bash
   npm run test:debug-login
   ```

2. Check generated artifacts:
   - Screenshots: `test-results/login-error-*.png`
   - HTML dump: `test-results/debug-page-content.html`
   - Console logs show each auth step

3. Verify environment:
   ```bash
   curl http://localhost:9080/crm/login    # Should return 200 or 302
   curl http://localhost:8080              # Keycloak health
   ```

### Test Failures

**View screenshots/videos:**
- Screenshots: `test-results/` (on failure)
- Videos: `test-results/videos/` (on retry)
- HTML report: `playwright-report/index.html`

**Debug interactively:**
```typescript
await page.pause();  // Add to test for manual inspection
```

**Verbose logs:**
```bash
DEBUG=pw:api npm run test:debug-login
```

### Common Issues

**"Timeout waiting for locator"**
- Element selector is wrong → use `npm run codegen` to generate correct selector
- Element not visible → check CSS, modals, tabs
- Page not loaded → increase timeout or add `waitForLoadState`

**"Navigation timeout exceeded"**
- Backend is slow → check WildFly logs
- Network issues → verify DNS, add `/etc/hosts` entries
- Increase timeout in `playwright.config.ts` if needed

**"Login successful but tests fail"**
- Post-login redirect goes to unexpected URL
- The app redirects to `/painel` by default (Portuguese for "panel/dashboard")
- If you add new routes, update URL pattern in `AuthHelper.waitForLoginSuccess()`:
  ```typescript
  await page.waitForURL(/.*\/(painel|dashboard|associados|contas|your-route).*/)
  ```

## Pre-requisites

**Required services running:**
- DurvalCRM frontend (Vue 3 on Vite or WildFly)
- DurvalCRM backend (Jakarta EE on WildFly)
- Keycloak (OAuth2/OIDC provider)
- PostgreSQL database

**Default test user:**
- Username: `tesouraria`
- Password: `cairbar@2025`
- Must exist in Keycloak realm

## CI/CD Integration

Tests are designed for CI environments:

- Retries enabled (2 in CI, 1 in dev)
- Sequential execution (no parallel workers)
- Artifacts on failure (screenshots, videos, traces)
- JSON and HTML reports generated

## Important Notes

- Tests are **business-focused**, not technical unit tests
- All tests require authentication via Keycloak
- Tests run sequentially to avoid data conflicts (workers: 1)
- Use `data-testid` attributes for stable selectors
- Portuguese language used in test descriptions (business team preference)
- Application uses Portuguese routes (e.g., `/painel` instead of `/dashboard`)
- Fixtures provide reusable test data
- AuthHelper has multiple fallback strategies for login
- Screenshots and HTML dumps available on failures
- Increased timeouts account for WildFly startup latency
- Tests validate acceptance criteria from user stories
- Organized by sprint for traceability to requirements

## Related Documentation

- **README.md** - Detailed test strategy and sprint coverage
- **TROUBLESHOOTING.md** - Debug guide for common issues
- **playwright.config.ts** - Full configuration reference
- [Playwright Docs](https://playwright.dev/)

---

**Document Version**: 1.2
**Last Updated**: November 2025
**Status**: Active Development

**Recent Changes (v1.2):**
- **CRITICAL FIX**: Added `/painel` route to AuthHelper URL patterns (fixes authentication timeout)
- Updated authentication documentation to reflect Portuguese routes
- Added note about application using Portuguese routes (e.g., `/painel` vs `/dashboard`)

**Changes (v1.1):**
- Fixed fixture import examples to match actual implementation
- Added NavigationHelper method examples
- Added Test Isolation and Data Management section
- Clarified sequential execution strategy
- Enhanced Important Notes with sprint organization details
