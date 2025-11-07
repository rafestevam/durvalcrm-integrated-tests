import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';
import { NavigationHelper } from '../../helpers/navigation.helper';
import { SelectorHelper } from '../../helpers/selector.helper';

/**
 * CRUD Completo - Vendas
 *
 * Testa as operações de registro de vendas do DurvalCRM.
 *
 * Funcionalidades testadas:
 * - Registro de vendas (CANTINA, BAZAR, LIVROS)
 * - Formas de pagamento (PIX, Cartão Crédito, Cartão Débito, Dinheiro)
 * - Seleção de conta bancária
 * - Validação de campos obrigatórios
 * - Listagem de vendas recentes
 * - Formatação de valores monetários
 */

test.describe('CRUD - Vendas', () => {
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

  test.describe('CREATE - Registro de Vendas', () => {
    test('Deve permitir registrar venda da cantina com PIX', async ({ page }) => {
      // Arrange
      const venda = {
        descricao: `Lanche ${Date.now()}`,
        valor: '15.50',
        origem: 'CANTINA',
        formaPagamento: 'PIX'
      };

      // Act - Navegar para vendas
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      // Verificar que o formulário está visível
      await expect(page.locator('#venda-descricao')).toBeVisible();

      // Preencher descrição
      await page.fill('#venda-descricao', venda.descricao);

      // Preencher valor
      await page.fill('#venda-valor', venda.valor);

      // Selecionar origem
      await page.click(`#venda-origem-${venda.origem.toLowerCase()}`);

      // Selecionar forma de pagamento
      await page.click(`#venda-forma-pagamento-${venda.formaPagamento.toLowerCase()}`);

      // Aguardar carregamento de contas (se houver)
      await page.waitForTimeout(1000);

      // Submeter formulário
      await page.click('#venda-registrar');

      // Assert - Aguardar sucesso
      await page.waitForTimeout(3000);

      // Verificar que o formulário foi limpo
      const descricaoValue = await page.inputValue('#venda-descricao');
      expect(descricaoValue).toBe('');

      // Verificar que apareceu nas vendas recentes (recarregar para garantir)
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      // Verificar se há vendas na lista
      const vendasRecentes = await page.locator('.bg-gray-50').count();
      expect(vendasRecentes).toBeGreaterThan(0);
    });

    test('Deve permitir registrar venda do bazar com cartão de crédito', async ({ page }) => {
      // Arrange
      const venda = {
        descricao: `Artigo Bazar ${Date.now()}`,
        valor: '25.00',
        origem: 'BAZAR',
        formaPagamento: 'CARTAO_CREDITO'
      };

      // Act
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      await page.fill('#venda-descricao', venda.descricao);
      await page.fill('#venda-valor', venda.valor);
      await page.click(`#venda-origem-${venda.origem.toLowerCase()}`);
      await page.click('#venda-forma-pagamento-cartao-credito');
      await page.waitForTimeout(1000);

      await page.click('#venda-registrar');

      // Assert
      await page.waitForTimeout(3000);

      const descricaoValue = await page.inputValue('#venda-descricao');
      expect(descricaoValue).toBe('');
    });

    test('Deve permitir registrar venda de livros com dinheiro', async ({ page }) => {
      // Arrange
      const venda = {
        descricao: `Livro ${Date.now()}`,
        valor: '35.00',
        origem: 'LIVROS',
        formaPagamento: 'DINHEIRO'
      };

      // Act
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      await page.fill('#venda-descricao', venda.descricao);
      await page.fill('#venda-valor', venda.valor);
      await page.click(`#venda-origem-${venda.origem.toLowerCase()}`);
      await page.click('#venda-forma-pagamento-dinheiro');
      await page.waitForTimeout(1000);

      await page.click('#venda-registrar');

      // Assert
      await page.waitForTimeout(3000);

      const descricaoValue = await page.inputValue('#venda-descricao');
      expect(descricaoValue).toBe('');
    });

    test('Deve permitir registrar venda com cartão de débito', async ({ page }) => {
      // Arrange
      const venda = {
        descricao: `Produto ${Date.now()}`,
        valor: '20.00',
        origem: 'CANTINA',
        formaPagamento: 'CARTAO_DEBITO'
      };

      // Act
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      await page.fill('#venda-descricao', venda.descricao);
      await page.fill('#venda-valor', venda.valor);
      await page.click(`#venda-origem-${venda.origem.toLowerCase()}`);
      await page.click('#venda-forma-pagamento-cartao-debito');
      await page.waitForTimeout(1000);

      await page.click('#venda-registrar');

      // Assert
      await page.waitForTimeout(3000);

      const descricaoValue = await page.inputValue('#venda-descricao');
      expect(descricaoValue).toBe('');
    });
  });

  test.describe('VALIDAÇÕES - Campos Obrigatórios', () => {
    test('Deve validar descrição obrigatória', async ({ page }) => {
      // Act
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      // Preencher apenas alguns campos
      await page.fill('#venda-valor', '10.00');
      await page.click('#venda-origem-cantina');
      await page.click('#venda-forma-pagamento-pix');
      await page.waitForTimeout(1000);

      // Tentar submeter
      await page.click('#venda-registrar');

      // Assert - Verificar que há erro de validação
      await page.waitForTimeout(500);
      const hasError = await page.locator('.form-error').count();
      expect(hasError).toBeGreaterThan(0);
    });

    test('Deve validar valor obrigatório', async ({ page }) => {
      // Act
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      await page.fill('#venda-descricao', 'Teste');
      await page.click('#venda-origem-cantina');
      await page.click('#venda-forma-pagamento-pix');
      await page.waitForTimeout(1000);

      // Tentar submeter sem valor
      await page.click('#venda-registrar');

      // Assert
      await page.waitForTimeout(500);
      const hasError = await page.locator('.form-error').count();
      expect(hasError).toBeGreaterThan(0);
    });

    test('Deve validar origem obrigatória', async ({ page }) => {
      // Act
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      await page.fill('#venda-descricao', 'Teste');
      await page.fill('#venda-valor', '10.00');
      await page.click('#venda-forma-pagamento-pix');
      await page.waitForTimeout(1000);

      // Tentar submeter sem origem
      await page.click('#venda-registrar');

      // Assert
      await page.waitForTimeout(500);
      const hasError = await page.locator('.form-error').count();
      expect(hasError).toBeGreaterThan(0);
    });

    test('Deve validar forma de pagamento obrigatória', async ({ page }) => {
      // Act
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      await page.fill('#venda-descricao', 'Teste');
      await page.fill('#venda-valor', '10.00');
      await page.click('#venda-origem-cantina');

      // Tentar submeter sem forma de pagamento
      await page.click('#venda-registrar');

      // Assert
      await page.waitForTimeout(500);
      const hasError = await page.locator('.form-error').count();
      expect(hasError).toBeGreaterThan(0);
    });

    test('Não deve aceitar valor negativo', async ({ page }) => {
      // Act
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      await page.fill('#venda-descricao', 'Teste');
      await page.fill('#venda-valor', '-10.00');
      await page.click('#venda-origem-cantina');
      await page.click('#venda-forma-pagamento-pix');
      await page.waitForTimeout(1000);

      // Tentar submeter
      await page.click('#venda-registrar');

      // Assert
      await page.waitForTimeout(500);
      const hasError = await page.locator('.form-error').count();
      expect(hasError).toBeGreaterThan(0);
    });

    test('Não deve aceitar valor zero', async ({ page }) => {
      // Act
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      await page.fill('#venda-descricao', 'Teste');
      await page.fill('#venda-valor', '0');
      await page.click('#venda-origem-cantina');
      await page.click('#venda-forma-pagamento-pix');
      await page.waitForTimeout(1000);

      // Tentar submeter
      await page.click('#venda-registrar');

      // Assert
      await page.waitForTimeout(500);
      const hasError = await page.locator('.form-error').count();
      expect(hasError).toBeGreaterThan(0);
    });
  });

  test.describe('UI - Interface e Elementos', () => {
    test('Deve exibir todos os botões de origem', async ({ page }) => {
      // Act
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      // Assert - Verificar que todos os 3 botões de origem estão visíveis
      await expect(page.locator('#venda-origem-cantina')).toBeVisible();
      await expect(page.locator('#venda-origem-bazar')).toBeVisible();
      await expect(page.locator('#venda-origem-livros')).toBeVisible();
    });

    test('Deve exibir todos os botões de forma de pagamento', async ({ page }) => {
      // Act
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      // Assert - Verificar que todos os 4 botões de pagamento estão visíveis
      await expect(page.locator('#venda-forma-pagamento-pix')).toBeVisible();
      await expect(page.locator('#venda-forma-pagamento-cartao-credito')).toBeVisible();
      await expect(page.locator('#venda-forma-pagamento-cartao-debito')).toBeVisible();
      await expect(page.locator('#venda-forma-pagamento-dinheiro')).toBeVisible();
    });

    test('Deve destacar botão de origem selecionado', async ({ page }) => {
      // Act
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      // Clicar em CANTINA
      await page.click('#venda-origem-cantina');

      // Assert - Verificar que o botão tem a classe de selecionado
      const cantinaButton = page.locator('#venda-origem-cantina');
      const classValue = await cantinaButton.getAttribute('class');
      expect(classValue).toContain('border-primary-500');
    });

    test('Deve destacar botão de forma de pagamento selecionado', async ({ page }) => {
      // Act
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      // Clicar em PIX
      await page.click('#venda-forma-pagamento-pix');

      // Assert
      const pixButton = page.locator('#venda-forma-pagamento-pix');
      const classValue = await pixButton.getAttribute('class');
      expect(classValue).toContain('border-primary-500');
    });

    test('Deve exibir campo de conta bancária após selecionar forma de pagamento', async ({ page }) => {
      // Act
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      // Selecionar forma de pagamento
      await page.click('#venda-forma-pagamento-pix');
      await page.waitForTimeout(1500);

      // Assert - Verificar se o select de conta bancária aparece (ou mensagem de alerta)
      const contaSelect = await page.locator('#venda-conta-bancaria').count();
      const alertaContas = await page.locator('.bg-yellow-50').count();

      // Um dos dois deve estar visível
      expect(contaSelect + alertaContas).toBeGreaterThan(0);
    });
  });

  test.describe('READ - Listagem de Vendas Recentes', () => {
    test('Deve exibir seção de vendas recentes', async ({ page }) => {
      // Act
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      // Assert
      await expect(page.locator('text=Vendas Recentes')).toBeVisible();
    });

    test('Deve exibir mensagem quando não há vendas', async ({ page }) => {
      // Act
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      // Assert - Verificar se há vendas ou mensagem de vazio
      const hasVendas = await page.locator('.bg-gray-50').count();
      const emptyMessage = await page.locator('text=Nenhuma venda registrada').count();

      // Um dos dois deve existir
      expect(hasVendas > 0 || emptyMessage > 0).toBeTruthy();
    });

    test('Deve exibir vendas com formatação correta', async ({ page }) => {
      // Arrange - Registrar uma venda primeiro
      const venda = {
        descricao: `Teste Formato ${Date.now()}`,
        valor: '12.50',
        origem: 'CANTINA',
        formaPagamento: 'PIX'
      };

      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      await page.fill('#venda-descricao', venda.descricao);
      await page.fill('#venda-valor', venda.valor);
      await page.click(`#venda-origem-${venda.origem.toLowerCase()}`);
      await page.click(`#venda-forma-pagamento-${venda.formaPagamento.toLowerCase()}`);
      await page.waitForTimeout(1000);
      await page.click('#venda-registrar');
      await page.waitForTimeout(3000);

      // Act - Recarregar
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      // Assert - Verificar formatação monetária (R$ X,XX)
      const pageContent = await page.textContent('.bg-gray-50');
      if (pageContent) {
        expect(pageContent).toMatch(/R\$\s*\d+,\d{2}/);
      }
    });
  });

  test.describe('FUNCIONAMENTO - Fluxo Completo', () => {
    test('Deve completar fluxo completo de registro de venda', async ({ page }) => {
      // Arrange
      const venda = {
        descricao: `Venda Completa ${Date.now()}`,
        valor: '99.99',
        origem: 'BAZAR',
        formaPagamento: 'CARTAO_CREDITO'
      };

      // Act - Passo 1: Navegar
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);

      // Passo 2: Verificar formulário inicial
      await expect(page.locator('#venda-descricao')).toBeVisible();
      await expect(page.locator('#venda-registrar')).toBeVisible();

      // Passo 3: Preencher formulário
      await page.fill('#venda-descricao', venda.descricao);
      await page.fill('#venda-valor', venda.valor);

      // Passo 4: Selecionar origem
      await page.click(`#venda-origem-${venda.origem.toLowerCase()}`);
      const origemSelected = await page.locator(`#venda-origem-${venda.origem.toLowerCase()}`).getAttribute('class');
      expect(origemSelected).toContain('border-primary-500');

      // Passo 5: Selecionar forma de pagamento
      await page.click('#venda-forma-pagamento-cartao-credito');
      const pagamentoSelected = await page.locator('#venda-forma-pagamento-cartao-credito').getAttribute('class');
      expect(pagamentoSelected).toContain('border-primary-500');

      await page.waitForTimeout(1000);

      // Passo 6: Verificar botão habilitado
      const botaoDisabled = await page.locator('#venda-registrar').isDisabled();
      expect(botaoDisabled).toBe(false);

      // Passo 7: Submeter
      await page.click('#venda-registrar');
      await page.waitForTimeout(3000);

      // Passo 8: Verificar limpeza do formulário
      const descricaoLimpa = await page.inputValue('#venda-descricao');
      const valorLimpo = await page.inputValue('#venda-valor');
      expect(descricaoLimpa).toBe('');
      expect(valorLimpo).toBe('');

      // Assert final - Verificar que a venda aparece nas recentes
      await navHelper.goToVendas();
      await page.waitForTimeout(1000);
      const vendasCount = await page.locator('.bg-gray-50').count();
      expect(vendasCount).toBeGreaterThan(0);
    });
  });
});
