import { Page, Locator } from '@playwright/test';

/**
 * Helper para seletores com fallback
 *
 * Este helper tenta primeiro usar data-testid (melhor prática)
 * e faz fallback para outros seletores se necessário.
 *
 * Facilita a transição gradual para data-testid no frontend.
 */

export class SelectorHelper {
  constructor(private page: Page) {}

  /**
   * Procura elemento por ID ou data-testid com fallback para texto
   */
  async findByIdOrTestIdOrText(id: string, testId: string, text: string, elementType: string = 'button'): Promise<Locator> {
    // Tentar primeiro com ID
    const byId = this.page.locator(`#${id}`);
    if (await byId.count() > 0) {
      console.log(`[SELECTOR] Encontrado por ID: ${id}`);
      return byId;
    }

    // Tentar com data-testid
    const testIdSelector = `[data-testid="${testId}"]`;
    const byTestId = this.page.locator(testIdSelector);
    if (await byTestId.count() > 0) {
      console.log(`[SELECTOR] Encontrado por data-testid: ${testId}`);
      return byTestId;
    }

    // Fallback para texto
    console.log(`[SELECTOR] ID "${id}" e data-testid "${testId}" não encontrados, usando fallback por texto`);
    const byText = this.page.locator(`${elementType}:has-text("${text}")`);
    return byText;
  }

  /**
   * Procura elemento por data-testid com fallback para texto
   */
  async findByTestIdOrText(testId: string, text: string, elementType: string = 'button'): Promise<Locator> {
    const testIdSelector = `[data-testid="${testId}"]`;

    // Tentar primeiro com data-testid
    const byTestId = this.page.locator(testIdSelector);
    if (await byTestId.count() > 0) {
      console.log(`[SELECTOR] Encontrado por data-testid: ${testId}`);
      return byTestId;
    }

    // Fallback para texto
    console.log(`[SELECTOR] data-testid "${testId}" não encontrado, usando fallback por texto`);
    const byText = this.page.locator(`${elementType}:has-text("${text}")`);
    return byText;
  }

  /**
   * Clica em elemento por ID ou data-testid com fallback para texto
   */
  async clickByIdOrTestIdOrText(id: string, testId: string, text: string, elementType: string = 'button'): Promise<void> {
    const element = await this.findByIdOrTestIdOrText(id, testId, text, elementType);
    await element.click();
  }

  /**
   * Clica em elemento por data-testid com fallback para texto
   */
  async clickByTestIdOrText(testId: string, text: string, elementType: string = 'button'): Promise<void> {
    const element = await this.findByTestIdOrText(testId, text, elementType);
    await element.click();
  }

  /**
   * Preenche input por ID ou data-testid com fallback para atributo name
   */
  async fillByIdOrTestIdOrName(id: string, testId: string, name: string, value: string): Promise<void> {
    // Tentar primeiro com ID
    const byId = this.page.locator(`#${id}`);
    if (await byId.count() > 0) {
      console.log(`[SELECTOR] Input encontrado por ID: ${id}`);
      await byId.fill(value);
      return;
    }

    // Tentar com data-testid
    const testIdSelector = `[data-testid="${testId}"]`;
    const byTestId = this.page.locator(testIdSelector);
    if (await byTestId.count() > 0) {
      console.log(`[SELECTOR] Input encontrado por data-testid: ${testId}`);
      await byTestId.fill(value);
      return;
    }

    // Fallback para name
    console.log(`[SELECTOR] ID "${id}" e data-testid "${testId}" não encontrados, usando name="${name}"`);
    await this.page.fill(`input[name="${name}"]`, value);
  }

  /**
   * Preenche input por data-testid com fallback para atributo name
   */
  async fillByTestIdOrName(testId: string, name: string, value: string): Promise<void> {
    const testIdSelector = `[data-testid="${testId}"]`;

    // Tentar primeiro com data-testid
    const byTestId = this.page.locator(testIdSelector);
    if (await byTestId.count() > 0) {
      console.log(`[SELECTOR] Input encontrado por data-testid: ${testId}`);
      await byTestId.fill(value);
      return;
    }

    // Fallback para name
    console.log(`[SELECTOR] data-testid "${testId}" não encontrado, usando name="${name}"`);
    await this.page.fill(`input[name="${name}"]`, value);
  }

  /**
   * Seleciona option por data-testid com fallback para atributo name
   */
  async selectByTestIdOrName(testId: string, name: string, value: string): Promise<void> {
    const testIdSelector = `[data-testid="${testId}"]`;

    // Tentar primeiro com data-testid
    const byTestId = this.page.locator(testIdSelector);
    if (await byTestId.count() > 0) {
      console.log(`[SELECTOR] Select encontrado por data-testid: ${testId}`);
      await byTestId.selectOption(value);
      return;
    }

    // Fallback para name
    console.log(`[SELECTOR] data-testid "${testId}" não encontrado, usando name="${name}"`);
    await this.page.selectOption(`select[name="${name}"]`, value);
  }

  /**
   * Retorna locator com fallback automático
   */
  getLocatorWithFallback(testId: string, fallbackSelector: string): Locator {
    const testIdSelector = `[data-testid="${testId}"]`;

    // Usar o primeiro que existir
    return this.page.locator(`${testIdSelector}, ${fallbackSelector}`).first();
  }

  /**
   * Aguarda modal aparecer (busca por diversos seletores comuns de modal)
   */
  async waitForModal(timeout: number = 5000): Promise<void> {
    console.log('[SELECTOR] Aguardando modal aparecer...');

    try {
      // Tentar vários seletores de modal comuns
      await this.page.waitForSelector(
        '.modal, [role="dialog"], .modal-content, .modal-dialog, [data-testid*="modal"]',
        { state: 'visible', timeout }
      );
      console.log('[SELECTOR] Modal detectado e visível');
    } catch (error) {
      console.log('[SELECTOR] ⚠️ Timeout esperando modal, continuando mesmo assim...');
    }
  }

