import { Page } from '@playwright/test';

/**
 * Helper para navegação nas páginas do DurvalCRM
 *
 * Encapsula as rotas e navegação do sistema para facilitar
 * manutenção dos testes quando as rotas mudarem.
 */
export class NavigationHelper {
  constructor(private page: Page) {}

  /**
   * Navega para o Dashboard
   */
  async goToDashboard() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navega para a listagem de Contas Bancárias
   */
  async goToContasBancarias() {
    await this.page.goto('/contas-bancarias');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navega para o cadastro de nova Conta Bancária
   */
  async goToNovaContaBancaria() {
    await this.page.goto('/contas-bancarias/nova');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navega para a listagem de Recebimentos
   */
  async goToRecebimentos() {
    await this.page.goto('/recebimentos');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navega para o registro de novo Recebimento
   */
  async goToNovoRecebimento() {
    await this.page.goto('/recebimentos/novo');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navega para a página de Associados
   */
  async goToAssociados() {
    await this.page.goto('/associados');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navega para a página de Vendas
   */
  async goToVendas() {
    await this.page.goto('/vendas');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Usa o menu de navegação lateral para ir a uma seção
   *
   * @param sectionName Nome da seção no menu
   */
  async navigateByMenu(sectionName: string) {
    // Clicar no item do menu
    await this.page.click(`nav a:has-text("${sectionName}")`);
    await this.page.waitForLoadState('networkidle');
  }
}
