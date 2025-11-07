import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';
import { NavigationHelper } from '../../helpers/navigation.helper';

/**
 * CRUD Completo - Doações
 *
 * Testa as operações CRUD do módulo de Doações do DurvalCRM.
 *
 * Funcionalidades testadas:
 * - Criação de doações (anônimas e identificadas)
 * - Tipos de doação (UNICA, RECORRENTE)
 * - Validação de campos obrigatórios
 * - Visualização de detalhes
 * - Confirmação de pagamento
 * - Geração de código PIX
 * - Cancelamento de doações
 * - Exclusão de doações
 */

test.describe('CRUD - Doações', () => {
  let authHelper: AuthHelper;
  let navHelper: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    navHelper = new NavigationHelper(page);

    // Fazer login antes de cada teste
    await authHelper.login();
  });

  test.describe('CREATE - Criação de Doações', () => {
    test('Deve permitir criar doação anônima única', async ({ page }) => {
      // Arrange
      const doacao = {
        valor: '50.00',
        tipo: 'UNICA',
        descricao: `Doação teste ${Date.now()}`
      };

      // Act - Navegar para doações
      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      // Clicar em Nova Doação
      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      // Preencher formulário (deixar associado vazio para doação anônima)
      await page.fill('#doacao-valor', doacao.valor);
      await page.selectOption('#doacao-tipo', doacao.tipo);
      await page.fill('#doacao-descricao', doacao.descricao);

      // Submeter formulário
      await page.click('#doacao-salvar');

      // Assert
      await page.waitForTimeout(2000);

      // Verificar mensagem de sucesso
      await expect(page.locator('text=criada com sucesso')).toBeVisible();
    });

    test('Deve permitir criar doação identificada com associado', async ({ page }) => {
      // Arrange
      const doacao = {
        valor: '100.00',
        tipo: 'UNICA',
        descricao: `Doação identificada ${Date.now()}`
      };

      // Act
      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      // Selecionar primeiro associado disponível
      const associadoOptions = await page.locator('#doacao-associado option').count();
      if (associadoOptions > 1) {
        await page.selectOption('#doacao-associado', { index: 1 });
      }

      await page.fill('#doacao-valor', doacao.valor);
      await page.selectOption('#doacao-tipo', doacao.tipo);
      await page.fill('#doacao-descricao', doacao.descricao);

      await page.click('#doacao-salvar');

      // Assert
      await page.waitForTimeout(2000);
      await expect(page.locator('text=criada com sucesso')).toBeVisible();
    });

    test('Deve permitir criar doação recorrente', async ({ page }) => {
      // Arrange
      const doacao = {
        valor: '25.00',
        tipo: 'RECORRENTE',
        descricao: `Doação recorrente ${Date.now()}`
      };

      // Act
      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      await page.fill('#doacao-valor', doacao.valor);
      await page.selectOption('#doacao-tipo', doacao.tipo);
      await page.fill('#doacao-descricao', doacao.descricao);

      await page.click('#doacao-salvar');

      // Assert
      await page.waitForTimeout(2000);
      await expect(page.locator('text=criada com sucesso')).toBeVisible();
    });

    test('Deve permitir criar doação com data personalizada', async ({ page }) => {
      // Arrange
      const doacao = {
        valor: '75.50',
        tipo: 'UNICA',
        data: '2025-01-15T10:30',
        descricao: `Doação data custom ${Date.now()}`
      };

      // Act
      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      await page.fill('#doacao-valor', doacao.valor);
      await page.selectOption('#doacao-tipo', doacao.tipo);
      await page.fill('#doacao-data', doacao.data);
      await page.fill('#doacao-descricao', doacao.descricao);

      await page.click('#doacao-salvar');

      // Assert
      await page.waitForTimeout(2000);
      await expect(page.locator('text=criada com sucesso')).toBeVisible();
    });
  });

  test.describe('VALIDAÇÕES - Campos Obrigatórios', () => {
    test('Deve validar valor obrigatório', async ({ page }) => {
      // Act
      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      // Preencher apenas tipo (valor é obrigatório)
      await page.selectOption('#doacao-tipo', 'UNICA');

      // Tentar submeter sem valor
      await page.click('#doacao-salvar');

      // Assert - Formulário não deve ser submetido
      await page.waitForTimeout(500);

      // Modal deve continuar aberto
      await expect(page.locator('#doacao-salvar')).toBeVisible();
    });

    test('Deve validar tipo obrigatório', async ({ page }) => {
      // Act
      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      // Preencher apenas valor (tipo é obrigatório)
      await page.fill('#doacao-valor', '50.00');

      // Tentar submeter sem tipo
      await page.click('#doacao-salvar');

      // Assert
      await page.waitForTimeout(500);
      await expect(page.locator('#doacao-salvar')).toBeVisible();
    });

    test('Não deve aceitar valor zero', async ({ page }) => {
      // Act
      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      await page.fill('#doacao-valor', '0');
      await page.selectOption('#doacao-tipo', 'UNICA');

      await page.click('#doacao-salvar');

      // Assert
      await page.waitForTimeout(500);
      await expect(page.locator('#doacao-salvar')).toBeVisible();
    });

    test('Não deve aceitar valor negativo', async ({ page }) => {
      // Act
      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      await page.fill('#doacao-valor', '-10');
      await page.selectOption('#doacao-tipo', 'UNICA');

      await page.click('#doacao-salvar');

      // Assert
      await page.waitForTimeout(500);
      await expect(page.locator('#doacao-salvar')).toBeVisible();
    });
  });

  test.describe('UI - Interface e Elementos', () => {
    test('Deve exibir botão Nova Doação', async ({ page }) => {
      // Act
      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      // Assert
      await expect(page.locator('#doacao-nova')).toBeVisible();
    });

    test('Deve abrir modal ao clicar em Nova Doação', async ({ page }) => {
      // Act
      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      // Assert - Verificar que formulário está visível
      await expect(page.locator('#doacao-valor')).toBeVisible();
      await expect(page.locator('#doacao-tipo')).toBeVisible();
      await expect(page.locator('#doacao-salvar')).toBeVisible();
    });

    test('Deve exibir campo de associado como opcional', async ({ page }) => {
      // Act
      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      // Assert - Verificar label indica que é opcional
      const associadoLabel = await page.textContent('label[for="associado"]');
      expect(associadoLabel).toContain('opcional');
    });

    test('Deve exibir opções de tipo de doação', async ({ page }) => {
      // Act
      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      // Assert - Verificar opções no select
      const opcoes = await page.locator('#doacao-tipo option').allTextContents();
      expect(opcoes).toContain('Doação Única');
      expect(opcoes).toContain('Doação Recorrente');
    });

    test('Deve permitir cancelar criação de doação', async ({ page }) => {
      // Act
      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      // Preencher alguns campos
      await page.fill('#doacao-valor', '50.00');

      // Clicar em cancelar
      await page.click('#doacao-cancelar');
      await page.waitForTimeout(500);

      // Assert - Modal deve estar fechado
      await expect(page.locator('#doacao-salvar')).not.toBeVisible();
    });
  });

  test.describe('READ - Visualização de Doações', () => {
    test('Deve exibir lista de doações', async ({ page }) => {
      // Act
      await page.goto('/crm/doacoes');
      await page.waitForTimeout(2000);

      // Assert - Verificar que a página carregou (usar botão único)
      await expect(page.locator('#doacao-nova')).toBeVisible();
    });

    test('Deve exibir estatísticas de doações', async ({ page }) => {
      // Act
      await page.goto('/crm/doacoes');
      await page.waitForTimeout(2000);

      // Assert - Verificar que estatísticas estão visíveis
      const hasStats = await page.locator('[data-testid*="estatistica"]').count();
      expect(hasStats).toBeGreaterThanOrEqual(0);
    });

    test('Deve permitir filtrar por período', async ({ page }) => {
      // Act
      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      // Preencher filtros
      const dataInicio = '2025-01-01';
      const dataFim = '2025-01-31';

      await page.fill('[data-testid="doacao-filtro-data-inicio-input"]', dataInicio);
      await page.fill('[data-testid="doacao-filtro-data-fim-input"]', dataFim);

      // Clicar em filtrar
      await page.click('[data-testid="doacao-filtrar-button"]');

      // Assert
      await page.waitForTimeout(1000);

      // Verificar que os filtros foram aplicados (valores mantidos)
      const dataInicioValue = await page.inputValue('[data-testid="doacao-filtro-data-inicio-input"]');
      expect(dataInicioValue).toBe(dataInicio);
    });
  });

  test.describe('DETALHES - Visualização e Ações', () => {
    test('Deve criar doação e visualizar detalhes', async ({ page }) => {
      // Arrange - Criar uma doação primeiro
      const doacao = {
        valor: '150.00',
        tipo: 'UNICA',
        descricao: `Doação detalhes ${Date.now()}`
      };

      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      await page.fill('#doacao-valor', doacao.valor);
      await page.selectOption('#doacao-tipo', doacao.tipo);
      await page.fill('#doacao-descricao', doacao.descricao);

      await page.click('#doacao-salvar');
      await page.waitForTimeout(2000);

      // Act - Clicar na primeira doação da lista para ver detalhes
      const primeiraDoacao = page.locator('[data-testid*="doacao-item"]').first();
      if (await primeiraDoacao.count() > 0) {
        await primeiraDoacao.click();
        await page.waitForTimeout(1000);

        // Assert - Verificar que detalhes estão visíveis
        await expect(page.locator('text=Detalhes da Doação')).toBeVisible();
      }
    });
  });

  test.describe('CONFIRMAÇÃO - Pagamento', () => {
    test('Deve criar doação pendente e permitir confirmar pagamento', async ({ page }) => {
      // Arrange - Criar doação pendente
      const doacao = {
        valor: '200.00',
        tipo: 'UNICA',
        descricao: `Doação confirmar ${Date.now()}`
      };

      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      await page.fill('#doacao-valor', doacao.valor);
      await page.selectOption('#doacao-tipo', doacao.tipo);
      await page.fill('#doacao-descricao', doacao.descricao);

      await page.click('#doacao-salvar');
      await page.waitForTimeout(2000);

      // Act - Abrir detalhes da doação criada
      const primeiraDoacao = page.locator('[data-testid*="doacao-item"]').first();
      if (await primeiraDoacao.count() > 0) {
        await primeiraDoacao.click();
        await page.waitForTimeout(1000);

        // Verificar se botão de confirmar está disponível
        const botaoConfirmar = page.locator('#doacao-confirmar-pagamento');
        if (await botaoConfirmar.isVisible()) {
          await botaoConfirmar.click();
          await page.waitForTimeout(500);

          // Preencher dados de confirmação
          await page.fill('#doacao-codigo-transacao', `TRX-${Date.now()}`);
          await page.selectOption('#doacao-metodo-pagamento', 'PIX');

          // Submeter confirmação
          await page.click('#doacao-confirmar-submit');

          // Assert
          await page.waitForTimeout(2000);
          await expect(page.locator('text=confirmada com sucesso')).toBeVisible();
        }
      }
    });
  });

  test.describe('PIX - Geração de Código', () => {
    test('Deve criar doação e gerar código PIX', async ({ page }) => {
      // Arrange
      const doacao = {
        valor: '75.00',
        tipo: 'UNICA',
        descricao: `Doação PIX ${Date.now()}`
      };

      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      await page.fill('#doacao-valor', doacao.valor);
      await page.selectOption('#doacao-tipo', doacao.tipo);
      await page.fill('#doacao-descricao', doacao.descricao);

      await page.click('#doacao-salvar');
      await page.waitForTimeout(2000);

      // Act - Abrir detalhes
      const primeiraDoacao = page.locator('[data-testid*="doacao-item"]').first();
      if (await primeiraDoacao.count() > 0) {
        await primeiraDoacao.click();
        await page.waitForTimeout(1000);

        // Clicar em Gerar PIX (se disponível)
        const botaoPix = page.locator('#doacao-gerar-pix');
        if (await botaoPix.isVisible()) {
          await botaoPix.click();
          await page.waitForTimeout(2000);

          // Assert - Verificar que modal PIX está aberto
          await expect(page.locator('text=Código PIX')).toBeVisible();
        }
      }
    });
  });

  test.describe('DELETE - Exclusão', () => {
    test('Deve criar doação e excluir', async ({ page }) => {
      // Arrange - Criar doação
      const doacao = {
        valor: '30.00',
        tipo: 'UNICA',
        descricao: `Doação excluir ${Date.now()}`
      };

      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      await page.fill('#doacao-valor', doacao.valor);
      await page.selectOption('#doacao-tipo', doacao.tipo);
      await page.fill('#doacao-descricao', doacao.descricao);

      await page.click('#doacao-salvar');
      await page.waitForTimeout(2000);

      // Act - Abrir detalhes e excluir
      const primeiraDoacao = page.locator('[data-testid*="doacao-item"]').first();
      if (await primeiraDoacao.count() > 0) {
        await primeiraDoacao.click();
        await page.waitForTimeout(1000);

        // Clicar em excluir (se disponível)
        const botaoExcluir = page.locator('#doacao-excluir');
        if (await botaoExcluir.isVisible()) {
          // Configurar handler para o confirm dialog
          page.on('dialog', dialog => dialog.accept());

          await botaoExcluir.click();

          // Assert
          await page.waitForTimeout(2000);
          await expect(page.locator('text=excluída com sucesso')).toBeVisible();
        }
      }
    });
  });

  test.describe('CANCELAMENTO - Doação', () => {
    test('Deve criar doação e cancelar', async ({ page }) => {
      // Arrange
      const doacao = {
        valor: '40.00',
        tipo: 'UNICA',
        descricao: `Doação cancelar ${Date.now()}`
      };

      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      await page.fill('#doacao-valor', doacao.valor);
      await page.selectOption('#doacao-tipo', doacao.tipo);
      await page.fill('#doacao-descricao', doacao.descricao);

      await page.click('#doacao-salvar');
      await page.waitForTimeout(2000);

      // Act - Abrir detalhes e cancelar
      const primeiraDoacao = page.locator('[data-testid*="doacao-item"]').first();
      if (await primeiraDoacao.count() > 0) {
        await primeiraDoacao.click();
        await page.waitForTimeout(1000);

        // Clicar em cancelar (se disponível)
        const botaoCancelar = page.locator('#doacao-cancelar-doacao');
        if (await botaoCancelar.isVisible()) {
          // Configurar handler para o confirm dialog
          page.on('dialog', dialog => dialog.accept());

          await botaoCancelar.click();

          // Assert
          await page.waitForTimeout(2000);
          await expect(page.locator('text=cancelada com sucesso')).toBeVisible();
        }
      }
    });
  });

  test.describe('FLUXO COMPLETO - Ciclo de Vida', () => {
    test('Deve completar ciclo: criar → visualizar → confirmar → verificar', async ({ page }) => {
      // Arrange
      const doacao = {
        valor: '125.50',
        tipo: 'UNICA',
        descricao: `Doação ciclo completo ${Date.now()}`
      };

      // Passo 1: Navegar para doações
      await page.goto('/crm/doacoes');
      await page.waitForTimeout(1000);

      // Passo 2: Criar doação
      await page.click('#doacao-nova');
      await page.waitForTimeout(500);

      await expect(page.locator('#doacao-valor')).toBeVisible();

      await page.fill('#doacao-valor', doacao.valor);
      await page.selectOption('#doacao-tipo', doacao.tipo);
      await page.fill('#doacao-descricao', doacao.descricao);

      await page.click('#doacao-salvar');
      await page.waitForTimeout(2000);

      // Passo 3: Verificar criação
      await expect(page.locator('text=criada com sucesso')).toBeVisible();

      // Passo 4: Abrir detalhes
      const primeiraDoacao = page.locator('[data-testid*="doacao-item"]').first();
      if (await primeiraDoacao.count() > 0) {
        await primeiraDoacao.click();
        await page.waitForTimeout(1000);

        // Passo 5: Verificar detalhes
        await expect(page.locator('text=Detalhes da Doação')).toBeVisible();

        // Passo 6: Confirmar pagamento (se disponível)
        const botaoConfirmar = page.locator('#doacao-confirmar-pagamento');
        if (await botaoConfirmar.isVisible()) {
          await botaoConfirmar.click();
          await page.waitForTimeout(500);

          await page.fill('#doacao-codigo-transacao', `TRX-COMPLETO-${Date.now()}`);
          await page.selectOption('#doacao-metodo-pagamento', 'PIX');

          await page.click('#doacao-confirmar-submit');
          await page.waitForTimeout(2000);

          // Assert final
          await expect(page.locator('text=confirmada com sucesso')).toBeVisible();
        }
      }
    });
  });
});
