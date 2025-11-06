import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';
import { writeFileSync } from 'fs';

/**
 * Teste de Debug - Login
 *
 * Este teste ajuda a diagnosticar problemas de autenticação.
 * Execute com: npm run test:debug-login
 */

test.describe('Debug - Login Flow', () => {
  test('Deve realizar login e capturar informações de debug', async ({ page }) => {
    const authHelper = new AuthHelper(page);

    console.log('='.repeat(80));
    console.log('INICIANDO TESTE DE DEBUG - LOGIN');
    console.log('='.repeat(80));

    // Passo 1: Navegar para a página inicial
    console.log('\n[PASSO 1] Navegando para a URL base...');
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    console.log('URL atual:', page.url());
    console.log('Título da página:', await page.title());

    // Capturar screenshot inicial
    await page.screenshot({ path: 'test-results/debug-01-home.png', fullPage: true });
    console.log('Screenshot salvo: test-results/debug-01-home.png');

    // Passo 2: Tentar fazer login
    console.log('\n[PASSO 2] Tentando fazer login...');

    try {
      await authHelper.login();

      console.log('\n[SUCESSO] Login realizado com sucesso!');
      console.log('URL após login:', page.url());
      console.log('Título após login:', await page.title());

      // Capturar screenshot após login
      await page.screenshot({ path: 'test-results/debug-02-after-login.png', fullPage: true });
      console.log('Screenshot salvo: test-results/debug-02-after-login.png');

      // Verificar se está autenticado
      const urlAposLogin = page.url();
      expect(
        urlAposLogin.includes('/painel') ||
        urlAposLogin.includes('/dashboard') ||
        urlAposLogin.includes('/associados') ||
        urlAposLogin.includes('/contas')
      ).toBeTruthy();

      console.log('\n✅ Teste de login passou!');

    } catch (error) {
      console.error('\n[ERRO] Falha no login:', error);

      // Informações de debug adicionais
      console.log('\n--- INFORMAÇÕES DE DEBUG ---');
      console.log('URL final:', page.url());
      console.log('Título final:', await page.title());

      // Listar todos os inputs visíveis
      console.log('\n--- INPUTS VISÍVEIS NA PÁGINA ---');
      const inputs = await page.locator('input').all();
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const isVisible = await input.isVisible().catch(() => false);
        if (isVisible) {
          const name = await input.getAttribute('name').catch(() => '');
          const id = await input.getAttribute('id').catch(() => '');
          const type = await input.getAttribute('type').catch(() => '');
          console.log(`Input ${i}: name="${name}" id="${id}" type="${type}"`);
        }
      }

      // Listar todos os botões visíveis
      console.log('\n--- BOTÕES VISÍVEIS NA PÁGINA ---');
      const buttons = await page.locator('button').all();
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const isVisible = await button.isVisible().catch(() => false);
        if (isVisible) {
          const text = await button.textContent().catch(() => '');
          const type = await button.getAttribute('type').catch(() => '');
          console.log(`Botão ${i}: text="${text.trim()}" type="${type}"`);
        }
      }

      // Capturar HTML da página
      const html = await page.content();
      writeFileSync('test-results/debug-page-content.html', html);
      console.log('\nHTML da página salvo em: test-results/debug-page-content.html');

      console.log('='.repeat(80));

      throw error;
    }
  });

  test('Deve verificar conectividade com a aplicação', async ({ page }) => {
    console.log('\n[CONECTIVIDADE] Verificando se a aplicação está acessível...');

    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

    console.log('Status HTTP:', response?.status());
    console.log('URL final:', page.url());
    console.log('Headers:', await response?.allHeaders());

    expect(response?.status()).toBeLessThan(400);
  });

  test('Deve verificar se Keycloak está acessível', async ({ page }) => {
    console.log('\n[KEYCLOAK] Verificando se o Keycloak está acessível...');

    try {
      // Tentar acessar o Keycloak diretamente
      const keycloakUrl = 'http://localhost:8080';
      const response = await page.goto(keycloakUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });

      console.log('Keycloak Status:', response?.status());
      console.log('Keycloak URL:', page.url());

      if (response?.status() === 200) {
        console.log('✅ Keycloak está acessível');
      } else {
        console.log('⚠️ Keycloak respondeu com status:', response?.status());
      }
    } catch (error) {
      console.error('❌ Erro ao acessar Keycloak:', error);
      throw new Error('Keycloak não está acessível em http://localhost:8080');
    }
  });
});
