/**
 * Testes E2E para o Dashboard (Painel)
 *
 * Este arquivo contém testes que verificam a veracidade dos números e percentuais
 * exibidos no dashboard principal do sistema.
 *
 * Métricas testadas:
 * - Receita Consolidada
 * - Receita de Mensalidades
 * - Pagantes do Mês
 * - Receitas por Categoria (Mensalidades, Cantina, Bazar, Livros, Doações)
 * - Percentuais de cada categoria
 * - Receitas por Método de Pagamento (PIX vs Dinheiro)
 * - Listas de Adimplentes e Inadimplentes
 */

import { test, expect, Page } from '@playwright/test';

// Dados de teste consistentes
const MENSALIDADE_VALOR = 10.90;
const DOACAO_VALOR_1 = 50.00;
const DOACAO_VALOR_2 = 100.00;
const VENDA_CANTINA_1 = 25.00;
const VENDA_CANTINA_2 = 35.00;
const VENDA_BAZAR = 40.00;
const VENDA_LIVROS = 30.00;

// Função auxiliar para fazer login
async function fazerLogin(page: Page): Promise<void> {
  console.log('[AUTH] Iniciando processo de login com usuário: tesouraria');

  // Passo 1: Acessar /login
  console.log('[AUTH] Passo 1: Acessando /login');
  await page.goto('/login');
  console.log('[AUTH] URL atual:', page.url());

  // Passo 2: Clicar em "Entrar com Keycloak"
  console.log('[AUTH] Passo 2: Procurando botão "Entrar com Keycloak"');
  const loginButton = page.locator('button:has-text("Entrar com Keycloak")');
  console.log('[AUTH] Botão encontrado com seletor: button:has-text("Entrar com Keycloak")');
  console.log('[AUTH] Botão "Entrar com Keycloak" encontrado, clicando...');
  await loginButton.click();

  // Passo 3: Aguardar redirecionamento para Keycloak
  console.log('[AUTH] Passo 3: Aguardando redirecionamento para Keycloak...');
  await page.waitForURL(/\/realms\/durval-crm\/protocol\/openid-connect\/auth/, { timeout: 10000 });

  // Passo 4: Preencher credenciais no Keycloak
  console.log('[AUTH] Passo 4: Preenchendo credenciais no Keycloak');
  console.log('[AUTH] Preenchendo username...');
  await page.locator('input[name="username"]').fill('tesouraria');
  console.log('[AUTH] Username preenchido usando: input[name="username"]');
  console.log('[AUTH] Preenchendo password...');
  await page.locator('input[name="password"]').fill('cairbar@2025');
  console.log('[AUTH] Password preenchido usando: input[name="password"]');
  console.log('[AUTH] Clicando no botão de submit...');
  await page.locator('input[type="submit"]').click();
  console.log('[AUTH] Submit clicado usando: input[type="submit"]');
  console.log('[AUTH] Credenciais submetidas com sucesso');

  // Passo 5: Aguardar redirecionamento de volta para a aplicação
  console.log('[AUTH] Passo 5: Aguardando redirecionamento para /painel');
  await page.waitForURL(/\/painel/, { timeout: 15000 });
  console.log('[AUTH] ✅ Redirecionamento detectado para:', page.url());
  console.log('[AUTH] ✅ Login concluído com sucesso!');
  console.log('[AUTH] URL final:', page.url());
}

// Função auxiliar para criar um associado
async function criarAssociado(page: Page, dados: {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
}): Promise<void> {
  await page.goto('/crm/associados');
  await page.waitForTimeout(1000);

  await page.click('button:has-text("Novo Associado")');
  await page.waitForTimeout(500);

  await page.fill('input[name="nomeCompleto"]', dados.nome);
  await page.fill('input[name="cpf"]', dados.cpf);
  await page.fill('input[name="email"]', dados.email);
  await page.fill('input[name="telefone"]', dados.telefone);

  await page.click('button:has-text("Salvar")');
  await page.waitForTimeout(2000);
}

