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
    // Navegar para a página de login
    await this.page.goto('/login');

    // Verificar se já está logado (redirect para dashboard)
    const currentUrl = this.page.url();
    if (currentUrl.includes('/dashboard')) {
      console.log('Usuário já está autenticado');
      return;
    }

    // Verificar se existe botão "Entrar" ou se já está na página do Keycloak
    const hasLoginButton = await this.page.locator('button:has-text("Entrar")').isVisible().catch(() => false);

    if (hasLoginButton) {
      // Clicar no botão de login para redirecionar ao Keycloak
      await this.page.click('button:has-text("Entrar")');
      // Aguardar redirecionamento para Keycloak
      await this.page.waitForURL(/.*keycloak.*/, { timeout: 5000 }).catch(() => {});
    }

    // Preencher credenciais no Keycloak
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);

    // Clicar no botão de submit
    await this.page.click('button[type="submit"]');

    // Aguardar redirecionamento de volta para a aplicação
    await this.page.waitForURL(/.*\/dashboard.*/, { timeout: 10000 });

    // Aguardar que a página esteja completamente carregada
    await this.page.waitForLoadState('networkidle');
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
