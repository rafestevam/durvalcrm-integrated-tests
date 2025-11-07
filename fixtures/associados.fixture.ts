/**
 * Fixtures de dados para testes de Associados
 *
 * Contém dados de exemplo para criar, atualizar e testar
 * associados nos testes de CRUD.
 */

export interface AssociadoData {
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  endereco?: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  observacoes?: string;
  ativo: boolean;
}

/**
 * Gera um CPF único para testes usando timestamp
 */
export function gerarCpfUnico(): string {
  const timestamp = Date.now().toString();
  const cpf = timestamp.slice(-11).padStart(11, '0');
  // Formato: XXX.XXX.XXX-XX
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
}

/**
 * Gera um email único para testes
 */
export function gerarEmailUnico(nome: string): string {
  const timestamp = Date.now();
  const nomeNormalizado = nome.toLowerCase().replace(/\s+/g, '.');
  return `${nomeNormalizado}.${timestamp}@teste.com`;
}

export const associadosFixtures: Record<string, AssociadoData> = {
  // Associado completo com todos os dados
  associadoCompleto: {
    nomeCompleto: 'João da Silva Santos',
    cpf: '123.456.789-00',
    email: 'joao.silva@email.com',
    telefone: '(11) 98765-4321',
    dataNascimento: '1985-05-15',
    endereco: {
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: 'Apto 45',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567'
    },
    observacoes: 'Associado desde 2020',
    ativo: true
  },

  // Associado com dados mínimos
  associadoMinimo: {
    nomeCompleto: 'Maria Oliveira',
    cpf: '987.654.321-00',
    email: 'maria.oliveira@email.com',
    telefone: '(11) 91234-5678',
    dataNascimento: '1990-08-20',
    ativo: true
  },

  // Associado para atualização
  associadoParaAtualizar: {
    nomeCompleto: 'Pedro Henrique Costa',
    cpf: '111.222.333-44',
    email: 'pedro.costa@email.com',
    telefone: '(21) 99876-5432',
    dataNascimento: '1978-12-10',
    endereco: {
      logradouro: 'Avenida Principal',
      numero: '456',
      bairro: 'Jardim América',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      cep: '20000-000'
    },
    ativo: true
  },

  // Dados atualizados
  dadosAtualizados: {
    nomeCompleto: 'Pedro Henrique Costa Junior',
    cpf: '111.222.333-44',
    email: 'pedro.costa.jr@email.com',
    telefone: '(21) 98888-7777',
    dataNascimento: '1978-12-10',
    endereco: {
      logradouro: 'Rua Nova',
      numero: '789',
      complemento: 'Casa 2',
      bairro: 'Copacabana',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      cep: '22000-000'
    },
    observacoes: 'Dados atualizados em 2025',
    ativo: true
  },

  // Associado para inativação
  associadoParaInativar: {
    nomeCompleto: 'Ana Paula Ferreira',
    cpf: '555.666.777-88',
    email: 'ana.ferreira@email.com',
    telefone: '(31) 97777-6666',
    dataNascimento: '1995-03-25',
    ativo: true
  },

  // Associado inativo
  associadoInativo: {
    nomeCompleto: 'Carlos Eduardo Almeida',
    cpf: '999.888.777-66',
    email: 'carlos.almeida@email.com',
    telefone: '(41) 96666-5555',
    dataNascimento: '1982-07-30',
    observacoes: 'Inativo desde 2024',
    ativo: false
  }
};

/**
 * Cria um novo associado com CPF e email únicos
 */
export function criarAssociadoUnico(base: Partial<AssociadoData> = {}): AssociadoData {
  const timestamp = Date.now();
  const nome = base.nomeCompleto || `Associado Teste ${timestamp}`;

  return {
    nomeCompleto: nome,
    cpf: gerarCpfUnico(),
    email: gerarEmailUnico(nome),
    telefone: base.telefone || '(11) 99999-9999',
    dataNascimento: base.dataNascimento || '1990-01-01',
    endereco: base.endereco,
    observacoes: base.observacoes,
    ativo: base.ativo !== undefined ? base.ativo : true
  };
}