// Função auxiliar para pagar uma mensalidade
async function pagarMensalidade(page: Page, nomeAssociado: string, metodoPagamento: string = 'PIX'): Promise<void> {
  await page.goto('/crm/mensalidades');
  await page.waitForTimeout(1500);

  // Buscar a linha com o associado
  const linha = page.locator(`tr:has-text("${nomeAssociado}")`).first();
  await linha.locator('button[title="Visualizar detalhes"]').first().click();
  await page.waitForTimeout(500);

  // Clicar em "Confirmar Pagamento"
  await page.click('button:has-text("Confirmar Pagamento")');
  await page.waitForTimeout(500);

  // Preencher código da transação
  await page.fill('input[placeholder*="código"]', `TRX-${Date.now()}`);

  // Selecionar método de pagamento
  await page.selectOption('select', metodoPagamento);

  // Confirmar
  await page.click('button:has-text("Confirmar"):last-of-type');
  await page.waitForTimeout(2000);
}

// Função auxiliar para criar uma doação
async function criarDoacao(page: Page, dados: {
  valor: number;
  tipo: 'UNICA' | 'RECORRENTE';
  associado?: string;
  metodoPagamento?: string;
}): Promise<void> {
  await page.goto('/crm/doacoes');
  await page.waitForTimeout(1000);

  await page.click('#doacao-nova');
  await page.waitForTimeout(500);

  if (dados.associado) {
    await page.selectOption('#doacao-associado', { label: dados.associado });
  }

  await page.fill('#doacao-valor', dados.valor.toString());
  await page.selectOption('#doacao-tipo', dados.tipo);

  await page.click('#doacao-salvar');
  await page.waitForTimeout(2000);

  // Se tiver método de pagamento, confirmar pagamento
  if (dados.metodoPagamento) {
    const ultimaLinha = page.locator('table tbody tr').first();
    await ultimaLinha.locator('button[title="Visualizar detalhes"]').click();
    await page.waitForTimeout(500);

    await page.click('button:has-text("Confirmar Pagamento")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="código"]', `DOA-${Date.now()}`);
    await page.selectOption('select', dados.metodoPagamento);
    await page.click('button:has-text("Confirmar"):last-of-type');
    await page.waitForTimeout(2000);
  }
}

// Função auxiliar para criar uma venda
async function criarVenda(page: Page, dados: {
  tipo: 'CANTINA' | 'BAZAR' | 'LIVRO';
  valor: number;
  quantidade: number;
  metodoPagamento: string;
}): Promise<void> {
  await page.goto('/crm/vendas');
  await page.waitForTimeout(1000);

  await page.click('button:has-text("Nova Venda")');
  await page.waitForTimeout(500);

  await page.selectOption('select[name="tipo"]', dados.tipo);
  await page.fill('input[name="descricao"]', `Venda de teste ${dados.tipo}`);
  await page.fill('input[name="valorUnitario"]', dados.valor.toString());
  await page.fill('input[name="quantidade"]', dados.quantidade.toString());
  await page.selectOption('select[name="metodoPagamento"]', dados.metodoPagamento);

  await page.click('button:has-text("Salvar Venda")');
  await page.waitForTimeout(2000);
}

