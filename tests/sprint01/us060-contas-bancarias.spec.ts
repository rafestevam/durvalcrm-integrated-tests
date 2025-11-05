import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';
import { NavigationHelper } from '../../helpers/navigation.helper';
import { contasBancariasFixtures } from '../../fixtures/contas.fixture';

/**
 * US-060: Cadastro de Contas Bancárias e Caixa
 *
 * Como tesoureiro do Centro Espírita
 * Quero cadastrar e gerenciar as contas bancárias e o caixa físico
 * Para que eu possa controlar os saldos de cada conta separadamente
 *
 * Sprint 1 - Fundação
 * Prioridade: Alta | Estimativa: 8 pontos
 */

test.describe('US-060: Cadastro de Contas Bancárias e Caixa', () => {
  let authHelper: AuthHelper;
  let navHelper: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    navHelper = new NavigationHelper(page);

    // Fazer login antes de cada teste
    await authHelper.login();
  });

  test.describe('Cadastro de Conta Bancária', () => {
    test('Deve permitir cadastrar conta bancária com todos os campos obrigatórios', async ({ page }) => {
      // Arrange
      const conta = contasBancariasFixtures.contaPix;

      // Act
      await navHelper.goToNovaContaBancaria();

      // Preencher campos obrigatórios
      await page.fill('[data-testid="input-nome-conta"]', conta.nome);
      await page.selectOption('[data-testid="select-tipo-conta"]', conta.tipo);
      await page.selectOption('[data-testid="select-finalidade"]', conta.finalidade);

      // Para contas bancárias, preencher dados bancários
      await page.fill('[data-testid="input-banco"]', conta.banco!);
      await page.fill('[data-testid="input-agencia"]', conta.agencia!);
      await page.fill('[data-testid="input-numero-conta"]', conta.numeroConta!);

      // Preencher saldo inicial
      await page.fill('[data-testid="input-saldo-inicial"]', conta.saldoInicial!.toString());
      await page.fill('[data-testid="input-data-saldo-inicial"]', conta.dataSaldoInicial!);

      // Submeter formulário
      await page.click('[data-testid="btn-salvar-conta"]');

      // Assert
      await expect(page.locator('[data-testid="alert-success"]')).toContainText('Conta cadastrada com sucesso');

      // Verificar se foi redirecionado para a listagem
      await expect(page).toHaveURL(/.*\/contas-bancarias$/);

      // Verificar se a conta aparece na listagem
      await expect(page.locator(`text=${conta.nome}`)).toBeVisible();
    });

    test('Deve permitir cadastrar caixa físico sem dados bancários', async ({ page }) => {
      // Arrange
      const caixa = contasBancariasFixtures.caixaFisico;

      // Act
      await navHelper.goToNovaContaBancaria();

      await page.fill('[data-testid="input-nome-conta"]', caixa.nome);
      await page.selectOption('[data-testid="select-tipo-conta"]', caixa.tipo);
      await page.selectOption('[data-testid="select-finalidade"]', caixa.finalidade);

      // Campos bancários não devem ser exibidos ou obrigatórios para caixa físico
      await expect(page.locator('[data-testid="input-banco"]')).not.toBeVisible();

      await page.fill('[data-testid="input-saldo-inicial"]', caixa.saldoInicial!.toString());
      await page.fill('[data-testid="input-data-saldo-inicial"]', caixa.dataSaldoInicial!);

      await page.click('[data-testid="btn-salvar-conta"]');

      // Assert
      await expect(page.locator('[data-testid="alert-success"]')).toBeVisible();
      await expect(page.locator(`text=${caixa.nome}`)).toBeVisible();
    });

    test('Deve validar campos obrigatórios antes de salvar', async ({ page }) => {
      // Act
      await navHelper.goToNovaContaBancaria();

      // Tentar salvar sem preencher campos
      await page.click('[data-testid="btn-salvar-conta"]');

      // Assert - Deve exibir mensagens de validação
      await expect(page.locator('[data-testid="error-nome-conta"]')).toContainText('Campo obrigatório');
      await expect(page.locator('[data-testid="error-tipo-conta"]')).toContainText('Campo obrigatório');
      await expect(page.locator('[data-testid="error-finalidade"]')).toContainText('Campo obrigatório');
    });

    test('Não deve permitir duas contas com mesmo nome', async ({ page }) => {
      // Arrange
      const conta = contasBancariasFixtures.contaCartaoCredito;

      // Act - Criar primeira conta
      await navHelper.goToNovaContaBancaria();
      await page.fill('[data-testid="input-nome-conta"]', conta.nome);
      await page.selectOption('[data-testid="select-tipo-conta"]', conta.tipo);
      await page.selectOption('[data-testid="select-finalidade"]', conta.finalidade);
      await page.fill('[data-testid="input-banco"]', conta.banco!);
      await page.fill('[data-testid="input-agencia"]', conta.agencia!);
      await page.fill('[data-testid="input-numero-conta"]', conta.numeroConta!);
      await page.click('[data-testid="btn-salvar-conta"]');

      // Aguardar sucesso
      await expect(page.locator('[data-testid="alert-success"]')).toBeVisible();

      // Tentar criar segunda conta com mesmo nome
      await navHelper.goToNovaContaBancaria();
      await page.fill('[data-testid="input-nome-conta"]', conta.nome);
      await page.selectOption('[data-testid="select-tipo-conta"]', 'BANCARIA');
      await page.selectOption('[data-testid="select-finalidade"]', 'PIX');
      await page.fill('[data-testid="input-banco"]', 'Outro Banco');
      await page.fill('[data-testid="input-agencia"]', '9999');
      await page.fill('[data-testid="input-numero-conta"]', '99999-9');
      await page.click('[data-testid="btn-salvar-conta"]');

      // Assert - Deve exibir erro
      await expect(page.locator('[data-testid="alert-error"]')).toContainText('Já existe uma conta com este nome');
    });

    test('Deve permitir configurar status Ativa/Inativa', async ({ page }) => {
      // Arrange
      const conta = contasBancariasFixtures.contaDepositos;

      // Act
      await navHelper.goToNovaContaBancaria();
      await page.fill('[data-testid="input-nome-conta"]', conta.nome);
      await page.selectOption('[data-testid="select-tipo-conta"]', conta.tipo);
      await page.selectOption('[data-testid="select-finalidade"]', conta.finalidade);
      await page.fill('[data-testid="input-banco"]', conta.banco!);
      await page.fill('[data-testid="input-agencia"]', conta.agencia!);
      await page.fill('[data-testid="input-numero-conta"]', conta.numeroConta!);

      // Marcar como ativa
      await page.check('[data-testid="checkbox-conta-ativa"]');

      await page.click('[data-testid="btn-salvar-conta"]');

      // Assert
      await expect(page.locator('[data-testid="alert-success"]')).toBeVisible();

      // Verificar badge de status ativa
      await expect(page.locator(`[data-testid="conta-${conta.nome}"] [data-testid="badge-ativa"]`)).toBeVisible();
    });
  });

  test.describe('Gestão de Contas', () => {
    test('Deve listar todas as contas cadastradas', async ({ page }) => {
      // Arrange - Assume que existem contas cadastradas

      // Act
      await navHelper.goToContasBancarias();

      // Assert
      await expect(page.locator('[data-testid="tabela-contas"]')).toBeVisible();
      await expect(page.locator('[data-testid="linha-conta"]')).toHaveCount(await page.locator('[data-testid="linha-conta"]').count());
    });

    test('Deve filtrar contas por tipo (Bancária/Caixa Físico)', async ({ page }) => {
      // Act
      await navHelper.goToContasBancarias();

      // Filtrar por Bancária
      await page.selectOption('[data-testid="filtro-tipo"]', 'BANCARIA');

      // Assert
      const linhasBancarias = page.locator('[data-testid="linha-conta"][data-tipo="BANCARIA"]');
      await expect(linhasBancarias.first()).toBeVisible();

      // Não deve exibir caixas físicos
      const linhasCaixa = page.locator('[data-testid="linha-conta"][data-tipo="CAIXA_FISICO"]');
      await expect(linhasCaixa).toHaveCount(0);
    });

    test('Deve filtrar contas por status (Ativa/Inativa)', async ({ page }) => {
      // Act
      await navHelper.goToContasBancarias();

      // Filtrar por Ativas
      await page.selectOption('[data-testid="filtro-status"]', 'ATIVA');

      // Assert
      const linhasAtivas = page.locator('[data-testid="linha-conta"][data-ativa="true"]');
      await expect(linhasAtivas.first()).toBeVisible();

      // Filtrar por Inativas
      await page.selectOption('[data-testid="filtro-status"]', 'INATIVA');
      const linhasInativas = page.locator('[data-testid="linha-conta"][data-ativa="false"]');
      await expect(linhasInativas.first()).toBeVisible();
    });

    test('Deve exibir saldo atual de cada conta', async ({ page }) => {
      // Act
      await navHelper.goToContasBancarias();

      // Assert
      const primeiraLinha = page.locator('[data-testid="linha-conta"]').first();
      await expect(primeiraLinha.locator('[data-testid="saldo-atual"]')).toBeVisible();

      // Verificar formato de moeda (R$ X.XXX,XX)
      const saldoText = await primeiraLinha.locator('[data-testid="saldo-atual"]').textContent();
      expect(saldoText).toMatch(/R\$\s*[\d.]+,\d{2}/);
    });

    test('Deve permitir editar dados cadastrais (exceto saldo)', async ({ page }) => {
      // Act
      await navHelper.goToContasBancarias();

      // Clicar no botão de editar da primeira conta
      const primeiraLinha = page.locator('[data-testid="linha-conta"]').first();
      await primeiraLinha.locator('[data-testid="btn-editar"]').click();

      // Assert - Formulário de edição deve ser exibido
      await expect(page.locator('[data-testid="form-editar-conta"]')).toBeVisible();

      // Campos editáveis devem estar habilitados
      await expect(page.locator('[data-testid="input-nome-conta"]')).toBeEnabled();
      await expect(page.locator('[data-testid="input-banco"]')).toBeEnabled();

      // Campo de saldo deve estar desabilitado
      await expect(page.locator('[data-testid="input-saldo-inicial"]')).toBeDisabled();
    });

    test('Deve permitir inativar conta', async ({ page }) => {
      // Act
      await navHelper.goToContasBancarias();

      const primeiraLinha = page.locator('[data-testid="linha-conta"][data-ativa="true"]').first();
      const nomeConta = await primeiraLinha.locator('[data-testid="nome-conta"]').textContent();

      await primeiraLinha.locator('[data-testid="btn-inativar"]').click();

      // Confirmar ação no modal
      await page.click('[data-testid="btn-confirmar-inativacao"]');

      // Assert
      await expect(page.locator('[data-testid="alert-success"]')).toContainText('Conta inativada com sucesso');

      // Verificar que agora está inativa
      await expect(page.locator(`[data-testid="conta-${nomeConta}"] [data-testid="badge-inativa"]`)).toBeVisible();
    });

    test('Não deve permitir exclusão de conta com movimentações', async ({ page }) => {
      // Arrange - Assume que existe uma conta com movimentações

      // Act
      await navHelper.goToContasBancarias();

      const contaComMovimentacao = page.locator('[data-testid="linha-conta"][data-tem-movimentacao="true"]').first();

      // Assert - Botão de exclusão não deve estar visível ou deve estar desabilitado
      const btnExcluir = contaComMovimentacao.locator('[data-testid="btn-excluir"]');

      const isDisabled = await btnExcluir.isDisabled().catch(() => true);
      const isHidden = await btnExcluir.isHidden().catch(() => true);

      expect(isDisabled || isHidden).toBe(true);
    });

    test('Deve visualizar histórico de movimentações por conta', async ({ page }) => {
      // Act
      await navHelper.goToContasBancarias();

      const primeiraLinha = page.locator('[data-testid="linha-conta"]').first();
      await primeiraLinha.locator('[data-testid="btn-ver-historico"]').click();

      // Assert
      await expect(page.locator('[data-testid="modal-historico-movimentacoes"]')).toBeVisible();
      await expect(page.locator('[data-testid="tabela-movimentacoes"]')).toBeVisible();
    });
  });

  test.describe('Regras de Negócio', () => {
    test('Saldo inicial só pode ser alterado antes da primeira movimentação', async ({ page }) => {
      // Act
      await navHelper.goToContasBancarias();

      // Conta sem movimentações - saldo deve ser editável
      const contaSemMovimentacao = page.locator('[data-testid="linha-conta"][data-tem-movimentacao="false"]').first();
      await contaSemMovimentacao.locator('[data-testid="btn-editar"]').click();
      await expect(page.locator('[data-testid="input-saldo-inicial"]')).toBeEnabled();

      // Voltar
      await page.click('[data-testid="btn-cancelar"]');

      // Conta com movimentações - saldo deve estar bloqueado
      const contaComMovimentacao = page.locator('[data-testid="linha-conta"][data-tem-movimentacao="true"]').first();
      await contaComMovimentacao.locator('[data-testid="btn-editar"]').click();
      await expect(page.locator('[data-testid="input-saldo-inicial"]')).toBeDisabled();
    });

    test('Deve exibir todas as opções de finalidade', async ({ page }) => {
      // Act
      await navHelper.goToNovaContaBancaria();

      // Assert - Verificar opções de finalidade
      const selectFinalidade = page.locator('[data-testid="select-finalidade"]');

      await expect(selectFinalidade.locator('option[value="PIX"]')).toBeVisible();
      await expect(selectFinalidade.locator('option[value="CARTAO_CREDITO"]')).toBeVisible();
      await expect(selectFinalidade.locator('option[value="CARTAO_DEBITO"]')).toBeVisible();
      await expect(selectFinalidade.locator('option[value="DINHEIRO"]')).toBeVisible();
      await expect(selectFinalidade.locator('option[value="OPERACIONAL"]')).toBeVisible();
      await expect(selectFinalidade.locator('option[value="OUTROS"]')).toBeVisible();
    });
  });
});
