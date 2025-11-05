# DurvalCRM - Testes Integrados de Negócio

Testes end-to-end (E2E) baseados em critérios de aceitação das user stories, implementados com [Playwright](https://playwright.dev/).

## 📋 Visão Geral

Este projeto contém testes automatizados de negócio que validam os critérios de aceitação definidos nas user stories do DurvalCRM. Os testes são organizados por sprint e verificam o comportamento da aplicação do ponto de vista do usuário final.

## 🎯 Objetivo

Garantir que todas as funcionalidades implementadas atendem aos critérios de aceitação definidos pelo Product Owner, validando:

- ✅ Fluxos de negócio completos
- ✅ Validações de formulário
- ✅ Regras de negócio
- ✅ Integrações entre módulos
- ✅ Mensagens de feedback ao usuário

## 🏗️ Estrutura do Projeto

```
durvalcrm-integrated-testing/
├── tests/                          # Testes organizados por sprint
│   └── sprint01/                   # Sprint 1 - Fundação
│       ├── us060-contas-bancarias.spec.ts
│       └── us061-registro-recebimentos.spec.ts
├── helpers/                        # Funções auxiliares reutilizáveis
│   ├── auth.helper.ts              # Autenticação (Keycloak OAuth2)
│   └── navigation.helper.ts        # Navegação entre páginas
├── fixtures/                       # Dados de teste
│   ├── contas.fixture.ts           # Dados de contas bancárias
│   └── recebimentos.fixture.ts     # Dados de recebimentos
├── playwright.config.ts            # Configuração do Playwright
├── package.json                    # Dependências e scripts
└── README.md                       # Este arquivo
```

## 🚀 Pré-requisitos

- **Node.js 18+**
- **npm** ou **yarn**
- **Aplicação DurvalCRM rodando** (frontend + backend + Keycloak)

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Instalar navegadores do Playwright
npx playwright install
```

## ▶️ Executando os Testes

### Executar todos os testes

```bash
npm test
```

### Executar testes com interface gráfica (headed mode)

```bash
npm run test:headed
```

### Executar testes em modo debug

```bash
npm run test:debug
```

### Executar testes com UI interativa

```bash
npm run test:ui
```

### Executar testes específicos

```bash
# Todos os testes da Sprint 1
npm run test:sprint01

# Apenas US-060 (Contas Bancárias)
npm run test:us060

# Apenas US-061 (Registro de Recebimentos)
npm run test:us061
```

### Ver relatório de testes

```bash
npm run report
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` (opcional) para configurar a URL base da aplicação:

```env
BASE_URL=http://localhost:3000
```

### Configurações no `playwright.config.ts`

- **baseURL**: URL da aplicação a ser testada
  - Desenvolvimento: `http://localhost:3000`
  - Staging: `https://localhost:9443`
  - Produção: `https://crm.durvalcrm.org`

- **timeout**: Timeout global para cada teste (padrão: 30 segundos)
- **retries**: Número de tentativas em caso de falha (padrão: 0 em dev, 2 em CI)
- **workers**: Número de workers paralelos (padrão: automático)

## 📝 Escrevendo Novos Testes

### Estrutura de um Teste

```typescript
import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';
import { NavigationHelper } from '../../helpers/navigation.helper';

test.describe('US-XXX: Nome da User Story', () => {
  let authHelper: AuthHelper;
  let navHelper: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    navHelper = new NavigationHelper(page);
    await authHelper.login();
  });

  test('Deve validar critério de aceitação X', async ({ page }) => {
    // Arrange (preparar dados)

    // Act (executar ação)

    // Assert (verificar resultado)
    await expect(page.locator('[data-testid="elemento"]')).toBeVisible();
  });
});
```

### Convenções

1. **Nomenclatura de arquivos**: `usXXX-nome-da-story.spec.ts`
2. **Descrição do teste**: Deve iniciar com "Deve..." e descrever o comportamento esperado
3. **Data testids**: Use `data-testid` para selecionar elementos no DOM
4. **AAA Pattern**: Organize testes em Arrange, Act, Assert
5. **Helpers**: Reutilize helpers para login, navegação e ações comuns

## 🧪 Sprint 1 - Fundação

### US-060: Cadastro de Contas Bancárias e Caixa

**Arquivo**: `tests/sprint01/us060-contas-bancarias.spec.ts`

**Critérios Testados**:
- ✅ Cadastro de conta bancária com campos obrigatórios
- ✅ Cadastro de caixa físico sem dados bancários
- ✅ Validação de campos obrigatórios
- ✅ Unicidade do nome da conta
- ✅ Status Ativa/Inativa
- ✅ Listagem e filtros
- ✅ Edição de dados cadastrais
- ✅ Inativação de conta
- ✅ Restrição de exclusão com movimentações
- ✅ Visualização de histórico
- ✅ Bloqueio de saldo após primeira movimentação

### US-061: Registro de Recebimentos por Forma de Pagamento

**Arquivo**: `tests/sprint01/us061-registro-recebimentos.spec.ts`

**Critérios Testados**:
- ✅ Registro com campos obrigatórios
- ✅ Seleção automática de conta por forma de pagamento
- ✅ Edição manual da conta de destino
- ✅ Validação de valor > 0
- ✅ Restrição de data futura
- ✅ Validação de conta ativa
- ✅ Alerta de discrepância forma pagamento x conta
- ✅ Vinculação a associado (mensalidade)
- ✅ Vinculação a venda
- ✅ Marcação de recebimentos avulsos
- ✅ Listagem e filtros
- ✅ Formatação de valores monetários
- ✅ Registro de timestamp

## 🎯 Estratégia de Testes

### O que testamos

- ✅ **Fluxos críticos de negócio**: Operações essenciais do sistema
- ✅ **Validações de entrada**: Campos obrigatórios, formatos, regras
- ✅ **Feedback ao usuário**: Mensagens de sucesso/erro
- ✅ **Integrações**: Comunicação entre módulos
- ✅ **Regras de negócio**: Lógica específica do domínio

### O que NÃO testamos aqui

- ❌ **Testes unitários**: Cobertos pelo backend/frontend
- ❌ **Testes de carga**: Ferramenta específica (JMeter, K6)
- ❌ **Testes de segurança**: Ferramenta específica (OWASP ZAP)

## 📊 Relatórios

Após executar os testes, relatórios são gerados automaticamente:

- **HTML Report**: `playwright-report/index.html`
- **JSON Report**: `test-results/results.json`

Visualize o relatório HTML com:

```bash
npm run report
```

## 🐛 Debugging

### Modo Debug Interativo

```bash
npm run test:debug
```

Permite:
- Executar testes passo a passo
- Inspecionar elementos do DOM
- Ver console logs
- Pausar em breakpoints

### Captura de Screenshots e Vídeos

Por padrão, o Playwright captura:
- **Screenshots**: Apenas em falhas
- **Vídeos**: Apenas em retries
- **Traces**: Na primeira tentativa de retry

## 🔄 Integração Contínua (CI)

### GitHub Actions (exemplo)

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📚 Recursos

- [Documentação do Playwright](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Seletores](https://playwright.dev/docs/selectors)

## 🤝 Contribuindo

1. Siga as convenções de nomenclatura
2. Escreva testes claros e descritivos
3. Use data-testids para seletores estáveis
4. Reutilize helpers e fixtures
5. Mantenha os testes independentes (não dependem da ordem)
6. Documente cenários complexos

## 📄 Licença

Apache 2.0 - Mesmo da aplicação DurvalCRM

---

**Versão**: 1.0.0
**Última Atualização**: Novembro 2025
**Mantido por**: DurvalCRM Team