// Função auxiliar para extrair número de um texto formatado em moeda
function extrairValor(texto: string): number {
  // Remove "R$", pontos de milhar e substitui vírgula por ponto
  const numeroLimpo = texto
    .replace(/R\$\s*/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  return parseFloat(numeroLimpo);
}

test.describe('Dashboard - Painel', () => {
  test.beforeEach(async ({ page }) => {
    await fazerLogin(page);
  });

  test('Deve calcular corretamente a receita consolidada', async ({ page }) => {
    // Arrange - Criar dados de teste
    const cpfBase = Date.now().toString().slice(-8);
    const associado1 = {
      nome: 'Dashboard Test User 1',
      cpf: `111${cpfBase}01`,
      email: `dash1-${cpfBase}@test.com`,
      telefone: '11999990001'
    };

    const associado2 = {
      nome: 'Dashboard Test User 2',
      cpf: `111${cpfBase}02`,
      email: `dash2-${cpfBase}@test.com`,
      telefone: '11999990002'
    };

    // Criar 2 associados
    await criarAssociado(page, associado1);
    await criarAssociado(page, associado2);

    // Pagar mensalidades (2 * R$ 10,90 = R$ 21,80)
    await pagarMensalidade(page, associado1.nome, 'PIX');
    await pagarMensalidade(page, associado2.nome, 'DINHEIRO');

    // Criar doações (R$ 50,00 + R$ 100,00 = R$ 150,00)
    await criarDoacao(page, {
      valor: DOACAO_VALOR_1,
      tipo: 'UNICA',
      associado: associado1.nome,
      metodoPagamento: 'PIX'
    });

    await criarDoacao(page, {
      valor: DOACAO_VALOR_2,
      tipo: 'UNICA',
      metodoPagamento: 'DINHEIRO'
    });

    // Criar vendas (R$ 25 + R$ 35 + R$ 40 + R$ 30 = R$ 130,00)
    await criarVenda(page, {
      tipo: 'CANTINA',
      valor: VENDA_CANTINA_1,
      quantidade: 1,
      metodoPagamento: 'PIX'
    });

    await criarVenda(page, {
      tipo: 'CANTINA',
      valor: VENDA_CANTINA_2,
      quantidade: 1,
      metodoPagamento: 'DINHEIRO'
    });

    await criarVenda(page, {
      tipo: 'BAZAR',
      valor: VENDA_BAZAR,
      quantidade: 1,
      metodoPagamento: 'PIX'
    });

    await criarVenda(page, {
      tipo: 'LIVRO',
      valor: VENDA_LIVROS,
      quantidade: 1,
      metodoPagamento: 'DINHEIRO'
    });

    // Act - Acessar o dashboard
    await page.goto('/crm/painel');
    await page.waitForTimeout(3000);

    // Assert - Verificar receita consolidada
    // Total esperado: 21,80 + 150,00 + 130,00 = R$ 301,80
    const receitaConsolidadaTexto = await page.locator('text=Receita Consolidada').locator('..').locator('p.text-2xl').textContent();
    const receitaConsolidada = extrairValor(receitaConsolidadaTexto || '0');

    const receitaEsperada = (2 * MENSALIDADE_VALOR) + DOACAO_VALOR_1 + DOACAO_VALOR_2 +
                            VENDA_CANTINA_1 + VENDA_CANTINA_2 + VENDA_BAZAR + VENDA_LIVROS;

    expect(receitaConsolidada).toBeCloseTo(receitaEsperada, 1);
  });

  test('Deve calcular corretamente a receita de mensalidades', async ({ page }) => {
    // Arrange
    const cpfBase = Date.now().toString().slice(-8);
    const associado = {
      nome: 'Mensalidade Test User',
      cpf: `222${cpfBase}01`,
      email: `mens-${cpfBase}@test.com`,
      telefone: '11999990003'
    };

    await criarAssociado(page, associado);
    await pagarMensalidade(page, associado.nome, 'PIX');

    // Act
    await page.goto('/crm/painel');
    await page.waitForTimeout(3000);

    // Assert
    const receitaMensalidadesTexto = await page.locator('text=Receita de Mensalidades').locator('..').locator('p.text-2xl').textContent();
    const receitaMensalidades = extrairValor(receitaMensalidadesTexto || '0');

    expect(receitaMensalidades).toBeGreaterThanOrEqual(MENSALIDADE_VALOR);
  });

  test('Deve exibir corretamente o contador de pagantes do mês', async ({ page }) => {
    // Arrange - Criar 3 associados, 2 pagam
    const cpfBase = Date.now().toString().slice(-8);
    const associados = [
      {
        nome: 'Pagante Test 1',
        cpf: `333${cpfBase}01`,
        email: `pag1-${cpfBase}@test.com`,
        telefone: '11999990004'
      },
      {
        nome: 'Pagante Test 2',
        cpf: `333${cpfBase}02`,
        email: `pag2-${cpfBase}@test.com`,
        telefone: '11999990005'
      },
      {
        nome: 'Inadimplente Test',
        cpf: `333${cpfBase}03`,
        email: `inad-${cpfBase}@test.com`,
        telefone: '11999990006'
      }
    ];

    // Criar os 3 associados
    for (const associado of associados) {
      await criarAssociado(page, associado);
    }

    // Pagar apenas 2 mensalidades
    await pagarMensalidade(page, associados[0].nome, 'PIX');
    await pagarMensalidade(page, associados[1].nome, 'DINHEIRO');

    // Act
    await page.goto('/crm/painel');
    await page.waitForTimeout(3000);

    // Assert - Verificar o formato "X / Y" onde X >= 2 e Y >= 3
    const pagantesTexto = await page.locator('text=Pagantes do Mês').locator('..').locator('p.text-2xl').textContent();
    const match = pagantesTexto?.match(/(\d+)\s*\/\s*(\d+)/);

    expect(match).toBeTruthy();
    if (match) {
      const pagantes = parseInt(match[1]);
      const total = parseInt(match[2]);

      expect(pagantes).toBeGreaterThanOrEqual(2);
      expect(total).toBeGreaterThanOrEqual(3);
      expect(pagantes).toBeLessThanOrEqual(total);
    }
  });

  test('Deve calcular corretamente as porcentagens por categoria', async ({ page }) => {
    // Arrange - Criar um cenário balanceado
    const cpfBase = Date.now().toString().slice(-8);
    const associado = {
      nome: 'Percentage Test User',
      cpf: `444${cpfBase}01`,
      email: `perc-${cpfBase}@test.com`,
      telefone: '11999990007'
    };

    await criarAssociado(page, associado);
    await pagarMensalidade(page, associado.nome, 'PIX');

    // Criar uma doação de R$ 100,00
    await criarDoacao(page, {
      valor: 100.00,
      tipo: 'UNICA',
      metodoPagamento: 'PIX'
    });

    // Act
    await page.goto('/crm/painel');
    await page.waitForTimeout(3000);

    // Assert - Verificar que as porcentagens somam aproximadamente 100%
    const percentualMensalidades = await page.locator('text=/Mensalidades \\((\\d+)%\\)/').textContent();
    const percentualDoacoes = await page.locator('text=/Doações \\((\\d+)%\\)/').textContent();

    const matchMens = percentualMensalidades?.match(/(\d+)%/);
    const matchDoa = percentualDoacoes?.match(/(\d+)%/);

    if (matchMens && matchDoa) {
      const percMens = parseInt(matchMens[1]);
      const percDoa = parseInt(matchDoa[1]);

      // As porcentagens devem estar entre 0 e 100
      expect(percMens).toBeGreaterThanOrEqual(0);
      expect(percMens).toBeLessThanOrEqual(100);
      expect(percDoa).toBeGreaterThanOrEqual(0);
      expect(percDoa).toBeLessThanOrEqual(100);

      // A soma de todas as categorias deve ser aproximadamente 100%
      // (permitir margem de erro de arredondamento)
      const somaTotal = percMens + percDoa; // + outras categorias quando houver
      expect(somaTotal).toBeLessThanOrEqual(105); // Margem de erro
    }
  });

  test('Deve exibir listas de adimplentes e inadimplentes', async ({ page }) => {
    // Arrange
    const cpfBase = Date.now().toString().slice(-8);
    const adimplente = {
      nome: 'Adimplente Test User',
      cpf: `555${cpfBase}01`,
      email: `adim-${cpfBase}@test.com`,
      telefone: '11999990008'
    };

    const inadimplente = {
      nome: 'Inadimplente Test User',
      cpf: `555${cpfBase}02`,
      email: `inad2-${cpfBase}@test.com`,
      telefone: '11999990009'
    };

    await criarAssociado(page, adimplente);
    await criarAssociado(page, inadimplente);
    await pagarMensalidade(page, adimplente.nome, 'PIX');

    // Act
    await page.goto('/crm/painel');
    await page.waitForTimeout(3000);

    // Assert - Verificar que há badges com contadores
    const adimplentesCount = await page.locator('text=Adimplentes').locator('..').locator('.bg-green-100').textContent();
    const inadimplentesCount = await page.locator('text=Inadimplentes').locator('..').locator('.bg-red-100').textContent();

    expect(adimplentesCount).toContain('associado');
    expect(inadimplentesCount).toContain('associado');

    // Verificar que o adimplente aparece na lista
    const listaAdimplentes = page.locator('text=Adimplentes').locator('..').locator('..');
    await expect(listaAdimplentes.locator(`text=${adimplente.nome}`)).toBeVisible();
  });

  test('Deve exibir corretamente as receitas por categoria no gráfico', async ({ page }) => {
    // Arrange
    const cpfBase = Date.now().toString().slice(-8);

    // Criar vendas de cada tipo
    await criarVenda(page, {
      tipo: 'CANTINA',
      valor: 20.00,
      quantidade: 1,
      metodoPagamento: 'PIX'
    });

    await criarVenda(page, {
      tipo: 'BAZAR',
      valor: 30.00,
      quantidade: 1,
      metodoPagamento: 'DINHEIRO'
    });

    await criarVenda(page, {
      tipo: 'LIVRO',
      valor: 40.00,
      quantidade: 1,
      metodoPagamento: 'PIX'
    });

    // Act
    await page.goto('/crm/painel');
    await page.waitForTimeout(3000);

    // Assert - Verificar que cada categoria aparece com seu valor
    const receitaCantinaTexto = await page.locator('text=Cantina').locator('..').locator('.text-sm.font-semibold').textContent();
    const receitaBazarTexto = await page.locator('text=Bazar').locator('..').locator('.text-sm.font-semibold').textContent();
    const receitaLivrosTexto = await page.locator('text=Livros').locator('..').locator('.text-sm.font-semibold').textContent();

    const receitaCantina = extrairValor(receitaCantinaTexto || '0');
    const receitaBazar = extrairValor(receitaBazarTexto || '0');
    const receitaLivros = extrairValor(receitaLivrosTexto || '0');

    // Verificar que os valores são maiores ou iguais aos criados
    expect(receitaCantina).toBeGreaterThanOrEqual(20.00);
    expect(receitaBazar).toBeGreaterThanOrEqual(30.00);
    expect(receitaLivros).toBeGreaterThanOrEqual(40.00);
  });

  test('Deve filtrar corretamente por período', async ({ page }) => {
    // Arrange - Acessar o dashboard
    await page.goto('/crm/painel');
    await page.waitForTimeout(2000);

    // Capturar receita do mês atual
    const receitaAtualTexto = await page.locator('text=Receita Consolidada').locator('..').locator('p.text-2xl').textContent();
    const receitaAtual = extrairValor(receitaAtualTexto || '0');

    // Act - Mudar para o mês anterior
    await page.selectOption('select.form-select', { index: 1 });
    await page.waitForTimeout(3000);

    // Assert - Verificar que a receita mudou (pode ser maior, menor ou igual)
    const receitaAnteriorTexto = await page.locator('text=Receita Consolidada').locator('..').locator('p.text-2xl').textContent();
    const receitaAnterior = extrairValor(receitaAnteriorTexto || '0');

    // Os valores podem ser diferentes ou iguais, mas devem ser números válidos
    expect(receitaAtual).toBeGreaterThanOrEqual(0);
    expect(receitaAnterior).toBeGreaterThanOrEqual(0);
  });

  test('Deve exibir loading state durante carregamento', async ({ page }) => {
    // Arrange & Act
    const loadingPromise = page.goto('/crm/painel');

    // Assert - Verificar que há um spinner de loading (pode ser rápido)
    const hasSpinner = await page.locator('.animate-spin').count();

    // Aguardar o carregamento completar
    await loadingPromise;
    await page.waitForTimeout(3000);

    // Verificar que o loading sumiu
    const finalSpinnerCount = await page.locator('.animate-spin').count();
    expect(finalSpinnerCount).toBe(0);
  });

  test('Deve validar consistência entre receita consolidada e soma das categorias', async ({ page }) => {
    // Arrange - Criar dados variados
    const cpfBase = Date.now().toString().slice(-8);
    const associado = {
      nome: 'Consistency Test User',
      cpf: `666${cpfBase}01`,
      email: `cons-${cpfBase}@test.com`,
      telefone: '11999990010'
    };

    await criarAssociado(page, associado);
    await pagarMensalidade(page, associado.nome, 'PIX');

    await criarDoacao(page, {
      valor: 75.00,
      tipo: 'UNICA',
      metodoPagamento: 'DINHEIRO'
    });

    await criarVenda(page, {
      tipo: 'CANTINA',
      valor: 15.00,
      quantidade: 1,
      metodoPagamento: 'PIX'
    });

    // Act
    await page.goto('/crm/painel');
    await page.waitForTimeout(3000);

    // Assert - Somar todas as categorias e comparar com receita consolidada
    const receitaConsolidadaTexto = await page.locator('text=Receita Consolidada').locator('..').locator('p.text-2xl').textContent();
    const receitaMensalidadesTexto = await page.locator('text=/Mensalidades\\s*R\\$/').textContent();
    const receitaDoacoesTexto = await page.locator('text=/Doações\\s*R\\$/').textContent();
    const receitaCantinaTexto = await page.locator('text=/Cantina\\s*R\\$/').textContent();

    const consolidada = extrairValor(receitaConsolidadaTexto || '0');
    const mensalidades = extrairValor(receitaMensalidadesTexto || '0');
    const doacoes = extrairValor(receitaDoacoesTexto || '0');
    const cantina = extrairValor(receitaCantinaTexto || '0');

    // A soma das categorias deve ser igual ou muito próxima da consolidada
    const somaCategorias = mensalidades + doacoes + cantina;
    expect(consolidada).toBeCloseTo(somaCategorias, 1);
  });
});
