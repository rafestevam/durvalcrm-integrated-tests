# Migration Notes - CRUD Associados Test

## ✅ Completed Updates

### 1. SelectorHelper Enhanced (helpers/selector.helper.ts)
- Added `waitForModal()` method to wait for modals to appear
- Added `waitForForm()` method to wait for forms to be visible
- All SELECTORS updated to match DATA-TESTID-REFERENCE.md from frontend

### 2. First CREATE Test Updated (lines 40-150)
**Status**: ✅ Fully migrated

The first "Deve permitir cadastrar associado com todos os campos" test has been updated to:
- Use SelectorHelper consistently
- Use correct data-testid values from SELECTORS mapping
- Wait for modal before filling form fields
- Use getLocatorWithFallback() for assertions

**Pattern to follow:**
```typescript
// Open modal
await selectorHelper.clickByTestIdOrText(
  SELECTORS.BTN_NOVO_ASSOCIADO.testId,
  SELECTORS.BTN_NOVO_ASSOCIADO.text
);

// Wait for modal
await selectorHelper.waitForModal();

// Fill fields
await selectorHelper.fillByTestIdOrName(
  SELECTORS.INPUT_NOME_COMPLETO.testId,
  SELECTORS.INPUT_NOME_COMPLETO.name,
  associado.nomeCompleto
);

// Save
await selectorHelper.clickByTestIdOrText(
  SELECTORS.BTN_SALVAR.testId,
  SELECTORS.BTN_SALVAR.text
);

// Assert
const alertSuccess = selectorHelper.getLocatorWithFallback(
  SELECTORS.ALERT_SUCCESS.testId,
  SELECTORS.ALERT_SUCCESS.fallback
);
await expect(alertSuccess).toBeVisible();
```

### 3. First UPDATE Test Updated (lines 358-410)
**Status**: ✅ Partially migrated

Updated to use SelectorHelper and wait for modal, but uses mixed approach for edit button (direct selector).

## ⚠️ Pending Updates

### Tests Still Using Old Pattern

The following tests still use direct `page.click()` and `page.fill()` with old data-testid values:

**CREATE Tests:**
- Line 176-188: "Deve validar campos obrigatórios"
- Line 196-205: "Deve exibir mensagens de erro"
- Line 214-240: "Não deve permitir CPF duplicado"
- Line 255-266: "Deve cadastrar múltiplos associados"
- Line 281-302: "Deve permitir buscar associado"
- Line 321-346: "Deve cadastrar com endereço completo"

**UPDATE Tests:**
- Line 419-445: "Deve permitir atualizar endereço"

**DELETE Tests:**
- Line 461-480: "Deve permitir inativar associado"
- Line 495-515: "Deve marcar como inativo"
- Line 526-548: "Não deve remover fisicamente"

### What Needs to Change

For each test, update:

1. **Button clicks:**
   ```typescript
   // OLD
   await page.click('[data-testid="btn-novo-associado"]');

   // NEW
   await selectorHelper.clickByTestIdOrText(
     SELECTORS.BTN_NOVO_ASSOCIADO.testId,
     SELECTORS.BTN_NOVO_ASSOCIADO.text
   );
   await selectorHelper.waitForModal();
   ```

2. **Input fields:**
   ```typescript
   // OLD
   await page.fill('[data-testid="input-nome-completo"]', value);

   // NEW
   await selectorHelper.fillByTestIdOrName(
     SELECTORS.INPUT_NOME_COMPLETO.testId,
     SELECTORS.INPUT_NOME_COMPLETO.name,
     value
   );
   ```

3. **Save button:**
   ```typescript
   // OLD
   await page.click('[data-testid="btn-salvar-associado"]');

   // NEW
   await selectorHelper.clickByTestIdOrText(
     SELECTORS.BTN_SALVAR.testId,
     SELECTORS.BTN_SALVAR.text
   );
   ```

4. **Assertions:**
   ```typescript
   // OLD
   await expect(page.locator('[data-testid="alert-success"]')).toBeVisible();

   // NEW
   const alertSuccess = selectorHelper.getLocatorWithFallback(
     SELECTORS.ALERT_SUCCESS.testId,
     SELECTORS.ALERT_SUCCESS.fallback
   );
   await expect(alertSuccess).toBeVisible();
   ```

### Data-TestID Changes

The old direct selectors use incorrect testId values. Here are the corrections:

| Old (incorrect) | New (correct from DATA-TESTID-REFERENCE.md) |
|----------------|---------------------------------------------|
| `btn-novo-associado` | `associado-adicionar-button` |
| `input-nome-completo` | `associado-form-nome-input` |
| `input-cpf` | `associado-form-cpf-input` |
| `input-email` | `associado-form-email-input` |
| `input-telefone` | `associado-form-telefone-input` |
| `input-data-nascimento` | `associado-form-data-nascimento-input` |
| `btn-salvar-associado` | `associado-form-salvar-button` |
| `btn-cancelar` | `associado-form-cancelar-button` |
| `input-busca-associado` | `associado-buscar-input` |
| `btn-buscar` | (not implemented yet) |

## 🎯 Migration Priority

1. **HIGH** - CREATE tests (most critical for CRUD functionality)
2. **MEDIUM** - UPDATE tests (important but less frequent)
3. **LOW** - DELETE tests (mostly working, but need consistency)

## 📝 Benefits of Migration

1. **Stability**: Tests work with fallback selectors even if data-testid isn't implemented
2. **Consistency**: All tests use the same helper methods
3. **Maintainability**: Changes to selectors only need to be made in one place (SELECTORS mapping)
4. **Future-proof**: Automatic migration when frontend adds data-testid attributes
5. **Debugging**: Clear console logs show which selector strategy is being used

## 🚀 How to Continue Migration

To migrate a test:

1. Find the test function
2. Replace `page.click('[data-testid="..."]')` with `selectorHelper.clickByTestIdOrText(...)`
3. Replace `page.fill('[data-testid="..."]')` with `selectorHelper.fillByTestIdOrName(...)`
4. Add `await selectorHelper.waitForModal()` after opening modals
5. Use `getLocatorWithFallback()` for assertions
6. Update data-testid values to match SELECTORS mapping

## ⚡ Quick Reference

```typescript
// Import at top
import { SelectorHelper, SELECTORS } from '../helpers/selector.helper';

// In beforeEach
let selectorHelper: SelectorHelper;
selectorHelper = new SelectorHelper(page);

// Click button
await selectorHelper.clickByTestIdOrText(
  SELECTORS.BTN_NOVO_ASSOCIADO.testId,
  SELECTORS.BTN_NOVO_ASSOCIADO.text
);

// Wait for modal
await selectorHelper.waitForModal();

// Fill input
await selectorHelper.fillByTestIdOrName(
  SELECTORS.INPUT_NOME_COMPLETO.testId,
  SELECTORS.INPUT_NOME_COMPLETO.name,
  'João Silva'
);

// Assert with fallback
const alert = selectorHelper.getLocatorWithFallback(
  SELECTORS.ALERT_SUCCESS.testId,
  SELECTORS.ALERT_SUCCESS.fallback
);
await expect(alert).toBeVisible();
```

---

**Status**: In Progress
**Last Updated**: 2025-11-06
**Completion**: ~15% (2 of 12 tests migrated)
