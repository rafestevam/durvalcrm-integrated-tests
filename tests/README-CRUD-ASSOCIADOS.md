# Teste CRUD - Associados

Teste integrado completo para as operações de CRUD (Create, Read, Update, Delete) do módulo de Associados do DurvalCRM.

## 📋 Visão Geral

Este teste valida todas as funcionalidades principais do módulo de Associados:

- **CREATE**: Criação de novos associados
- **READ**: Listagem, busca e visualização de detalhes
- **UPDATE**: Atualização de dados cadastrais
- **DELETE**: Inativação e reativação (soft delete)

## 🚀 Como Executar

### Executar todos os testes de CRUD

```bash
npm run test:crud-associados
```

### Com navegador visível (recomendado para desenvolvimento)

```bash
npm run test:crud-associados:headed
```

### Modo debug interativo

```bash
npm run test:crud-associados:debug
```

### Executar teste específico

```bash
# Apenas testes de criação
npx playwright test -g "CREATE - Criação de Associado"

# Apenas testes de leitura
npx playwright test -g "READ - Leitura e Listagem"

# Apenas testes de atualização
npx playwright test -g "UPDATE - Atualização"

# Apenas testes de inativação
npx playwright test -g "DELETE - Inativação"
```

## 📝 Testes Implementados

### CREATE - Criação de Associado (4 testes)

1. **Deve permitir cadastrar associado com todos os campos**
   - Testa criação com dados completos (endereço, observações, etc.)

2. **Deve permitir cadastrar associado com dados mínimos obrigatórios**
   - Testa criação apenas com campos obrigatórios

3. **Deve validar campos obrigatórios**
   - Testa mensagens de erro quando campos obrigatórios não são preenchidos

4. **Deve validar CPF único (não permitir duplicação)**
   - Testa que o sistema não permite cadastrar dois associados com mesmo CPF

### READ - Leitura e Listagem (3 testes)

1. **Deve listar todos os associados ativos**
   - Testa que a listagem exibe todos os associados cadastrados

2. **Deve permitir buscar associado por nome**
   - Testa funcionalidade de busca/filtro

3. **Deve exibir detalhes completos do associado**
   - Testa visualização de todos os dados de um associado

### UPDATE - Atualização (2 testes)

1. **Deve permitir editar dados pessoais do associado**
   - Testa atualização de nome, telefone, email, etc.

2. **Deve permitir atualizar endereço do associado**
   - Testa adicionar/atualizar endereço

### DELETE - Inativação (3 testes)

1. **Deve permitir inativar associado (soft delete)**
   - Testa que associado é marcado como inativo (não deletado fisicamente)

2. **Deve permitir visualizar associados inativos**
   - Testa filtro para exibir associados inativos

3. **Deve permitir reativar associado inativo**
   - Testa reativação de associado previamente inativado

## 🎯 Fixtures de Dados

O teste utiliza fixtures para dados de teste consistentes. Veja `fixtures/associados.fixture.ts`:

```typescript
import { criarAssociadoUnico } from '../fixtures/associados.fixture';

// Cria associado com dados únicos (CPF e email gerados automaticamente)
const associado = criarAssociadoUnico({
  nomeCompleto: 'João da Silva',
  telefone: '(11) 98765-4321',
  dataNascimento: '1985-05-15'
});
```

### Fixtures Disponíveis

- `associadoCompleto`: Dados completos com endereço e observações
- `associadoMinimo`: Apenas campos obrigatórios
- `associadoParaAtualizar`: Para testes de edição
- `dadosAtualizados`: Dados após atualização
- `associadoParaInativar`: Para testes de inativação
- `associadoInativo`: Associado já inativo

### Funções Utilitárias

- `gerarCpfUnico()`: Gera CPF único baseado em timestamp
- `gerarEmailUnico(nome)`: Gera email único
- `criarAssociadoUnico(dados)`: Cria associado com dados únicos

## 🔍 Seletores Utilizados

O teste usa `data-testid` para seletores estáveis:

### Navegação e Listagem
- `btn-novo-associado`: Botão para criar novo associado
- `input-busca-associado`: Campo de busca
- `btn-buscar`: Botão de busca
- `toggle-mostrar-inativos`: Toggle para mostrar inativos

### Formulário de Cadastro
- `input-nome-completo`: Nome completo
- `input-cpf`: CPF
- `input-email`: Email
- `input-telefone`: Telefone
- `input-data-nascimento`: Data de nascimento
- `input-logradouro`: Logradouro
- `input-numero`: Número do endereço
- `input-complemento`: Complemento
- `input-bairro`: Bairro
- `input-cidade`: Cidade
- `select-estado`: Estado (UF)
- `input-cep`: CEP
- `textarea-observacoes`: Observações
- `btn-salvar-associado`: Botão salvar

### Ações na Listagem
- `btn-visualizar-{cpf}`: Botão visualizar (CPF sem formatação)
- `btn-editar-{cpf}`: Botão editar
- `btn-inativar-{cpf}`: Botão inativar
- `btn-reativar-{cpf}`: Botão reativar
- `btn-confirmar-inativacao`: Confirmação de inativação

### Feedback
- `alert-success`: Mensagem de sucesso
- `alert-error`: Mensagem de erro
- `error-{campo}`: Erro de validação por campo
- `badge-inativo`: Badge indicando associado inativo

### Visualização de Detalhes
- `detalhe-nome`: Nome no detalhe
- `detalhe-cpf`: CPF no detalhe
- `detalhe-email`: Email no detalhe
- `detalhe-telefone`: Telefone no detalhe
- `detalhe-endereco`: Endereço no detalhe
- `detalhe-observacoes`: Observações no detalhe

## ✅ Boas Práticas Implementadas

1. **Dados únicos**: Cada teste cria dados únicos (CPF e email) para evitar conflitos
2. **Isolamento**: Testes são independentes e podem rodar em qualquer ordem
3. **AAA Pattern**: Arrange, Act, Assert claramente separados
4. **Seletores estáveis**: Uso de `data-testid` ao invés de classes CSS
5. **Mensagens descritivas**: Nomes de teste em português descrevendo comportamento esperado
6. **Fixtures reutilizáveis**: Dados de teste centralizados e reutilizáveis

## 🐛 Troubleshooting

### Teste falha em "Deve validar CPF único"

- Verifique se o backend está validando unicidade de CPF
- Confira se o banco de dados tem constraint UNIQUE em CPF

### Teste falha em "Deve listar todos os associados"

- Pode haver muitos associados no banco
- Considere usar paginação ou filtros nos testes

### Seletores não encontrados

- Verifique se os `data-testid` estão implementados no frontend
- Use `npm run codegen` para gerar seletores corretos

### Timeout ao criar associado

- Verifique se o backend está respondendo
- Aumente timeout em `playwright.config.ts` se necessário

## 📚 Referências

- **Arquivo de teste**: `tests/crud-associados.spec.ts`
- **Fixtures**: `fixtures/associados.fixture.ts`
- **Helper de autenticação**: `helpers/auth.helper.ts`
- **Helper de navegação**: `helpers/navigation.helper.ts`

---

**Versão**: 1.0
**Última Atualização**: Novembro 2025
**Autor**: DurvalCRM Team
