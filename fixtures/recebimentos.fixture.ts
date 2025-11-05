/**
 * Fixtures de dados para testes de Recebimentos
 *
 * Contém dados de exemplo para criar recebimentos
 * nos testes.
 */

export interface RecebimentoData {
  data: string;
  valor: number;
  formaPagamento: 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'DINHEIRO';
  origemRecebimento: 'MENSALIDADE' | 'VENDA_PRODUTOS' | 'TRANSFERENCIA_BAZAR' | 'VENDA_CANTINA';
  contaDestino?: string; // Nome da conta (será selecionada automaticamente)
  observacoes?: string;
  associadoId?: number; // Para vincular a um associado (se origem = MENSALIDADE)
  vendaId?: number; // Para vincular a uma venda (se origem = VENDA_PRODUTOS/CANTINA)
}

export const recebimentosFixtures: Record<string, RecebimentoData> = {
  mensalidadePix: {
    data: '2025-11-05',
    valor: 10.90,
    formaPagamento: 'PIX',
    origemRecebimento: 'MENSALIDADE',
    observacoes: 'Mensalidade referente a Novembro/2025'
  },

  mensalidadeDinheiro: {
    data: '2025-11-05',
    valor: 10.90,
    formaPagamento: 'DINHEIRO',
    origemRecebimento: 'MENSALIDADE',
    observacoes: 'Mensalidade paga em dinheiro'
  },

  vendaCantinaCartao: {
    data: '2025-11-05',
    valor: 25.50,
    formaPagamento: 'CARTAO_DEBITO',
    origemRecebimento: 'VENDA_CANTINA',
    observacoes: 'Venda de lanches'
  },

  vendaProdutosCartaoCredito: {
    data: '2025-11-05',
    valor: 150.00,
    formaPagamento: 'CARTAO_CREDITO',
    origemRecebimento: 'VENDA_PRODUTOS',
    observacoes: 'Venda de livros espíritas'
  },

  transferenciaBazarDinheiro: {
    data: '2025-11-05',
    valor: 380.00,
    formaPagamento: 'DINHEIRO',
    origemRecebimento: 'TRANSFERENCIA_BAZAR',
    observacoes: 'Transferência do efetivo do bazar beneficente'
  },

  doacaoAvulsaPix: {
    data: '2025-11-05',
    valor: 100.00,
    formaPagamento: 'PIX',
    origemRecebimento: 'VENDA_PRODUTOS', // Pode ser usado como doação
    observacoes: 'Doação avulsa de colaborador'
  },

  recebimentoAlto: {
    data: '2025-11-05',
    valor: 5000.00,
    formaPagamento: 'PIX',
    origemRecebimento: 'VENDA_PRODUTOS',
    observacoes: 'Recebimento alto para teste de validação'
  }
};
