import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';
import { NavigationHelper } from '../../helpers/navigation.helper';
import { recebimentosFixtures } from '../../fixtures/recebimentos.fixture';

/**
 * US-061: Registro de Recebimentos por Forma de Pagamento
 *
 * Como tesoureiro do Centro Espírita
 * Quero registrar recebimentos especificando a forma de pagamento e conta de destino
 * Para que eu saiba exatamente quanto entrou por cada meio de pagamento
 *
 * Sprint 1 - Fundação
 * Prioridade: Alta | Estimativa: 13 pontos
 * Dependências: US-060
 */

test.describe('US-061: Registro de Recebimentos por Forma de Pagamento', () => {
  let authHelper: AuthHelper;
  let navHelper: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    navHelper = new NavigationHelper(page);

    // Fazer login antes de cada teste
    await authHelper.login();
  });

  test.describe('Registro de Recebimento', () => {
    test('Deve permitir registrar recebimento com todos os campos obrigatórios', async ({ page }) => {
      // Arrange
      const recebimento = recebimentosFixtures.mensalidadePix;

      // Act
      await navHelper.goToNovoRecebimento();

      // Preencher campos obrigatórios
      await page.fill('[data-testid="input-data"]', recebimento.data);
      await page.fill('[data-testid="input-valor"]', recebimento.valor.toString());
      await page.selectOption('[data-testid="select-forma-pagamento"]', recebimento.formaPagamento);
      await page.selectOption('[data-testid="select-origem-recebimento"]', recebimento.origemRecebimento);

      // Campo observações (opcional)
      await page.fill('[data-testid="input-observacoes"]', recebimento.observacoes!);

      // Submeter formulário
      await page.click('[data-testid="btn-salvar-recebimento"]');

      // Assert
      await expect(page.locator('[data-testid="alert-success"]')).toContainText('Recebimento registrado com sucesso');

      // Verificar redirecionamento
      await expect(page).toHaveURL(/.*\/recebimentos$/);

      // Verificar que o recebimento aparece na listagem
      await expect(page.locator('[data-testid="tabela-recebimentos"]')).toContainText(`R$ ${recebimento.valor.toFixed(2)}`);
    });

    test('Deve selecionar automaticamente conta de destino baseada na forma de pagamento', async ({ page }) => {
      // Arrange
      const recebimento = recebimentosFixtures.vendaCantinaCartao;

      // Act
      await navHelper.goToNovoRecebimento();

      // Selecionar forma de pagamento
      await page.selectOption('[data-testid="select-forma-pagamento"]', recebimento.formaPagamento);

      // Assert - Conta de destino deve ser selecionada automaticamente
      const contaDestino = page.locator('[data-testid="select-conta-destino"]');
      const valorSelecionado = await contaDestino.inputValue();

      expect(valorSelecionado).toBeTruthy();
      expect(valorSelecionado).not.toBe('');

      // Verificar que a conta selecionada corresponde à finalidade da forma de pagamento
      const opcaoSelecionada = await contaDestino.locator(`option[value="${valorSelecionado}"]`).textContent();
      expect(opcaoSelecionada).toContain('Cartão'); // Deve conter referência a cartão
    });

    test('Deve permitir editar manualmente a conta de destino selecionada automaticamente', async ({ page }) => {
      // Act
      await navHelper.goToNovoRecebimento();

      await page.selectOption('[data-testid="select-forma-pagamento"]', 'PIX');

      // Conta é selecionada automaticamente
      const contaAutoSelecionada = await page.locator('[data-testid="select-conta-destino"]').inputValue();

      // Mudar manualmente para outra conta
      await page.selectOption('[data-testid="select-conta-destino"]', '1'); // Selecionar outra conta

      const contaManual = await page.locator('[data-testid="select-conta-destino"]').inputValue();

      // Assert - Deve permitir alteração manual
      expect(contaManual).not.toBe(contaAutoSelecionada);
    });

    test('Deve validar que valor seja maior que zero', async ({ page }) => {
      // Act
      await navHelper.goToNovoRecebimento();

      await page.fill('[data-testid="input-data"]', '2025-11-05');
      await page.fill('[data-testid="input-valor"]', '0'); // Valor zero
      await page.selectOption('[data-testid="select-forma-pagamento"]', 'PIX');
      await page.selectOption('[data-testid="select-origem-recebimento"]', 'MENSALIDADE');

      await page.click('[data-testid="btn-salvar-recebimento"]');

      // Assert
      await expect(page.locator('[data-testid="error-valor"]')).toContainText('O valor deve ser maior que zero');
    });

    test('Não deve permitir data futura', async ({ page }) => {
      // Arrange
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 7); // 7 dias no futuro
      const dataFuturaStr = dataFutura.toISOString().split('T')[0];

      // Act
      await navHelper.goToNovoRecebimento();

      await page.fill('[data-testid="input-data"]', dataFuturaStr);
      await page.fill('[data-testid="input-valor"]', '100.00');
      await page.selectOption('[data-testid="select-forma-pagamento"]', 'PIX');
      await page.selectOption('[data-testid="select-origem-recebimento"]', 'MENSALIDADE');

      await page.click('[data-testid="btn-salvar-recebimento"]');

      // Assert
      await expect(page.locator('[data-testid="error-data"]')).toContainText('A data não pode ser futura');
    });

    test('Não deve permitir recebimento em conta inativa', async ({ page }) => {
      // Act
      await navHelper.goToNovoRecebimento();

      await page.fill('[data-testid="input-data"]', '2025-11-05');
      await page.fill('[data-testid="input-valor"]', '50.00');
      await page.selectOption('[data-testid="select-forma-pagamento"]', 'PIX');
      await page.selectOption('[data-testid="select-origem-recebimento"]', 'MENSALIDADE');

      // Tentar selecionar conta inativa (se disponível no select)
      const selectConta = page.locator('[data-testid="select-conta-destino"]');
      const opcoesInativas = await selectConta.locator('option[data-ativa="false"]').count();

      if (opcoesInativas > 0) {
        await selectConta.locator('option[data-ativa="false"]').first().click();
        await page.click('[data-testid="btn-salvar-recebimento"]');

        // Assert
        await expect(page.locator('[data-testid="alert-error"]')).toContainText('Conta de destino deve estar ativa');
      } else {
        // Contas inativas não devem aparecer na lista
        expect(opcoesInativas).toBe(0);
      }
    });

    test('Deve alertar se forma de pagamento não corresponde à finalidade da conta', async ({ page }) => {
      // Act
      await navHelper.goToNovoRecebimento();

      await page.fill('[data-testid="input-data"]', '2025-11-05');
      await page.fill('[data-testid="input-valor"]', '100.00');

      // Selecionar PIX como forma de pagamento
      await page.selectOption('[data-testid="select-forma-pagamento"]', 'PIX');

      // Manualmente selecionar uma conta que NÃO seja PIX (ex: Cartão de Crédito)
      const selectConta = page.locator('[data-testid="select-conta-destino"]');
      const contaNaoPix = selectConta.locator('option[data-finalidade="CARTAO_CREDITO"]').first();

      if (await contaNaoPix.count() > 0) {
        await contaNaoPix.click();

        // Assert - Deve exibir alerta de discrepância
        await expect(page.locator('[data-testid="warning-discrepancia"]')).toContainText(
          'A forma de pagamento não corresponde à finalidade da conta selecionada'
        );
      }
    });
  });

  test.describe('Vinculação Automática', () => {
    test('Deve permitir vincular recebimento de mensalidade a um associado', async ({ page }) => {
      // Arrange
      const recebimento = recebimentosFixtures.mensalidadePix;

      // Act
      await navHelper.goToNovoRecebimento();

      await page.fill('[data-testid="input-data"]', recebimento.data);
      await page.fill('[data-testid="input-valor"]', recebimento.valor.toString());
      await page.selectOption('[data-testid="select-forma-pagamento"]', recebimento.formaPagamento);
      await page.selectOption('[data-testid="select-origem-recebimento"]', 'MENSALIDADE');

      // Assert - Campo de vinculação a associado deve aparecer
      await expect(page.locator('[data-testid="select-associado"]')).toBeVisible();

      // Selecionar um associado
      await page.selectOption('[data-testid="select-associado"]', '1'); // Primeiro associado

      await page.click('[data-testid="btn-salvar-recebimento"]');

      // Verificar sucesso
      await expect(page.locator('[data-testid="alert-success"]')).toBeVisible();
    });

    test('Deve permitir vincular recebimento de venda de produtos a uma venda', async ({ page }) => {
      // Act
      await navHelper.goToNovoRecebimento();

      await page.selectOption('[data-testid="select-origem-recebimento"]', 'VENDA_PRODUTOS');

      // Assert - Campo de vinculação a venda deve aparecer
      await expect(page.locator('[data-testid="select-venda"]')).toBeVisible();
    });

    test('Deve permitir vincular recebimento de cantina a vendas de cantina', async ({ page }) => {
      // Act
      await navHelper.goToNovoRecebimento();

      await page.selectOption('[data-testid="select-origem-recebimento"]', 'VENDA_CANTINA');

      // Assert - Campo de vinculação deve aparecer
      await expect(page.locator('[data-testid="select-venda-cantina"]')).toBeVisible();
    });

    test('Deve marcar recebimentos não vinculados como "Avulsos"', async ({ page }) => {
      // Arrange
      const recebimento = recebimentosFixtures.doacaoAvulsaPix;

      // Act
      await navHelper.goToNovoRecebimento();

      await page.fill('[data-testid="input-data"]', recebimento.data);
      await page.fill('[data-testid="input-valor"]', recebimento.valor.toString());
      await page.selectOption('[data-testid="select-forma-pagamento"]', recebimento.formaPagamento);
      await page.selectOption('[data-testid="select-origem-recebimento"]', recebimento.origemRecebimento);

      // Não vincular a nenhum associado/venda
      await page.click('[data-testid="btn-salvar-recebimento"]');

      // Assert
      await expect(page.locator('[data-testid="alert-success"]')).toBeVisible();

      // Verificar na listagem que está marcado como avulso
      await navHelper.goToRecebimentos();
      const ultimaLinha = page.locator('[data-testid="linha-recebimento"]').first();
      await expect(ultimaLinha.locator('[data-testid="badge-avulso"]')).toBeVisible();
    });
  });

  test.describe('Validações', () => {
    test('Deve exibir todas as formas de pagamento disponíveis', async ({ page }) => {
      // Act
      await navHelper.goToNovoRecebimento();

      const selectFormaPagamento = page.locator('[data-testid="select-forma-pagamento"]');

      // Assert
      await expect(selectFormaPagamento.locator('option[value="PIX"]')).toBeVisible();
      await expect(selectFormaPagamento.locator('option[value="CARTAO_CREDITO"]')).toBeVisible();
      await expect(selectFormaPagamento.locator('option[value="CARTAO_DEBITO"]')).toBeVisible();
      await expect(selectFormaPagamento.locator('option[value="DINHEIRO"]')).toBeVisible();
    });

    test('Deve exibir todas as origens de recebimento disponíveis', async ({ page }) => {
      // Act
      await navHelper.goToNovoRecebimento();

      const selectOrigem = page.locator('[data-testid="select-origem-recebimento"]');

      // Assert
      await expect(selectOrigem.locator('option[value="MENSALIDADE"]')).toBeVisible();
      await expect(selectOrigem.locator('option[value="VENDA_PRODUTOS"]')).toBeVisible();
      await expect(selectOrigem.locator('option[value="TRANSFERENCIA_BAZAR"]')).toBeVisible();
      await expect(selectOrigem.locator('option[value="VENDA_CANTINA"]')).toBeVisible();
    });

    test('Deve registrar data de registro automaticamente (timestamp)', async ({ page }) => {
      // Arrange
      const recebimento = recebimentosFixtures.vendaProdutosCartaoCredito;

      // Act
      await navHelper.goToNovoRecebimento();

      await page.fill('[data-testid="input-data"]', recebimento.data);
      await page.fill('[data-testid="input-valor"]', recebimento.valor.toString());
      await page.selectOption('[data-testid="select-forma-pagamento"]', recebimento.formaPagamento);
      await page.selectOption('[data-testid="select-origem-recebimento"]', recebimento.origemRecebimento);

      await page.click('[data-testid="btn-salvar-recebimento"]');

      // Assert
      await expect(page.locator('[data-testid="alert-success"]')).toBeVisible();

      // Abrir detalhes do recebimento
      await navHelper.goToRecebimentos();
      const primeiraLinha = page.locator('[data-testid="linha-recebimento"]').first();
      await primeiraLinha.click();

      // Verificar que tem data/hora de registro
      await expect(page.locator('[data-testid="data-hora-registro"]')).toBeVisible();

      const dataHoraText = await page.locator('[data-testid="data-hora-registro"]').textContent();
      expect(dataHoraText).toMatch(/\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}/); // Formato: DD/MM/YYYY HH:MM
    });

    test('Deve validar todos os campos obrigatórios', async ({ page }) => {
      // Act
      await navHelper.goToNovoRecebimento();

      // Tentar salvar sem preencher nada
      await page.click('[data-testid="btn-salvar-recebimento"]');

      // Assert
      await expect(page.locator('[data-testid="error-data"]')).toContainText('Campo obrigatório');
      await expect(page.locator('[data-testid="error-valor"]')).toContainText('Campo obrigatório');
      await expect(page.locator('[data-testid="error-forma-pagamento"]')).toContainText('Campo obrigatório');
      await expect(page.locator('[data-testid="error-origem-recebimento"]')).toContainText('Campo obrigatório');
      await expect(page.locator('[data-testid="error-conta-destino"]')).toContainText('Campo obrigatório');
    });
  });

  test.describe('Listagem e Visualização', () => {
    test('Deve listar recebimentos com informações resumidas', async ({ page }) => {
      // Act
      await navHelper.goToRecebimentos();

      // Assert
      await expect(page.locator('[data-testid="tabela-recebimentos"]')).toBeVisible();

      const primeiraLinha = page.locator('[data-testid="linha-recebimento"]').first();

      // Verificar que exibe as informações principais
      await expect(primeiraLinha.locator('[data-testid="data"]')).toBeVisible();
      await expect(primeiraLinha.locator('[data-testid="valor"]')).toBeVisible();
      await expect(primeiraLinha.locator('[data-testid="forma-pagamento"]')).toBeVisible();
      await expect(primeiraLinha.locator('[data-testid="origem"]')).toBeVisible();
      await expect(primeiraLinha.locator('[data-testid="conta-destino"]')).toBeVisible();
    });

    test('Deve formatar valores monetários corretamente', async ({ page }) => {
      // Act
      await navHelper.goToRecebimentos();

      // Assert
      const valores = page.locator('[data-testid="valor"]');
      const primeiroValor = await valores.first().textContent();

      // Verificar formato brasileiro (R$ X.XXX,XX)
      expect(primeiroValor).toMatch(/R\$\s*[\d.]+,\d{2}/);
    });

    test('Deve permitir filtrar recebimentos por período', async ({ page }) => {
      // Act
      await navHelper.goToRecebimentos();

      await page.fill('[data-testid="filtro-data-inicio"]', '2025-11-01');
      await page.fill('[data-testid="filtro-data-fim"]', '2025-11-30');

      await page.click('[data-testid="btn-filtrar"]');

      // Assert - Aguardar atualização da tabela
      await page.waitForTimeout(500);

      // Todas as linhas devem ter data dentro do período
      const linhas = page.locator('[data-testid="linha-recebimento"]');
      const count = await linhas.count();

      for (let i = 0; i < count; i++) {
        const dataText = await linhas.nth(i).locator('[data-testid="data"]').textContent();
        // Verificar que está no mês 11 (novembro)
        expect(dataText).toContain('/11/2025');
      }
    });

    test('Deve permitir filtrar por forma de pagamento', async ({ page }) => {
      // Act
      await navHelper.goToRecebimentos();

      await page.selectOption('[data-testid="filtro-forma-pagamento"]', 'PIX');
      await page.click('[data-testid="btn-filtrar"]');

      // Assert
      await page.waitForTimeout(500);

      const linhas = page.locator('[data-testid="linha-recebimento"]');
      const primeiraLinha = linhas.first();

      await expect(primeiraLinha.locator('[data-testid="forma-pagamento"]')).toContainText('PIX');
    });

    test('Deve permitir filtrar por origem de recebimento', async ({ page }) => {
      // Act
      await navHelper.goToRecebimentos();

      await page.selectOption('[data-testid="filtro-origem"]', 'MENSALIDADE');
      await page.click('[data-testid="btn-filtrar"]');

      // Assert
      await page.waitForTimeout(500);

      const linhas = page.locator('[data-testid="linha-recebimento"]');
      const primeiraLinha = linhas.first();

      await expect(primeiraLinha.locator('[data-testid="origem"]')).toContainText('Mensalidade');
    });
  });
});
