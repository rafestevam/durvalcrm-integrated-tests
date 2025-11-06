import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';
import { writeFileSync } from 'fs';

/**
 * Teste de Debug - Login
 *
 * Valida o processo de autenticação via Keycloak.
 * Execute com: npm run test:debug-login
 *
 * Processo de login:
 * 1. Acessar http://localhost:9080/crm/login
 * 2. Clicar no botão "Entrar com Keycloak"
 * 3. Preencher credenciais (tesouraria/cairbar@2025)
 * 4. Aguardar redirecionamento
 * 5. Redirecionar para http://localhost:9080/crm/painel
 */

test.describe('Debug - Processo de Login', () => {
  test('Deve realizar login completo e validar processo', async ({ page }) => {
    const authHelper = new AuthHelper(page);

    console.log('='.repeat(80));
    console.log('TESTE DE DEBUG - PROCESSO DE LOGIN');
    console.log('='.repeat(80));

    try {
      // Executar login
      console.log('\n[TESTE] Iniciando processo de login...');
      await authHelper.login();

      console.log('\n[TESTE] ✅ Login executado com sucesso!');

      // Validações
      const urlFinal = page.url();
      console.log(`\n[VALIDAÇÃO] URL final: ${urlFinal}`);

      // Verificar que está em uma página válida
      expect(
        urlFinal.includes('/painel') ||
        urlFinal.includes('/dashboard') ||
        urlFinal.includes('/associados') ||
        urlFinal.includes('/contas')
      ).toBeTruthy();

      console.log('[VALIDAÇÃO] ✅ URL final é válida');

      // Capturar screenshot de sucesso
      await page.screenshot({
        path: 'test-results/debug-login-success.png',
        fullPage: true
      });
      console.log('[VALIDAÇÃO] Screenshot salvo: test-results/debug-login-success.png');

      console.log('\n' + '='.repeat(80));
      console.log('✅ TESTE CONCLUÍDO COM SUCESSO');
      console.log('='.repeat(80));

    } catch (error) {
      console.error('\n[ERRO] Falha no processo de login:', error);

      // Capturar informações de debug
      console.log('\n--- INFORMAÇÕES DE DEBUG ---');
      console.log('URL atual:', page.url());
      console.log('Título da página:', await page.title());

      // Listar inputs visíveis
      console.log('\n--- INPUTS VISÍVEIS NA PÁGINA ---');
      const inputs = await page.locator('input').all();
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const isVisible = await input.isVisible().catch(() => false);
        if (isVisible) {
          const type = await input.getAttribute('type').catch(() => '');
          const name = await input.getAttribute('name').catch(() => '');
          const id = await input.getAttribute('id').catch(() => '');
          console.log(`Input ${i + 1}: type="${type}" name="${name}" id="${id}"`);
        }
      }

      // Listar botões visíveis
      console.log('\n--- BOTÕES VISÍVEIS NA PÁGINA ---');
      const buttons = await page.locator('button').all();
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const isVisible = await button.isVisible().catch(() => false);
        if (isVisible) {
          const text = await button.textContent().catch(() => '');
          const type = await button.getAttribute('type').catch(() => '');
          console.log(`Botão ${i + 1}: text="${text?.trim()}" type="${type}"`);
        }
      }

      // Salvar HTML da página
      const html = await page.content();
      writeFileSync('test-results/debug-login-error-page.html', html);
      console.log('\n[DEBUG] HTML da página salvo: test-results/debug-login-error-page.html');

      console.log('\n' + '='.repeat(80));

      throw error;
    }
  });

  test('Deve verificar conectividade com a aplicação', async ({ page }) => {
    console.log('\n[CONECTIVIDADE] Verificando aplicação...');

    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

    console.log('Status HTTP:', response?.status());
    console.log('URL final:', page.url());

    expect(response?.status()).toBeLessThan(400);
    console.log('✅ Aplicação está acessível');
  });

  test('Deve verificar conectividade com Keycloak', async ({ page }) => {
    console.log('\n[KEYCLOAK] Verificando Keycloak...');

    try {
      const keycloakUrl = 'http://localhost:8080';
      const response = await page.goto(keycloakUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });

      console.log('Status Keycloak:', response?.status());

      expect(response?.status()).toBe(200);
      console.log('✅ Keycloak está acessível');

    } catch (error) {
      console.error('❌ Keycloak não está acessível:', error);
      throw error;
    }
  });

  test('Deve validar credenciais padrão', async ({ page }) => {
    console.log('\n[CREDENCIAIS] Testando credenciais padrão...');

    const authHelper = new AuthHelper(page);

    // Testar com credenciais padrão
    await authHelper.login(); // tesouraria / cairbar@2025

    const urlFinal = page.url();
    console.log('URL após login:', urlFinal);

    expect(urlFinal).toContain('/painel');
    console.log('✅ Login com credenciais padrão funcionou');
  });
});