  /**
   * Aguarda formulário estar visível
   */
  async waitForForm(timeout: number = 5000): Promise<void> {
    console.log('[SELECTOR] Aguardando formulário aparecer...');

    try {
      await this.page.waitForSelector('form', { state: 'visible', timeout });
      console.log('[SELECTOR] Formulário detectado e visível');
    } catch (error) {
      console.log('[SELECTOR] ⚠️ Timeout esperando formulário, continuando mesmo assim...');
    }
  }
}

/**
 * Mapeamento de seletores para elementos da aplicação
 *
 * Baseado em: /durvalcrm-frontend/DATA-TESTID-REFERENCE.md
 *
 * Cada entrada contém:
 * - testId: o data-testid implementado no frontend (conforme referência)
 * - fallback: seletor alternativo para campos ainda não implementados
 */
export const SELECTORS = {
  // Associados - Navegação
  BTN_NOVO_ASSOCIADO: {
    id: 'associado-adicionar',  // ✅ ID fixo implementado no frontend
    testId: 'associado-adicionar-button',
    fallback: 'button:has-text("Adicionar Associado")',
    text: 'Adicionar Associado'
  },
  BTN_BUSCAR: {
    testId: 'btn-buscar',  // ⚠️ Ainda não implementado
    fallback: 'button:has-text("Buscar")',
    text: 'Buscar'
  },
  INPUT_BUSCA: {
    id: 'associado-buscar',  // ✅ ID fixo implementado no frontend
    testId: 'associado-buscar-input',
    fallback: 'input[placeholder*="Buscar"]',
    name: 'busca'
  },

  // Associados - Ações na Lista (dinâmico por ID do associado)
  BTN_EDITAR_ASSOCIADO: {
    id: 'associado-editar-{id}',  // ✅ ID dinâmico implementado no frontend
    testId: 'associado-editar-{id}-button',
    fallback: 'button[data-action="edit"]',
    text: 'Editar'
  },
  BTN_EXCLUIR_ASSOCIADO: {
    id: 'associado-excluir-{id}',  // ✅ ID dinâmico implementado no frontend
    testId: 'associado-excluir-{id}-button',
    fallback: 'button[data-action="delete"]',
    text: 'Excluir'
  },

  // Associados - Formulário
  INPUT_NOME_COMPLETO: {
    id: 'associado-nome-completo',  // ✅ ID fixo implementado no frontend
    testId: 'associado-form-nome-input',
    fallback: 'input[name="nomeCompleto"]',
    name: 'nomeCompleto'
  },
  INPUT_CPF: {
    id: 'associado-cpf',  // ✅ ID fixo implementado no frontend
    testId: 'associado-form-cpf-input',
    fallback: 'input[name="cpf"]',
    name: 'cpf'
  },
  INPUT_EMAIL: {
    id: 'associado-email',  // ✅ ID fixo implementado no frontend
    testId: 'associado-form-email-input',
    fallback: 'input[name="email"]',
    name: 'email'
  },
  INPUT_TELEFONE: {
    id: 'associado-telefone',  // ✅ ID fixo implementado no frontend
    testId: 'associado-form-telefone-input',
    fallback: 'input[name="telefone"]',
    name: 'telefone'
  },
  INPUT_DATA_NASCIMENTO: {
    testId: 'associado-form-data-nascimento-input',  // ⚠️ Ainda não implementado
    fallback: 'input[name="dataNascimento"]',
    name: 'dataNascimento'
  },

  // Endereço
  INPUT_LOGRADOURO: {
    testId: 'input-logradouro',
    fallback: 'input[name="logradouro"]',
    name: 'logradouro'
  },
  INPUT_NUMERO: {
    testId: 'input-numero',
    fallback: 'input[name="numero"]',
    name: 'numero'
  },
  INPUT_COMPLEMENTO: {
    testId: 'input-complemento',
    fallback: 'input[name="complemento"]',
    name: 'complemento'
  },
  INPUT_BAIRRO: {
    testId: 'input-bairro',
    fallback: 'input[name="bairro"]',
    name: 'bairro'
  },
  INPUT_CIDADE: {
    testId: 'input-cidade',
    fallback: 'input[name="cidade"]',
    name: 'cidade'
  },
  SELECT_ESTADO: {
    testId: 'select-estado',
    fallback: 'select[name="estado"]',
    name: 'estado'
  },
  INPUT_CEP: {
    testId: 'input-cep',
    fallback: 'input[name="cep"]',
    name: 'cep'
  },

  // Observações
  TEXTAREA_OBSERVACOES: {
    testId: 'textarea-observacoes',
    fallback: 'textarea[name="observacoes"]',
    name: 'observacoes'
  },

  // Ações
  BTN_SALVAR: {
    id: 'associado-form-salvar',  // ✅ ID fixo implementado no frontend
    testId: 'associado-form-salvar-button',
    fallback: 'button[type="submit"]:has-text("Salvar")',
    text: 'Salvar'
  },
  BTN_CANCELAR: {
    id: 'associado-form-cancelar',  // ✅ ID fixo implementado no frontend
    testId: 'associado-form-cancelar-button',
    fallback: 'button:has-text("Cancelar")',
    text: 'Cancelar'
  },

  // Feedback
  ALERT_SUCCESS: {
    testId: 'alert-success',
    fallback: '.alert-success, .toast-success, [role="alert"].success',
  },
  ALERT_ERROR: {
    testId: 'alert-error',
    fallback: '.alert-error, .alert-danger, .toast-error, [role="alert"].error',
  }
};
