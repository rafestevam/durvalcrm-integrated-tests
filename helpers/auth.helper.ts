import { Page } from '@playwright/test';

/**
 * Helper para autenticação no DurvalCRM via Keycloak
 *
 * O sistema usa OAuth2/OIDC PKCE flow com Keycloak.
 *
 * Processo de login:
 * 1. Acessar http://localhost:9080/crm/login
 * 2. Clicar no botão "Entrar com Keycloak"
 * 3. Preencher credenciais no Keycloak
 * 4. Aguardar redirecionamento
 * 5. Redirecionar para http://localhost:9080/crm/painel
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Realiza login no sistema através do Keycloak
   *
   * @param username Nome de usuário (padrão: tesouraria)
   * @param password Senha (padrão: cairbar@2025)
   */
  async login(username: string = 'tesouraria', password: string = 'cairbar@2025') {
    console.log(`[AUTH] Iniciando processo de login com usuário: ${username}`);

    try {
      // 1. Acessar página de login
      console.log('[AUTH] Passo 1: Acessando /login');
      await this.page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await this.page.waitForTimeout(1000);

      const currentUrl = this.page.url();
      console.log(`[AUTH] URL atual: ${currentUrl}`);

      // Verificar se já está autenticado (redirecionou para /painel)
      if (currentUrl.includes('/painel')) {
        console.log('[AUTH] ✅ Usuário já está autenticado - na página /painel');
        return;
      }

      // 2. Clicar no botão "Entrar com Keycloak"
      console.log('[AUTH] Passo 2: Procurando botão "Entrar com Keycloak"');

      const botaoKeycloak = await this.encontrarBotaoKeycloak();

      if (botaoKeycloak) {
        console.log('[AUTH] Botão "Entrar com Keycloak" encontrado, clicando...');
        await botaoKeycloak.click();

        // Aguardar redirecionamento para Keycloak
        console.log('[AUTH] Passo 3: Aguardando redirecionamento para Keycloak...');
        await this.page.waitForTimeout(2000);
      } else {
        console.log('[AUTH] Botão "Entrar com Keycloak" não encontrado, verificando se já está no Keycloak...');
      }

      // 3. Preencher credenciais no Keycloak
      console.log('[AUTH] Passo 4: Preenchendo credenciais no Keycloak');
      await this.preencherCredenciaisKeycloak(username, password);

      // 4. Aguardar redirecionamento de volta para a aplicação
      console.log('[AUTH] Passo 5: Aguardando redirecionamento para /painel');
      await this.aguardarRedirecionamentoPainel();

      console.log('[AUTH] ✅ Login concluído com sucesso!');
      console.log(`[AUTH] URL final: ${this.page.url()}`);

    } catch (error) {
      console.error('[AUTH] ❌ Erro durante o login:', error);

      // Capturar screenshot para debug
      const timestamp = Date.now();
      const screenshotPath = `test-results/login-error-${timestamp}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });

      console.log(`[AUTH] Screenshot de erro salvo em: ${screenshotPath}`);
      console.log(`[AUTH] URL no momento do erro: ${this.page.url()}`);
      console.log(`[AUTH] Título da página: ${await this.page.title()}`);

      throw error;
    }
  }

  /**
   * Procura pelo botão "Entrar com Keycloak" na página
   */
  private async encontrarBotaoKeycloak() {
    const seletoresPossiveis = [
      'button:has-text("Entrar com Keycloak")',
      'button:has-text("Entrar")',
      'a:has-text("Entrar com Keycloak")',
      'a:has-text("Entrar")',
      '[data-testid="btn-login-keycloak"]',
      '[data-testid="btn-login"]',
      'button[type="button"]:has-text("Entrar")'
    ];

    for (const seletor of seletoresPossiveis) {
      try {
        const elemento = this.page.locator(seletor).first();
        const isVisible = await elemento.isVisible({ timeout: 2000 });

        if (isVisible) {
          console.log(`[AUTH] Botão encontrado com seletor: ${seletor}`);
          return elemento;
        }
      } catch (e) {
        // Continuar tentando próximo seletor
      }
    }

    return null;
  }

  /**
   * Preenche as credenciais na página do Keycloak
   */
  private async preencherCredenciaisKeycloak(username: string, password: string) {
    // Aguardar a página do Keycloak carregar
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(500);

    // Preencher username
    console.log('[AUTH] Preenchendo username...');
    const usernameSelectors = [
      'input[name="username"]',
      'input[id="username"]',
      'input[type="text"]',
      '#username'
    ];

    let usernameFilled = false;
    for (const selector of usernameSelectors) {
      try {
        const field = this.page.locator(selector).first();
        if (await field.isVisible({ timeout: 2000 })) {
          await field.fill(username);
          console.log(`[AUTH] Username preenchido usando: ${selector}`);
          usernameFilled = true;
          break;
        }
      } catch (e) {
        // Tentar próximo seletor
      }
    }

    if (!usernameFilled) {
      throw new Error('Campo de username não encontrado na página do Keycloak');
    }

    // Preencher password
    console.log('[AUTH] Preenchendo password...');
    const passwordSelectors = [
      'input[name="password"]',
      'input[id="password"]',
      'input[type="password"]',
      '#password'
    ];

    let passwordFilled = false;
    for (const selector of passwordSelectors) {
      try {
        const field = this.page.locator(selector).first();
        if (await field.isVisible({ timeout: 2000 })) {
          await field.fill(password);
          console.log(`[AUTH] Password preenchido usando: ${selector}`);
          passwordFilled = true;
          break;
        }
      } catch (e) {
        // Tentar próximo seletor
      }
    }

    if (!passwordFilled) {
      throw new Error('Campo de password não encontrado na página do Keycloak');
    }

    // Clicar no botão de submit
    console.log('[AUTH] Clicando no botão de submit...');
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button[name="login"]',
      '#kc-login',
      'button:has-text("Entrar")',
      'button:has-text("Sign In")',
      'button:has-text("Login")'
    ];

    let submitClicked = false;
    for (const selector of submitSelectors) {
      try {
        const button = this.page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          await button.click();
          console.log(`[AUTH] Submit clicado usando: ${selector}`);
          submitClicked = true;
          break;
        }
      } catch (e) {
        // Tentar próximo seletor
      }
    }

    if (!submitClicked) {
      throw new Error('Botão de submit não encontrado na página do Keycloak');
    }

    console.log('[AUTH] Credenciais submetidas com sucesso');
  }

  /**
   * Aguarda o redirecionamento para /painel após login bem-sucedido
   */
  private async aguardarRedirecionamentoPainel() {
    try {
      // Aguardar URL conter /painel, /dashboard, ou outras páginas internas
      await this.page.waitForURL(/.*\/(painel|dashboard|associados|contas|mensalidades).*/, {
        timeout: 20000
      });

      console.log('[AUTH] ✅ Redirecionamento detectado para:', this.page.url());

      // Aguardar página carregar completamente
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });

      // Tentar aguardar networkidle, mas não falhar se der timeout
      await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
        console.log('[AUTH] ⚠️  Timeout aguardando networkidle, mas continuando...');
      });

    } catch (error) {
      console.error('[AUTH] ❌ Erro aguardando redirecionamento:', error);
      console.log('[AUTH] URL atual:', this.page.url());

      // Verificar se há mensagem de erro no Keycloak
      const errorMsg = await this.page.locator('.alert-error, .error, .alert-danger, .kc-feedback-text')
        .textContent()
        .catch(() => '');

      if (errorMsg) {
        console.error('[AUTH] Mensagem de erro encontrada:', errorMsg);
      }

      throw error;
    }
  }

  /**
   * Realiza logout do sistema
   */
  async logout() {
    console.log('[AUTH] Iniciando logout...');

    const currentUrl = this.page.url();

    // Verificar se está em uma página interna
    if (!currentUrl.includes('/painel') &&
        !currentUrl.includes('/dashboard') &&
        !currentUrl.includes('/associados') &&
        !currentUrl.includes('/contas')) {
      console.log('[AUTH] Usuário já está deslogado');
      return;
    }

    // Procurar pelo menu do usuário
    const userMenuSelectors = [
      '[data-testid="user-menu"]',
      '[data-testid="menu-usuario"]',
      'button:has-text("Abrir menu do usuário")',
      '.user-menu',
      '#user-menu'
    ];

    let menuClicked = false;
    for (const selector of userMenuSelectors) {
      try {
        const menu = this.page.locator(selector).first();
        if (await menu.isVisible({ timeout: 2000 })) {
          await menu.click();
          console.log(`[AUTH] Menu do usuário aberto usando: ${selector}`);
          menuClicked = true;
          break;
        }
      } catch (e) {
        // Tentar próximo seletor
      }
    }

    if (!menuClicked) {
      console.log('[AUTH] Menu do usuário não encontrado, tentando logout direto...');
      await this.page.goto('/logout').catch(() => {});
      await this.page.waitForURL(/.*\/(login|$).*/, { timeout: 5000 });
      return;
    }

    // Clicar no botão de logout
    const logoutSelectors = [
      'button:has-text("Sair")',
      'a:has-text("Sair")',
      '[data-testid="btn-logout"]',
      'button:has-text("Logout")',
      'a:has-text("Logout")'
    ];

    for (const selector of logoutSelectors) {
      try {
        const button = this.page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          await button.click();
          console.log(`[AUTH] Logout clicado usando: ${selector}`);
          break;
        }
      } catch (e) {
        // Tentar próximo seletor
      }
    }

    // Aguardar redirecionamento para login
    await this.page.waitForURL(/.*\/(login|$).*/, { timeout: 5000 });
    console.log('[AUTH] ✅ Logout concluído');
  }
}
