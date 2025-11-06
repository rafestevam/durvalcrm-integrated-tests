import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';
import { NavigationHelper } from '../helpers/navigation.helper';
import { SelectorHelper, SELECTORS } from '../helpers/selector.helper';
import { criarAssociadoUnico } from '../fixtures/associados.fixture';

/**
 * CRUD Completo - Associados
 *
 * Testa as operações básicas de Create, Read, Update e Delete
 * para o módulo de Associados do DurvalCRM.
 *
 * Funcionalidades testadas:
 * - Criação de associado com dados completos
 * - Criação de associado com dados mínimos
 * - Listagem e busca de associados
 * - Visualização de detalhes do associado
 * - Atualização de dados cadastrais
 * - Inativação de associado (soft delete)
 * - Validações de campos obrigatórios
 * - Validação de CPF único
 */

test.describe('CRUD - Associados', () => {
  let authHelper: AuthHelper;
  let navHelper: NavigationHelper;
  let selectorHelper: SelectorHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    navHelper = new NavigationHelper(page);
    selectorHelper = new SelectorHelper(page);

    // Fazer login antes de cada teste
    await authHelper.login();
  });

  /**
   * Helper: Aguarda e clica no botão adicionar associado
   */
  async function clickAdicionarAssociado(page: any) {
    await page.waitForSelector('#associado-adicionar', { state: 'visible', timeout: 15000 });
    await page.click('#associado-adicionar');
    await page.waitForSelector('#associado-nome-completo', { state: 'visible', timeout: 15000 });
  }

  test.describe('CREATE - Criação de Associado', () => {
    test('Deve permitir cadastrar associado com dados completos', async ({ page }) => {
      // Arrange
      const associado = criarAssociadoUnico({
        nomeCompleto: 'João da Silva Teste CRUD',
        telefone: '(11) 98765-4321'
      });

      // Act - Navegar para cadastro de associado
      await navHelper.goToAssociados();
      await clickAdicionarAssociado(page);

      // Preencher todos os campos disponíveis
      await page.fill('#associado-nome-completo', associado.nomeCompleto);
      await page.fill('#associado-cpf', associado.cpf);
      await page.fill('#associado-email', associado.email);
      await page.fill('#associado-telefone', associado.telefone);

      // Salvar
      await page.waitForSelector('#associado-form-salvar', { state: 'visible' });
      await page.click('#associado-form-salvar');

      // Assert - Aguardar modal fechar (indicação de sucesso)
      await page.waitForTimeout(2000);

      // Verificar que o associado aparece na listagem
      await navHelper.goToAssociados();
      await page.waitForTimeout(1000);
      await expect(page.locator(`text=${associado.nomeCompleto}`).first()).toBeVisible();
    });

    test('Deve permitir cadastrar associado sem telefone (campo opcional)', async ({ page }) => {
      // Arrange
      const timestamp = Date.now();
      const associado = criarAssociadoUnico({
        nomeCompleto: `Maria Sem Tel ${timestamp}`
      });

      // Act
      await navHelper.goToAssociados();
      await clickAdicionarAssociado(page);

      // Preencher apenas campos obrigatórios (sem telefone)
      await page.fill('#associado-nome-completo', associado.nomeCompleto);
      await page.fill('#associado-cpf', associado.cpf);
      await page.fill('#associado-email', associado.email);

      await page.click('#associado-form-salvar');

      // Assert - Aguardar modal fechar
      await page.waitForTimeout(2000);

      await navHelper.goToAssociados();
      await page.waitForTimeout(1000);
      await expect(page.locator(`text=${associado.nomeCompleto}`).first()).toBeVisible();
    });

    test('Deve validar campos obrigatórios', async ({ page }) => {
      // Act
      await navHelper.goToAssociados();
      await clickAdicionarAssociado(page);

      // Tentar salvar sem preencher nada
      await page.click('#associado-form-salvar');

      // Assert - Aguardar um pouco para validações aparecerem
      await page.waitForTimeout(500);

      // Verificar que há mensagens de erro (forma-error class)
      const errors = await page.locator('.form-error').count();
      expect(errors).toBeGreaterThan(0);
    });

    test('Deve validar CPF único (não permitir duplicação)', async ({ page }) => {
      // Arrange - Criar primeiro associado
      const associado1 = criarAssociadoUnico({ nomeCompleto: 'Primeiro Associado' });

      await navHelper.goToAssociados();
      await clickAdicionarAssociado(page);

      await page.fill('#associado-nome-completo', associado1.nomeCompleto);
      await page.fill('#associado-cpf', associado1.cpf);
      await page.fill('#associado-email', associado1.email);
      await page.fill('#associado-telefone', associado1.telefone);

      await page.click('#associado-form-salvar');
      await page.waitForTimeout(2000);

      // Act - Tentar criar segundo associado com mesmo CPF
      await navHelper.goToAssociados();
      await clickAdicionarAssociado(page);

      const associado2 = criarAssociadoUnico({ nomeCompleto: 'Segundo Associado' });
      await page.fill('#associado-nome-completo', associado2.nomeCompleto);
      await page.fill('#associado-cpf', associado1.cpf); // Mesmo CPF!
      await page.fill('#associado-email', associado2.email);
      await page.fill('#associado-telefone', associado2.telefone);

      await page.click('#associado-form-salvar');

      // Assert - Aguardar e verificar erro de CPF duplicado
      await page.waitForTimeout(1000);

      // Verificar se há mensagem de erro sobre CPF já cadastrado
      const cpfError = await page.locator('.form-error:has-text("CPF já")').count();
      expect(cpfError).toBeGreaterThan(0);
    });
  });

  test.describe('READ - Leitura e Listagem de Associados', () => {
    test.skip('Deve listar todos os associados ativos', async ({ page }) => {
      // Arrange - Criar alguns associados
      const timestamp = Date.now();
      const associados = [
        criarAssociadoUnico({ nomeCompleto: `Associado Lista ${timestamp}-1` }),
        criarAssociadoUnico({ nomeCompleto: `Associado Lista ${timestamp}-2` }),
        criarAssociadoUnico({ nomeCompleto: `Associado Lista ${timestamp}-3` })
      ];

      for (const associado of associados) {
        await navHelper.goToAssociados();
        await clickAdicionarAssociado(page);

        await page.fill('#associado-nome-completo', associado.nomeCompleto);
        await page.fill('#associado-cpf', associado.cpf);
        await page.fill('#associado-email', associado.email);
        await page.fill('#associado-telefone', associado.telefone);

        await page.click('#associado-form-salvar');
        await page.waitForTimeout(2000);
      }

      // Act - Ir para listagem
      await navHelper.goToAssociados();
      await page.waitForTimeout(1000);

      // Assert - Verificar que todos aparecem (usando first() para evitar strict mode)
      for (const associado of associados) {
        await expect(page.locator(`text=${associado.nomeCompleto}`).first()).toBeVisible();
      }
    });

    test('Deve permitir buscar associado por nome', async ({ page }) => {
      // Arrange - Criar associado com nome único
      const timestamp = Date.now();
      const associado = criarAssociadoUnico({ nomeCompleto: `Busca ${timestamp} XYZ` });

      await navHelper.goToAssociados();
      await clickAdicionarAssociado(page);

      await page.fill('#associado-nome-completo', associado.nomeCompleto);
      await page.fill('#associado-cpf', associado.cpf);
      await page.fill('#associado-email', associado.email);
      await page.fill('#associado-telefone', associado.telefone);

      await page.click('#associado-form-salvar');
      await page.waitForTimeout(2000);

      // Act - Buscar por nome (a busca é feita automaticamente ao digitar)
      await navHelper.goToAssociados();
      await page.fill('#associado-buscar', String(timestamp));
      await page.waitForTimeout(500);

      // Assert
      await expect(page.locator(`text=${associado.nomeCompleto}`).first()).toBeVisible();
    });
  });

  test.describe('UPDATE - Atualização de Associado', () => {
    test('Deve permitir editar dados do associado', async ({ page }) => {
      // Arrange - Criar associado
      const timestamp = Date.now();
      const associadoOriginal = criarAssociadoUnico({
        nomeCompleto: `Original ${timestamp}`,
        telefone: '(11) 91111-1111'
      });

      await navHelper.goToAssociados();
      await clickAdicionarAssociado(page);

      await page.fill('#associado-nome-completo', associadoOriginal.nomeCompleto);
      await page.fill('#associado-cpf', associadoOriginal.cpf);
      await page.fill('#associado-email', associadoOriginal.email);
      await page.fill('#associado-telefone', associadoOriginal.telefone);

      await page.click('#associado-form-salvar');
      await page.waitForTimeout(2000);

      // Act - Editar associado
      await navHelper.goToAssociados();
      await page.waitForTimeout(1000);

      // Encontrar o botão de editar na tabela (usando texto do botão)
      const editButtons = await page.$$('button:has-text("Editar")');
      if (editButtons.length > 0) {
        await editButtons[0].click();
      }

      await page.waitForSelector('#associado-nome-completo', { state: 'visible', timeout: 5000 });

      const novoNome = `Atualizado ${timestamp}`;
      const novoTelefone = '(11) 92222-2222';
      const novoEmail = `atualizado.${timestamp}@teste.com`;

      // Limpar e preencher novos valores
      await page.fill('#associado-nome-completo', novoNome);
      await page.fill('#associado-telefone', novoTelefone);
      await page.fill('#associado-email', novoEmail);

      await page.click('#associado-form-salvar');
      await page.waitForTimeout(2000);

      // Assert - Verificar que os dados foram atualizados
      await navHelper.goToAssociados();
      await page.waitForTimeout(1000);
      await expect(page.locator(`text=${novoNome}`).first()).toBeVisible();
    });
  });

  test.describe('DELETE - Exclusão de Associado', () => {
    test.skip('Deve permitir excluir associado', async ({ page }) => {
      // Arrange - Criar associado com nome único
      const timestamp = Date.now();
      const associado = criarAssociadoUnico({
        nomeCompleto: `Associado Exclusao ${timestamp}`
      });

      await navHelper.goToAssociados();
      await clickAdicionarAssociado(page);

      await page.fill('#associado-nome-completo', associado.nomeCompleto);
      await page.fill('#associado-cpf', associado.cpf);
      await page.fill('#associado-email', associado.email);
      await page.fill('#associado-telefone', associado.telefone);

      await page.click('#associado-form-salvar');
      await page.waitForTimeout(2000);

      // Act - Excluir associado
      await navHelper.goToAssociados();
      await page.waitForTimeout(1000);

      // Registrar handler de dialog ANTES de clicar
      page.once('dialog', async dialog => {
        console.log('[TEST] Dialog appeared:', dialog.message());
        await dialog.accept();
      });

      // Encontrar e clicar no botão de excluir
      const deleteButtons = await page.$$('button:has-text("Excluir")');
      if (deleteButtons.length > 0) {
        await deleteButtons[0].click();
      }

      // Aguardar processamento da exclusão
      await page.waitForTimeout(3000);

      // Assert - Verificar que foi removido da lista
      await navHelper.goToAssociados();
      await page.waitForTimeout(1000);

      // Verificar se o associado não aparece mais
      const associadoVisivel = await page.locator(`text=${associado.nomeCompleto}`).count();
      expect(associadoVisivel).toBe(0);
    });
  });
});
