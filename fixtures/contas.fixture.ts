/**
 * Fixtures de dados para testes de Contas Bancárias
 *
 * Contém dados de exemplo para criar contas bancárias
 * e caixa físico nos testes.
 */

export interface ContaBancariaData {
  nome: string;
  tipo: 'BANCARIA' | 'CAIXA_FISICO';
  finalidade: 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'DINHEIRO' | 'OPERACIONAL' | 'OUTROS';
  banco?: string;
  agencia?: string;
  numeroConta?: string;
  saldoInicial?: number;
  dataSaldoInicial?: string;
  ativa: boolean;
}

export const contasBancariasFixtures: Record<string, ContaBancariaData> = {
  contaPix: {
    nome: 'Conta PIX Banco Inter',
    tipo: 'BANCARIA',
    finalidade: 'PIX',
    banco: 'Banco Inter',
    agencia: '0001',
    numeroConta: '123456-7',
    saldoInicial: 1000.00,
    dataSaldoInicial: '2025-01-01',
    ativa: true
  },

  contaCartaoCredito: {
    nome: 'Conta Cartão de Crédito',
    tipo: 'BANCARIA',
    finalidade: 'CARTAO_CREDITO',
    banco: 'Banco do Brasil',
    agencia: '1234',
    numeroConta: '98765-4',
    saldoInicial: 500.00,
    dataSaldoInicial: '2025-01-01',
    ativa: true
  },

  contaCartaoDebito: {
    nome: 'Conta Cartão de Débito',
    tipo: 'BANCARIA',
    finalidade: 'CARTAO_DEBITO',
    banco: 'Caixa Econômica',
    agencia: '0987',
    numeroConta: '54321-0',
    saldoInicial: 750.00,
    dataSaldoInicial: '2025-01-01',
    ativa: true
  },

  caixaFisico: {
    nome: 'Caixa Físico Principal',
    tipo: 'CAIXA_FISICO',
    finalidade: 'DINHEIRO',
    saldoInicial: 200.00,
    dataSaldoInicial: '2025-01-01',
    ativa: true
  },

  contaDepositos: {
    nome: 'Conta para Depósitos',
    tipo: 'BANCARIA',
    finalidade: 'DINHEIRO',
    banco: 'Banco Bradesco',
    agencia: '5678',
    numeroConta: '11111-2',
    saldoInicial: 0.00,
    dataSaldoInicial: '2025-01-01',
    ativa: true
  },

  contaInativa: {
    nome: 'Conta Antiga Inativa',
    tipo: 'BANCARIA',
    finalidade: 'OPERACIONAL',
    banco: 'Banco Itaú',
    agencia: '9999',
    numeroConta: '00000-0',
    saldoInicial: 0.00,
    dataSaldoInicial: '2024-01-01',
    ativa: false
  }
};
