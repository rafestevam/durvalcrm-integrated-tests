# Estratégia de Seletores com Fallback

Este documento explica a estratégia de seletores utilizada nos testes para suportar tanto a implementação atual do frontend quanto a futura migração para `data-testid`.

## 🎯 Problema

O frontend DurvalCRM atualmente **não possui** atributos `data-testid` implementados. Os testes precisam funcionar **agora** com a estrutura HTML atual, mas também devem facilitar a transição futura quando os `data-testid` forem adicionados.

## ✅ Solução: SelectorHelper

Criamos o `SelectorHelper` que tenta usar `data-testid` primeiro e faz fallback automático para outros seletores.

### Arquitetura

```
helpers/
└── selector.helper.ts
    ├── SelectorHelper       # Classe com métodos de fallback
    └── SELECTORS           # Mapeamento centralizado de seletores
```

## 🔧 Como Funciona

### 1. Mapeamento de Seletores (SELECTORS)

Cada elemento tem um mapeamento com múltiplas estratégias:

```typescript
export const SELECTORS = {
  BTN_NOVO_ASSOCIADO: {
    testId: 'btn-novo-associado',          // Ideal (ainda não implementado)
    fallback: 'button:has-text("Adicionar Associado")',  // Funciona agora
    text: 'Adicionar Associado'
  },
  INPUT_NOME_COMPLETO: {
    testId: 'input-nome-completo',         // Ideal (ainda não implementado)
    fallback: 'input[name="nomeCompleto"]', // Funciona agora
    name: 'nomeCompleto'
  }
};
```

### 2. SelectorHelper - Métodos com Fallback

#### clickByTestIdOrText()

```typescript
// Tenta data-testid primeiro, usa texto como fallback
await selectorHelper.clickByTestIdOrText(
  'btn-novo-associado',
  'Adicionar Associado'
);
```

**Comportamento:**
1. Procura `[data-testid="btn-novo-associado"]`
2. Se não encontrar, usa `button:has-text("Adicionar Associado")`
3. Loga qual estratégia foi usada

#### fillByTestIdOrName()

```typescript
// Tenta data-testid primeiro, usa name como fallback
await selectorHelper.fillByTestIdOrName(
  'input-nome-completo',
  'nomeCompleto',
  'João da Silva'
);
```

**Comportamento:**
1. Procura `[data-testid="input-nome-completo"]`
2. Se não encontrar, usa `input[name="nomeCompleto"]`
3. Preenche o campo

#### getLocatorWithFallback()

```typescript
// Retorna locator que funciona com qualquer um dos seletores
const alert = selectorHelper.getLocatorWithFallback(
  'alert-success',
  '.alert-success, .toast-success'
);
await expect(alert).toBeVisible();
```

## 📝 Exemplo de Uso no Teste

### Antes (Não Funcionava)

```typescript
test('Deve cadastrar associado', async ({ page }) => {
  await page.click('[data-testid="btn-novo-associado"]');  // ❌ Falha
  await page.fill('[data-testid="input-nome"]', 'João');   // ❌ Falha
});
```

### Depois (Funciona Agora)

```typescript
test('Deve cadastrar associado', async ({ page }) => {
  // Inicializar no beforeEach
  const selectorHelper = new SelectorHelper(page);

  // Usar com fallback
  await selectorHelper.clickByTestIdOrText(
    SELECTORS.BTN_NOVO_ASSOCIADO.testId,
    SELECTORS.BTN_NOVO_ASSOCIADO.text
  );  // ✅ Funciona usando o fallback por texto

  await selectorHelper.fillByTestIdOrName(
    SELECTORS.INPUT_NOME_COMPLETO.testId,
    SELECTORS.INPUT_NOME_COMPLETO.name,
    'João'
  );  // ✅ Funciona usando input[name="nomeCompleto"]
});
```

## 🔄 Transição para data-testid

Quando o frontend adicionar os `data-testid`:

### Passo 1: Frontend adiciona data-testid

```html
<!-- ANTES -->
<button class="btn btn-primary">
  + Adicionar Associado
</button>

<!-- DEPOIS -->
<button data-testid="btn-novo-associado" class="btn btn-primary">
  + Adicionar Associado
</button>
```

### Passo 2: Testes automaticamente usam data-testid

**Nenhuma mudança no código de teste é necessária!**

Os logs mostrarão a mudança:

```
# Antes (usando fallback)
[SELECTOR] data-testid "btn-novo-associado" não encontrado, usando fallback por texto

# Depois (usando data-testid)
[SELECTOR] Encontrado por data-testid: btn-novo-associado
```

## 📊 Seletores Mapeados

### Associados - Navegação

| Elemento | data-testid | Status | Fallback Atual |
|----------|-------------|--------|----------------|
| Botão Novo | `associado-adicionar-button` | ✅ Implementado | `button:has-text("Adicionar Associado")` |
| Botão Buscar | `btn-buscar` | ⚠️ Não implementado | `button:has-text("Buscar")` |
| Input Busca | `associado-buscar-input` | ✅ Implementado | `input[placeholder*="Buscar"]` |

