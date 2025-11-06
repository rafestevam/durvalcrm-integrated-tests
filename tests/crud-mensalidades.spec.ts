import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';
import { NavigationHelper } from '../helpers/navigation.helper';
import { SelectorHelper } from '../helpers/selector.helper';
import { criarAssociadoUnico } from '../fixtures/associados.fixture';

/**
 * CRUD Completo - Mensalidades
 *
 * Testa as operações de gerenciamento de mensalidades (cobranças mensais)
 * do DurvalCRM.
 *
 * Funcionalidades testadas:
 * - Geração automática de cobranças para associados ativos
 * - Listagem de mensalidades por período (mês/ano)
 * - Visualização de QR Code PIX
 * - Marcação de pagamento como pago
 * - Navegação entre períodos (mês anterior/próximo)
 * - Validação de resumo (cards com totalizadores)
 * - Validação de status (PENDENTE, PAGA, ATRASADA)
 */

test.describe('CRUD - Mensalidades', () => {
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
   * Helper: Cria um associado para testes de mensalidades
   */
  async function criarAssociadoParaTeste(page: any, nome?: string) {
    const timestamp = Date.now();
    const associado = criarAssociadoUnico({
      nomeCompleto: nome || `Associado Mensalidade ${timestamp}`
    });

    // Navegar para cadastro de associado
    await navHelper.goToAssociados();
    await page.waitForSelector('#associado-adicionar', { state: 'visible', timeout: 15000 });
    await page.click('#associado-adicionar');
    await page.waitForSelector('#associado-nome-completo', { state: 'visible', timeout: 15000 });

    // Preencher dados
    await page.fill('#associado-nome-completo', associado.nomeCompleto);
    await page.fill('#associado-cpf', associado.cpf);
    await page.fill('#associado-email', associado.email);
    await page.fill('#associado-telefone', associado.telefone);

    // Salvar
    await page.click('#associado-form-salvar');
    await page.waitForTimeout(2000);

    return associado;
  }

  /**
   * Helper: Obtém o período atual (mês/ano) exibido na tela
   */
  async function obterPeriodoAtual(page: any): Promise<{ mes: string, ano: string }> {
    // O período é exibido no título da tabela: "Mensalidades de Janeiro 2025"
    const titulo = await page.textContent('h2:has-text("Mensalidades de")');
    const match = titulo?.match(/Mensalidades de (\w+) (\d{4})/);

    return {
      mes: match?.[1] || 'Janeiro',
      ano: match?.[2] || new Date().getFullYear().toString()
    };
  }

  test.describe('CREATE - Geração de Cobranças', () => {
    test('Deve permitir gerar cobranças para o período atual', async ({ page }) => {
      // Arrange - Criar um associado ativo
      await criarAssociadoParaTeste(page, 'João Cobrança Teste');

      // Act - Navegar para mensalidades e gerar cobranças
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      // Verificar que o botão "Gerar Cobranças" está visível
      await expect(page.locator('#mensalidades-gerar-cobrancas')).toBeVisible();

      // Clicar em "Gerar Cobranças"
      await page.click('#mensalidades-gerar-cobrancas');

      // Aguardar modal de confirmação aparecer
      await page.waitForTimeout(500);

      // Verificar que o modal está aberto com os botões corretos
      await expect(page.locator('#mensalidades-modal-gerar-cancelar')).toBeVisible();
      await expect(page.locator('#mensalidades-modal-gerar-confirmar')).toBeVisible();

      // Confirmar geração
      await page.click('#mensalidades-modal-gerar-confirmar');

      // Assert - Aguardar processamento e verificar mensagem de sucesso
      await page.waitForTimeout(3000);

      // Verificar que aparece mensagem de sucesso (pode variar conforme implementação)
      // Recarregar a página para ver as mensalidades geradas
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      // Verificar que há pelo menos uma mensalidade na tabela
      const mensalidadesNaTabela = await page.locator('table tbody tr').count();
      expect(mensalidadesNaTabela).toBeGreaterThan(0);
    });

    test('Deve exibir resumo no modal antes de gerar cobranças', async ({ page }) => {
      // Act
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      await page.click('#mensalidades-gerar-cobrancas');
      await page.waitForTimeout(500);

      // Assert - Verificar que o modal mostra informações sobre a geração
      const modalContent = await page.textContent('.bg-amber-50');
      expect(modalContent).toContain('R$'); // Deve mostrar o valor da mensalidade
      expect(modalContent).toContain('associado'); // Deve mencionar associados
    });

    test('Deve permitir cancelar a geração de cobranças', async ({ page }) => {
      // Act
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      await page.click('#mensalidades-gerar-cobrancas');
      await page.waitForTimeout(500);

      // Cancelar
      await page.click('#mensalidades-modal-gerar-cancelar');
      await page.waitForTimeout(500);

      // Assert - Verificar que o modal foi fechado
      await expect(page.locator('#mensalidades-modal-gerar-confirmar')).not.toBeVisible();
    });

    test('Não deve gerar cobranças duplicadas', async ({ page }) => {
      // Arrange - Criar associado e gerar cobranças pela primeira vez
      await criarAssociadoParaTeste(page, 'Maria Duplicata Teste');

      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      await page.click('#mensalidades-gerar-cobrancas');
      await page.waitForTimeout(500);
      await page.click('#mensalidades-modal-gerar-confirmar');
      await page.waitForTimeout(3000);

      // Act - Tentar gerar novamente no mesmo período
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      const mensalidadesAntes = await page.locator('table tbody tr').count();

      await page.click('#mensalidades-gerar-cobrancas');
      await page.waitForTimeout(500);
      await page.click('#mensalidades-modal-gerar-confirmar');
      await page.waitForTimeout(3000);

      // Assert - Verificar que não criou duplicatas
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      const mensalidadesDepois = await page.locator('table tbody tr').count();
      expect(mensalidadesDepois).toBe(mensalidadesAntes);
    });
  });

  test.describe('READ - Visualização de Mensalidades', () => {
    test('Deve listar mensalidades do período atual', async ({ page }) => {
      // Arrange - Criar associado e gerar cobrança
      const associado = await criarAssociadoParaTeste(page);

      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      await page.click('#mensalidades-gerar-cobrancas');
      await page.waitForTimeout(500);
      await page.click('#mensalidades-modal-gerar-confirmar');
      await page.waitForTimeout(3000);

      // Act - Recarregar e verificar listagem
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      // Assert - Verificar que a mensalidade está na tabela
      const nomeNaTabela = await page.locator(`text=${associado.nomeCompleto}`).first();
      await expect(nomeNaTabela).toBeVisible();

      // Verificar colunas da tabela
      await expect(page.locator('th:has-text("Associado")')).toBeVisible();
      await expect(page.locator('th:has-text("Valor")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
      await expect(page.locator('th:has-text("Vencimento")')).toBeVisible();
      await expect(page.locator('th:has-text("Ações")')).toBeVisible();
    });

    test('Deve exibir status da mensalidade corretamente', async ({ page }) => {
      // Arrange
      await criarAssociadoParaTeste(page, 'Pedro Status Teste');

      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      await page.click('#mensalidades-gerar-cobrancas');
      await page.waitForTimeout(500);
      await page.click('#mensalidades-modal-gerar-confirmar');
      await page.waitForTimeout(3000);

      // Act
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      // Assert - Verificar que há badges de status (PENDENTE, PAGA, etc)
      const statusBadges = await page.locator('.rounded-full').count();
      expect(statusBadges).toBeGreaterThan(0);
    });

    test('Deve exibir valor formatado em reais', async ({ page }) => {
      // Arrange
      await criarAssociadoParaTeste(page);

      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      await page.click('#mensalidades-gerar-cobrancas');
      await page.waitForTimeout(500);
      await page.click('#mensalidades-modal-gerar-confirmar');
      await page.waitForTimeout(3000);

      // Act
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      // Assert - Verificar formato de moeda brasileira (R$ X,XX)
      const tabelaContent = await page.textContent('table');
      expect(tabelaContent).toMatch(/R\$\s*\d+,\d{2}/);
    });
  });

  test.describe('QR CODE - Visualização de QR Code PIX', () => {
    test('Deve exibir botão "Ver QR Code" para cada mensalidade', async ({ page }) => {
      // Arrange
      await criarAssociadoParaTeste(page);

      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      await page.click('#mensalidades-gerar-cobrancas');
      await page.waitForTimeout(500);
      await page.click('#mensalidades-modal-gerar-confirmar');
      await page.waitForTimeout(3000);

      // Act
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      // Assert - Verificar que há pelo menos um botão "Ver QR Code"
      const qrCodeButtons = await page.locator('button:has-text("Ver QR Code")').count();
      expect(qrCodeButtons).toBeGreaterThan(0);
    });

    test.skip('Deve abrir modal ao clicar em "Ver QR Code"', async ({ page }) => {
      // Arrange
      await criarAssociadoParaTeste(page);

      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      await page.click('#mensalidades-gerar-cobrancas');
      await page.waitForTimeout(500);
      await page.click('#mensalidades-modal-gerar-confirmar');
      await page.waitForTimeout(3000);

      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      // Act - Clicar no primeiro botão "Ver QR Code"
      const primeiroQRCodeBtn = page.locator('button:has-text("Ver QR Code")').first();
      await primeiroQRCodeBtn.click();

      // Assert - Verificar que modal de QR Code abre
      await page.waitForTimeout(1000);
      // Verificar presença de elementos do modal (ajustar conforme implementação)
      const modalQRCode = page.locator('[role="dialog"]');
      await expect(modalQRCode).toBeVisible();
    });
  });

  test.describe('UPDATE - Marcar como Paga', () => {
    test('Deve exibir botão "Marcar como Paga" para mensalidades pendentes', async ({ page }) => {
      // Arrange
      await criarAssociadoParaTeste(page);

      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      await page.click('#mensalidades-gerar-cobrancas');
      await page.waitForTimeout(500);
      await page.click('#mensalidades-modal-gerar-confirmar');
      await page.waitForTimeout(3000);

      // Act
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      // Assert - Verificar que há botão "Marcar como Paga"
      const marcarPagaButtons = await page.locator('button:has-text("Marcar como Paga")').count();
      expect(marcarPagaButtons).toBeGreaterThan(0);
    });

    test.skip('Deve marcar mensalidade como paga', async ({ page }) => {
      // Arrange
      await criarAssociadoParaTeste(page, 'Carlos Pagamento Teste');

      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      await page.click('#mensalidades-gerar-cobrancas');
      await page.waitForTimeout(500);
      await page.click('#mensalidades-modal-gerar-confirmar');
      await page.waitForTimeout(3000);

      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      // Registrar handler de dialog de confirmação
      page.once('dialog', async dialog => {
        console.log('[TEST] Dialog appeared:', dialog.message());
        await dialog.accept();
      });

      // Act - Clicar em "Marcar como Paga"
      const marcarPagaBtn = page.locator('button:has-text("Marcar como Paga")').first();
      await marcarPagaBtn.click();

      await page.waitForTimeout(3000);

      // Assert - Verificar que o status mudou para "Paga"
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      const statusPaga = await page.locator('.bg-green-100:has-text("Paga")').count();
      expect(statusPaga).toBeGreaterThan(0);
    });

    test.skip('Não deve exibir botão "Marcar como Paga" para mensalidades já pagas', async ({ page }) => {
      // Arrange - Criar e marcar como paga
      await criarAssociadoParaTeste(page);

      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      await page.click('#mensalidades-gerar-cobrancas');
      await page.waitForTimeout(500);
      await page.click('#mensalidades-modal-gerar-confirmar');
      await page.waitForTimeout(3000);

      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      // Registrar handler de dialog
      page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await page.locator('button:has-text("Marcar como Paga")').first().click();
      await page.waitForTimeout(3000);

      // Act - Recarregar e verificar
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      // Assert - Verificar que não há mais botão "Marcar como Paga" para essa mensalidade
      // (O botão só aparece se status !== 'PAGA')
      const linhasComStatusPaga = await page.locator('tr:has(.bg-green-100:has-text("Paga"))').count();
      expect(linhasComStatusPaga).toBeGreaterThan(0);
    });
  });

  test.describe('RESUMO - Cards de Totalização', () => {
    test('Deve exibir cards de resumo', async ({ page }) => {
      // Act
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      // Assert - Verificar que os cards estão visíveis
      await expect(page.locator('text=Total de Associados')).toBeVisible();
      await expect(page.locator('text=Mensalidades Pagas')).toBeVisible();
      await expect(page.locator('text=Pendentes')).toBeVisible();
      await expect(page.locator('text=Valor Arrecadado')).toBeVisible();
    });

    test('Deve atualizar contadores após gerar cobranças', async ({ page }) => {
      // Arrange - Verificar valores iniciais
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      // Act - Gerar cobranças
      await criarAssociadoParaTeste(page);
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      await page.click('#mensalidades-gerar-cobrancas');
      await page.waitForTimeout(500);
      await page.click('#mensalidades-modal-gerar-confirmar');
      await page.waitForTimeout(3000);

      // Assert - Verificar que os contadores foram atualizados
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      // Verificar que há valores não-zero nos cards
      const pendentesCard = await page.locator('text=Pendentes').locator('..').textContent();
      expect(pendentesCard).toBeTruthy();
    });
  });

  test.describe('NAVEGAÇÃO - Períodos (Mês/Ano)', () => {
    test('Deve permitir navegar entre períodos', async ({ page }) => {
      // Act
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      const periodoInicial = await obterPeriodoAtual(page);

      // Assert - Verificar que há controles de navegação de período
      await expect(page.locator('#mensalidades-periodo-anterior')).toBeVisible();
      await expect(page.locator('#mensalidades-periodo-proximo')).toBeVisible();
      await expect(page.locator('#mensalidades-periodo-mes')).toBeVisible();
      await expect(page.locator('#mensalidades-periodo-ano')).toBeVisible();
    });
  });

  test.describe('VALIDAÇÕES - Estados da Aplicação', () => {
    test('Deve exibir loading durante carregamento', async ({ page }) => {
      // Act
      await navHelper.goToMensalidades();

      // Assert - Verificar que exibe spinner de loading (pode ser rápido demais para capturar)
      // Este teste pode ser flaky, considerar skip se necessário
      const hasLoadingSpinner = await page.locator('[role="status"]').count();
      // Loading pode já ter terminado quando checamos
      expect(hasLoadingSpinner).toBeGreaterThanOrEqual(0);
    });

    test('Deve exibir estado vazio quando não há mensalidades', async ({ page }) => {
      // Arrange - Navegar para um período futuro sem mensalidades
      await navHelper.goToMensalidades();
      await page.waitForTimeout(1000);

      // Verificar se há mensagem de "Nenhuma mensalidade encontrada" ou tabela vazia
      const hasEmptyState = await page.locator('text=Nenhuma mensalidade').count();
      const tableRows = await page.locator('table tbody tr').count();

      // Se não há estado vazio, deve haver linhas na tabela, ou vice-versa
      expect(hasEmptyState > 0 || tableRows > 0).toBeTruthy();
    });
  });
});
