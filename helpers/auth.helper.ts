import { Page } from '@playwright/test';

/**
 * Helper para autenticação no DurvalCRM via Keycloak
 *
 * O sistema usa OAuth2/OIDC PKCE flow com Keycloak.
 * Este helper encapsula a lógica de login para reutilização nos testes.
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
    console.log(`[AUTH] Iniciando login com usuário: ${username}`);

    try {
      // Navegar para a página de login
      console.log('[AUTH] Navegando para /login');
      await this.page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 15000 });

      // Aguardar um pouco para a página carregar
      await this.page.waitForTimeout(1000);

      // Verificar URL atual
      const currentUrl = this.page.url();
      console.log(`[AUTH] URL atual: ${currentUrl}`);

      // Verificar se já está logado (redirect para dashboard)
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/associados')) {
        console.log('[AUTH] Usuário já está autenticado - redirecionado para área logada');
        return;
      }

      // Tentar diferentes estratégias de login baseado no que encontramos na página

      // Estratégia 1: Verificar se já está na página do Keycloak
      const isKeycloakPage = currentUrl.includes('keycloak') ||
                            await this.page.locator('#kc-form-login').isVisible().catch(() => false) ||
                            await this.page.locator('.login-pf-page').isVisible().catch(() => false);

      if (isKeycloakPage) {
        console.log('[AUTH] Já está na página do Keycloak');
        await this.fillKeycloakCredentials(username, password);
        await this.waitForLoginSuccess();
        return;
      }

      // Estratégia 2: Procurar por botão "Entrar" na página da aplicação
      console.log('[AUTH] Procurando botão de login na aplicação');
      const loginButton = await this.findLoginButton();

      if (loginButton) {
        console.log('[AUTH] Botão de login encontrado, clicando...');
        await loginButton.click();

        // Aguardar redirecionamento para Keycloak
        console.log('[AUTH] Aguardando redirecionamento para Keycloak...');
        await this.page.waitForURL(/.*keycloak.*/, { timeout: 10000 }).catch(async () => {
          // Se não redirecionou para keycloak, pode já estar na página de login do keycloak
          console.log('[AUTH] Não detectou redirect para Keycloak, verificando se já está lá...');
          await this.page.waitForTimeout(1000);
        });

        await this.fillKeycloakCredentials(username, password);
        await this.waitForLoginSuccess();
        return;
      }

      // Estratégia 3: Pode ser que a página já mostre os campos de login diretamente
      console.log('[AUTH] Tentando preencher credenciais diretamente (sem botão)');
      await this.fillKeycloakCredentials(username, password);
      await this.waitForLoginSuccess();

    } catch (error) {
      console.error('[AUTH] Erro durante o login:', error);

      // Capturar screenshot para debug
      const timestamp = Date.now();
      await this.page.screenshot({
        path: `test-results/login-error-${timestamp}.png`,
        fullPage: true
      });

      console.log(`[AUTH] Screenshot salvo em: test-results/login-error-${timestamp}.png`);
      console.log(`[AUTH] URL atual no erro: ${this.page.url()}`);
      console.log(`[AUTH] Título da página: ${await this.page.title()}`);

      throw error;
    }
  }

  /**
   * Procura por um botão de login na página
   */
  private async findLoginButton() {
    // Tentar vários seletores possíveis para o botão de login
    const selectors = [
      'button:has-text("Entrar")',
      'button:has-text("Login")',
      'a:has-text("Entrar")',
      '[data-testid="btn-login"]',
      'button[type="button"]:has-text("Entrar")',
      '.btn-login',
      '#login-button'
    ];

    for (const selector of selectors) {
      const element = this.page.locator(selector).first();
      const isVisible = await element.isVisible().catch(() => false);

      if (isVisible) {
        console.log(`[AUTH] Botão de login encontrado com seletor: ${selector}`);
        return element;
      }
    }

    console.log('[AUTH] Nenhum botão de login encontrado');
    return null;
  }

  /**
   * Preenche as credenciais na página do Keycloak
   */
  private async fillKeycloakCredentials(username: string, password: string) {
    console.log('[AUTH] Preenchendo credenciais no Keycloak');

    // Aguardar a página carregar completamente
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(500);

    // Tentar diferentes seletores para o campo de username
    const usernameSelectors = [
      'input[name="username"]',
      'input[id="username"]',
      'input[type="text"]',
      '#username',
      'input.form-control[name="username"]'
    ];

    let usernameFilled = false;
    for (const selector of usernameSelectors) {
      try {
        const field = this.page.locator(selector).first();
        if (await field.isVisible({ timeout: 2000 })) {
          console.log(`[AUTH] Campo username encontrado: ${selector}`);
          await field.fill(username);
          usernameFilled = true;
          break;
        }
      } catch (e) {
        // Tentar próximo seletor
      }
    }

    if (!usernameFilled) {
      throw new Error('Campo de username não encontrado');
    }

    // Tentar diferentes seletores para o campo de password
    const passwordSelectors = [
      'input[name="password"]',
      'input[id="password"]',
      'input[type="password"]',
      '#password',
      'input.form-control[name="password"]'
    ];

    let passwordFilled = false;
    for (const selector of passwordSelectors) {
      try {
        const field = this.page.locator(selector).first();
        if (await field.isVisible({ timeout: 2000 })) {
          console.log(`[AUTH] Campo password encontrado: ${selector}`);
          await field.fill(password);
          passwordFilled = true;
          break;
        }
      } catch (e) {
        // Tentar próximo seletor
      }
    }

    if (!passwordFilled) {
      throw new Error('Campo de password não encontrado');
    }

    // Procurar e clicar no botão de submit
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button[name="login"]',
      '#kc-login',
      'button:has-text("Entrar")',
      'button:has-text("Sign In")',
      'button:has-text("Login")',
      '.btn-primary[type="submit"]'
    ];

    let submitClicked = false;
    for (const selector of submitSelectors) {
      try {
        const button = this.page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          console.log(`[AUTH] Botão submit encontrado: ${selector}`);
          await button.click();
          submitClicked = true;
          break;
        }
      } catch (e) {
        // Tentar próximo seletor
      }
    }

    if (!submitClicked) {
      throw new Error('Botão de submit não encontrado');
    }

    console.log('[AUTH] Credenciais preenchidas e formulário submetido');
  }

  /**
   * Aguarda o login ser bem sucedido
   */
  private async waitForLoginSuccess() {
    console.log('[AUTH] Aguardando login ser concluído...');

    try {
      // Aguardar redirecionamento para a aplicação
      await this.page.waitForURL(/.*\/(dashboard|associados|contas|mensalidades).*/, {
        timeout: 15000
      });

      console.log('[AUTH] Login bem-sucedido! Redirecionado para:', this.page.url());

      // Aguardar que a página esteja completamente carregada
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        console.log('[AUTH] Timeout aguardando networkidle, continuando...');
      });

    } catch (error) {
      console.error('[AUTH] Erro aguardando login concluir:', error);
      console.log('[AUTH] URL atual:', this.page.url());

      // Verificar se há mensagem de erro
      const errorMsg = await this.page.locator('.alert-error, .error, .alert-danger').textContent().catch(() => '');
      if (errorMsg) {
        console.error('[AUTH] Mensagem de erro na página:', errorMsg);
      }

      throw error;
    }
  }

  /**
   * Realiza logout do sistema
   */
  async logout() {
    // Verificar se está na página de dashboard/logado
    const currentUrl = this.page.url();

    if (!currentUrl.includes('/dashboard') && !currentUrl.includes('/associados') && !currentUrl.includes('/contas')) {
      console.log('Usuário já está deslogado');
      return;
    }

    // Verificar se o menu do usuário está visível
    const hasUserMenu = await this.page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);

    if (!hasUserMenu) {
      // Tentar sair pela navegação direta
      await this.page.goto('/logout').catch(() => {});
      await this.page.waitForURL(/.*\/login.*/, { timeout: 5000 });
      return;
    }

    // Clicar no menu do usuário
    await this.page.click('[data-testid="user-menu"]');

    // Clicar no botão de logout
    await this.page.click('button:has-text("Sair")');

    // Aguardar redirecionamento para página de login
    await this.page.waitForURL(/.*\/login.*/, { timeout: 5000 });
  }
}
