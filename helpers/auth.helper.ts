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
   * @param username Nome de usuário
   * @param password Senha
   */
  async login(username: string = 'admin', password: string = 'admin') {
    // Navegar para a página inicial
    await this.page.goto('/');

    // Verificar se já está logado
    const isLoggedIn = await this.page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);

    if (isLoggedIn) {
      console.log('Usuário já está autenticado');
      return;
    }

    // Clicar no botão de login
    await this.page.click('button:has-text("Entrar")');

    // Aguardar redirecionamento para Keycloak
    await this.page.waitForURL(/.*keycloak.*/);

    // Preencher credenciais
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);

    // Clicar no botão de submit
    await this.page.click('button[type="submit"]');

    // Aguardar redirecionamento de volta para a aplicação
    await this.page.waitForURL(/.*\/dashboard.*/);

    // Confirmar que está autenticado
    await this.page.waitForSelector('[data-testid="user-menu"]');
  }

  /**
   * Realiza logout do sistema
   */
  async logout() {
    // Verificar se está logado
    const isLoggedIn = await this.page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);

    if (!isLoggedIn) {
      console.log('Usuário já está deslogado');
      return;
    }

    // Clicar no menu do usuário
    await this.page.click('[data-testid="user-menu"]');

    // Clicar no botão de logout
    await this.page.click('button:has-text("Sair")');

    // Aguardar redirecionamento para página de login
    await this.page.waitForURL(/.*\/(login|$)/);
  }
}
