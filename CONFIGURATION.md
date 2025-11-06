# Configuração do Ambiente de Testes

Guia de configuração para os testes integrados do DurvalCRM.

## 🌐 URL Base

A URL base padrão está configurada para o ambiente de desenvolvimento com WildFly:

```
http://localhost:9080/crm
```

### Alterando a URL Base

Você pode alterar a URL de três formas:

#### 1. Variável de Ambiente (Recomendado)

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
BASE_URL=http://localhost:9080/crm
```

#### 2. Variável de Ambiente no Terminal

```bash
BASE_URL=http://localhost:3000 npm test
```

#### 3. Editar playwright.config.ts

Edite diretamente o arquivo `playwright.config.ts`:

```typescript
baseURL: 'http://localhost:9080/crm'
```

### URLs Disponíveis

| Ambiente | URL | Descrição |
|----------|-----|-----------|
| **WildFly Dev** | `http://localhost:9080/crm` | Padrão - Backend Jakarta EE |
| **Vite Dev** | `http://localhost:3000` | Frontend Vue 3 dev server |
| **Staging** | `https://localhost:9443` | Vagrant VM staging |
| **Production** | `https://crm.durvalcrm.org` | Produção |

## ⏱️ Timeouts Configurados

Os timeouts foram otimizados para o ambiente WildFly:

| Configuração | Valor | Descrição |
|--------------|-------|-----------|
| **Test Timeout** | 60 segundos | Timeout global por teste |
| **Action Timeout** | 15 segundos | Timeout para ações (click, fill, etc) |
| **Navigation Timeout** | 20 segundos | Timeout para navegação |

### Alterando Timeouts

Edite `playwright.config.ts`:

```typescript
export default defineConfig({
  timeout: 60 * 1000,              // Test timeout
  use: {
    actionTimeout: 15 * 1000,       // Action timeout
    navigationTimeout: 20 * 1000,   // Navigation timeout
  }
});
```

## 👥 Workers (Paralelização)

Os testes rodam **sequencialmente** (1 worker) para evitar conflitos no banco de dados:

```typescript
workers: 1  // Execução sequencial
```

Para habilitar testes paralelos (não recomendado):

```typescript
workers: undefined  // Usa todos os cores disponíveis
```

## 🔄 Retries (Tentativas)

Configuração de retries em caso de falha:

| Ambiente | Retries |
|----------|---------|
| **Desenvolvimento** | 1 |
| **CI/CD** | 2 |

## 🔐 Credenciais de Teste

As credenciais padrão estão definidas no `AuthHelper`:

```typescript
username: 'tesouraria'
password: 'cairbar@2025'
```

### Usando Credenciais Diferentes

#### Opção 1: No teste

```typescript
await authHelper.login('outro-usuario', 'outra-senha');
```

#### Opção 2: Variável de ambiente

No arquivo `.env`:

```env
TEST_USERNAME=outro-usuario
TEST_PASSWORD=outra-senha
```

No código (seria necessário adaptar o AuthHelper):

```typescript
const username = process.env.TEST_USERNAME || 'tesouraria';
const password = process.env.TEST_PASSWORD || 'cairbar@2025';
await authHelper.login(username, password);
```

## 🌍 Ambientes de Teste

### Desenvolvimento Local (WildFly)

```bash
BASE_URL=http://localhost:9080/crm npm test
```

**Pré-requisitos:**
- WildFly rodando na porta 9080
- PostgreSQL rodando
- Keycloak rodando na porta 8080
- Aplicação deployada no WildFly

### Desenvolvimento Local (Vite)

```bash
BASE_URL=http://localhost:3000 npm test
```

**Pré-requisitos:**
- Frontend rodando em dev mode: `npm run dev`
- Backend rodando (WildFly ou outro)
- Keycloak rodando

### Staging (Vagrant VM)

```bash
BASE_URL=https://localhost:9443 npm test
```

**Pré-requisitos:**
- Vagrant VM rodando
- SSH tunnel configurado (se necessário)
- Certificado SSL aceito

### Produção

```bash
BASE_URL=https://crm.durvalcrm.org npm test
```

**⚠️ ATENÇÃO:** Executar testes em produção pode criar/modificar dados reais!

## 🔧 Configurações Adicionais

### Ignorar Erros HTTPS

Útil para ambientes de desenvolvimento com certificados auto-assinados:

```typescript
use: {
  ignoreHTTPSErrors: true  // Padrão: true
}
```

### Captura de Screenshots

```typescript
use: {
  screenshot: 'only-on-failure'  // Apenas em falhas
  // screenshot: 'on'            // Sempre
  // screenshot: 'off'           // Nunca
}
```

### Captura de Vídeo

```typescript
use: {
  video: 'retain-on-failure'  // Apenas em falhas
  // video: 'on'              // Sempre
  // video: 'off'             // Nunca
}
```

### Trace

```typescript
use: {
  trace: 'on-first-retry'  // Na primeira tentativa de retry
  // trace: 'on'           // Sempre
  // trace: 'off'          // Nunca
}
```

## 📊 Navegadores

Por padrão, apenas o Chromium é usado:

```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  }
]
```

### Habilitando Outros Navegadores

Descomente no `playwright.config.ts`:

```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  }
]
```

## 🐛 Debug

### Modo Debug

```bash
npm run test:debug
```

### Modo UI

```bash
npm run test:ui
```

### Modo Headed (ver navegador)

```bash
npm run test:headed
```

### Logs Detalhados

```bash
DEBUG=pw:api npm test
```

## ✅ Checklist de Configuração

Antes de executar os testes, verifique:

- [ ] WildFly está rodando (`http://localhost:9080`)
- [ ] Keycloak está rodando (`http://localhost:8080`)
- [ ] PostgreSQL está rodando
- [ ] Aplicação está deployada
- [ ] Usuário de teste existe no Keycloak
- [ ] baseURL está correta
- [ ] Navegadores Playwright instalados (`npx playwright install`)

## 📝 Exemplo de Configuração Completa

**`.env`:**
```env
BASE_URL=http://localhost:9080/crm
TEST_USERNAME=tesouraria
TEST_PASSWORD=cairbar@2025
```

**Executar testes:**
```bash
npm test
```

---

**Versão**: 1.0
**Última Atualização**: Novembro 2025
