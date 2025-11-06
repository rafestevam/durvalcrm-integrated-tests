import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes integrados de negócio do DurvalCRM
 *
 * Este arquivo configura os testes end-to-end que validam os critérios de aceitação
 * das user stories do sistema.
 */
export default defineConfig({
  // Diretório raiz dos testes
  testDir: './tests',

  // Timeout para cada teste (60 segundos - aumentado para WildFly)
  timeout: 60 * 1000,

  // Executar testes em paralelo (desabilitado por padrão para evitar conflitos)
  fullyParallel: false,

  // Falhar o build se algum teste falhar
  forbidOnly: !!process.env.CI,

  // Tentar novamente em caso de falha (útil em CI)
  retries: process.env.CI ? 2 : 1,

  // Número de workers (threads de execução) - 1 worker para testes sequenciais
  workers: process.env.CI ? 1 : 1,

  // Reporter para os resultados dos testes
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  // Configurações compartilhadas para todos os testes
  use: {
    // URL base da aplicação
    // Em desenvolvimento NGINX: http://localhost:9080/crm
    // Em desenvolvimento Vite: http://localhost:3000
    // Em staging: https://localhost:9443
    // Em produção: https://crm.durvalcrm.org
    baseURL: process.env.BASE_URL || 'http://localhost:9080/crm',

    // Capturar screenshots apenas em falhas
    screenshot: 'only-on-failure',

    // Capturar vídeo apenas em tentativas de retry
    video: 'retain-on-failure',

    // Trace detalhado em caso de falha
    trace: 'on-first-retry',

    // Timeout para ações individuais (15 segundos - aumentado para WildFly)
    actionTimeout: 15 * 1000,

    // Timeout para navegação (20 segundos)
    navigationTimeout: 20 * 1000,

    // Aceitar certificados HTTPS inválidos (para ambiente de desenvolvimento)
    ignoreHTTPSErrors: true,
  },

  // Configuração de projetos (navegadores)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Descomente para testar em outros navegadores
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Testes mobile
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Servidor de desenvolvimento (opcional)
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