### Associados - Ações na Lista

| Elemento | data-testid | Status | Fallback Atual |
|----------|-------------|--------|----------------|
| Editar (dinâmico) | `associado-editar-{id}-button` | ✅ Implementado | `button[data-action="edit"]` |
| Excluir (dinâmico) | `associado-excluir-{id}-button` | ✅ Implementado | `button[data-action="delete"]` |

### Associados - Formulário

| Campo | data-testid | Status | Fallback Atual |
|-------|-------------|--------|----------------|
| Nome | `associado-form-nome-input` | ✅ Implementado | `input[name="nomeCompleto"]` |
| CPF | `associado-form-cpf-input` | ✅ Implementado | `input[name="cpf"]` |
| Email | `associado-form-email-input` | ✅ Implementado | `input[name="email"]` |
| Telefone | `associado-form-telefone-input` | ✅ Implementado | `input[name="telefone"]` |
| Data Nascimento | `associado-form-data-nascimento-input` | ⚠️ Não implementado | `input[name="dataNascimento"]` |
| Logradouro | `input-logradouro` | ✅ Implementado | `input[name="logradouro"]` |
| Número | `input-numero` | ✅ Implementado | `input[name="numero"]` |
| Complemento | `input-complemento` | ✅ Implementado | `input[name="complemento"]` |
| Bairro | `input-bairro` | ✅ Implementado | `input[name="bairro"]` |
| Cidade | `input-cidade` | ✅ Implementado | `input[name="cidade"]` |
| Estado | `select-estado` | ✅ Implementado | `select[name="estado"]` |
| CEP | `input-cep` | ✅ Implementado | `input[name="cep"]` |
| Observações | `textarea-observacoes` | ✅ Implementado | `textarea[name="observacoes"]` |

### Ações

| Elemento | data-testid | Status | Fallback Atual |
|----------|-------------|--------|----------------|
| Salvar | `associado-form-salvar-button` | ✅ Implementado | `button[type="submit"]:has-text("Salvar")` |
| Cancelar | `associado-form-cancelar-button` | ✅ Implementado | `button:has-text("Cancelar")` |

### Feedback

| Elemento | data-testid | Fallback Atual |
|----------|-------------|----------------|
| Alerta Sucesso | `alert-success` | `.alert-success, .toast-success` |
| Alerta Erro | `alert-error` | `.alert-error, .alert-danger` |

## ✨ Vantagens

### Para os Testes
1. ✅ Funcionam **agora** com o frontend atual
2. ✅ **Zero mudanças** necessárias quando data-testid for adicionado
3. ✅ Logs claros de qual estratégia está sendo usada
4. ✅ Transição suave e gradual

### Para o Frontend
1. ✅ Pode adicionar `data-testid` gradualmente
2. ✅ Não precisa refatorar tudo de uma vez
3. ✅ Testes continuam funcionando durante a transição

## 🔍 Debug

### Ver qual seletor está sendo usado

Os logs mostram automaticamente:

```bash
npm run test:crud-associados:headed
```

Console mostrará:

```
[SELECTOR] data-testid "btn-novo-associado" não encontrado, usando fallback por texto
[SELECTOR] Input encontrado por data-testid: input-cpf  # Se já tiver data-testid
```

## 📚 Adicionar Novo Seletor

Para adicionar um novo elemento aos testes:

### 1. Adicionar ao SELECTORS

Em `helpers/selector.helper.ts`:

```typescript
export const SELECTORS = {
  // ...
  MEU_NOVO_BOTAO: {
    testId: 'btn-meu-botao',                    // data-testid ideal
    fallback: 'button:has-text("Meu Botão")',   // Seletor que funciona agora
    text: 'Meu Botão'
  }
};
```

### 2. Usar no Teste

```typescript
await selectorHelper.clickByTestIdOrText(
  SELECTORS.MEU_NOVO_BOTAO.testId,
  SELECTORS.MEU_NOVO_BOTAO.text
);
```

## 🎓 Boas Práticas

### DO ✅

- Use `SelectorHelper` para todos os novos testes
- Adicione seletores ao mapeamento `SELECTORS`
- Documente o fallback atual para cada elemento
- Use `name` attribute como fallback para inputs
- Use texto para fallback de botões

### DON'T ❌

- Não use seletores CSS diretos (`.class`, `#id`)
- Não dependa de estrutura HTML (`.parent > .child`)
- Não use seletores frágeis baseados em posição (`:nth-child`)

## 🚀 Roadmap

### Fase 1: Atual
- ✅ SelectorHelper implementado
- ✅ Testes funcionando com fallbacks
- ✅ Mapeamento completo de seletores

### Fase 2: Transição (Frontend)
- [ ] Adicionar `data-testid` no frontend gradualmente
- [ ] Começar pelos elementos mais usados
- [ ] Validar que testes continuam passando

### Fase 3: Conclusão
- [ ] Todos `data-testid` implementados
- [ ] Logs confirmam uso de data-testid
- [ ] Manter fallbacks como segurança

---

**Versão**: 1.0
**Última Atualização**: Novembro 2025
**Status**: Implementado e Funcional
