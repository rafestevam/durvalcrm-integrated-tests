# Cenários de Teste BDD - DurvalCRM MVP

## 1. Funcionalidade: Autenticação de Usuário

### Cenário 1.1: Login bem-sucedido
```gherkin
Given que existe um usuário cadastrado com email "tesoureiro@org.com" e senha "senha123"
When o usuário acessa a tela de login
And insere o email "tesoureiro@org.com" e senha "senha123"
And clica no botão "Entrar"
Then o sistema deve autenticar o usuário
And redirecionar para a tela principal
And armazenar o token JWT válido
```

### Cenário 1.2: Login com credenciais inválidas
```gherkin
Given que existe um usuário cadastrado com email "tesoureiro@org.com"
When o usuário insere email "tesoureiro@org.com" e senha incorreta "senhaerrada"
And clica no botão "Entrar"
Then o sistema deve exibir mensagem "Credenciais inválidas"
And não deve redirecionar o usuário
And não deve gerar token JWT
```

### Cenário 1.3: Proteção de rotas sem autenticação
```gherkin
Given que o usuário não está autenticado
When o usuário tenta acessar diretamente a URL "/associados"
Then o sistema deve redirecionar para a tela de login
And exibir mensagem "Acesso negado. Faça login para continuar"
```

## 2. Funcionalidade: Cadastro de Associados

### Cenário 2.1: Cadastro de novo associado com dados válidos
```gherkin
Given que o usuário está logado como tesoureiro
When o usuário acessa a tela "Gestão de Associados"
And clica no botão "+ Adicionar Associado"
And preenche o formulário com:
  | Campo          | Valor                    |
  | Nome Completo  | João Silva Santos        |
  | CPF            | 123.456.789-01          |
  | Email          | joao@email.com          |
  | Telefone       | (11) 99999-1111         |
And clica no botão "Salvar"
Then o sistema deve criar o associado
And exibir mensagem "Associado cadastrado com sucesso"
And redirecionar para a lista de associados
And o novo associado deve aparecer na lista
```

### Cenário 2.2: Tentativa de cadastro com CPF duplicado
```gherkin
Given que já existe um associado com CPF "123.456.789-01"
When o usuário tenta cadastrar um novo associado
And preenche o CPF com "123.456.789-01"
And preenche os demais campos corretamente
And clica no botão "Salvar"
Then o sistema deve exibir erro "CPF já cadastrado no sistema"
And não deve criar o associado
And deve manter o usuário no formulário
```

### Cenário 2.3: Cadastro com campos obrigatórios em branco
```gherkin
Given que o usuário está no formulário de novo associado
When o usuário deixa o campo "Nome Completo" em branco
And preenche os demais campos
And clica no botão "Salvar"
Then o sistema deve exibir erro "Nome Completo é obrigatório"
And não deve submeter o formulário
And deve destacar o campo com erro
```

### Cenário 2.4: Busca de associados por nome
```gherkin
Given que existem os associados:
  | Nome              | CPF           |
  | João Silva Santos | 123.456.789-01|
  | Maria João Oliveira| 987.654.321-09|
  | Pedro Santos      | 111.222.333-44|
When o usuário digita "João" no campo de busca
Then o sistema deve exibir apenas os associados:
  | Nome               |
  | João Silva Santos  |
  | Maria João Oliveira|
```

## 3. Funcionalidade: Gestão de Mensalidades

### Cenário 3.1: Geração de cobranças mensais para todos os associados ativos
```gherkin
Given que existem 3 associados ativos no sistema
And não existem mensalidades geradas para Julho/2025
When o usuário acessa "Gestão de Mensalidades"
And seleciona o mês "Julho" e ano "2025"
And clica no botão "Gerar Cobranças"
Then o sistema deve criar 3 mensalidades com status "PENDENTE"
And cada mensalidade deve ter valor R$ 10,90
And a data de vencimento deve ser o último dia do mês
And deve exibir mensagem "Cobranças geradas com sucesso para 3 associados"
```

### Cenário 3.2: Não gerar cobranças duplicadas para o mesmo mês
```gherkin
Given que já existem mensalidades geradas para Julho/2025
When o usuário tenta gerar cobranças novamente para Julho/2025
Then o sistema deve exibir mensagem "Cobranças já foram geradas para este período"
And não deve criar novas mensalidades
```

### Cenário 3.3: Visualização de status de pagamento dos associados
```gherkin
Given que existem mensalidades para Julho/2025 com diferentes status:
  | Associado | Status   |
  | João      | PAGA     |
  | Maria     | PENDENTE |
  | Pedro     | ATRASADA |
When o usuário seleciona Julho/2025 no dashboard
Then o sistema deve exibir:
  | Lista          | Quantidade |
  | Adimplentes    | 1          |
  | Inadimplentes  | 2          |
And João deve aparecer na lista de adimplentes
And Maria e Pedro devem aparecer na lista de inadimplentes
```

## 4. Funcionalidade: Reconciliação de Pagamentos

### Cenário 4.1: Upload e processamento de extrato CSV
```gherkin
Given que o usuário está na tela de reconciliação
And existe um arquivo CSV com as transações:
  | Data       | Valor  | Descrição                    |
  | 2025-07-15 | 10,90  | PIX RECEBIDO DE CPF 123.456.789-01 |
  | 2025-07-16 | 25,50  | PIX RECEBIDO DE CPF 999.888.777-66 |
When o usuário faz upload do arquivo extrato.csv
And clica em "Processar Extrato"
Then o sistema deve importar 2 transações
And deve identificar automaticamente 1 pagamento (CPF 123.456.789-01)
And deve listar 1 transação não identificada (CPF 999.888.777-66)
And exibir "1 pagamento reconciliado automaticamente, 1 pendente de identificação"
```

### Cenário 4.2: Vinculação manual de transação não identificada
```gherkin
Given que existe uma transação não identificada de R$ 10,90
And existe uma mensalidade pendente de Maria Silva
When o usuário seleciona a transação não identificada
And clica em "Vincular a Associado"
And seleciona "Maria Silva" na lista
And clica em "Confirmar Vinculação"
Then o sistema deve vincular o pagamento à mensalidade de Maria
And alterar o status da mensalidade para "PAGA"
And remover a transação da lista de não identificadas
```

### Cenário 4.3: Registro manual de pagamento em dinheiro
```gherkin
Given que existe uma mensalidade pendente de Pedro Santos
When o usuário acessa "Registro Manual de Pagamento"
And seleciona o associado "Pedro Santos"
And informa método de pagamento "DINHEIRO"
And valor "10,90"
And data de pagamento "2025-07-20"
And clica em "Registrar Pagamento"
Then o sistema deve marcar a mensalidade como "PAGA"
And criar um registro de pagamento com origem "MANUAL"
And exibir "Pagamento registrado com sucesso"
```

## 5. Funcionalidade: Registro de Vendas Avulsas

### Cenário 5.1: Registro rápido de venda na cantina
```gherkin
Given que o usuário tem perfil "Ponto de Venda"
When o usuário acessa a tela de "Registro de Venda"
And seleciona origem "CANTINA"
And informa valor "15,50"
And clica em "Registrar Venda"
Then o sistema deve criar a venda com data atual
And exibir "Venda registrada com sucesso"
And limpar o formulário para nova venda
```

### Cenário 5.2: Validação de valor mínimo
```gherkin
Given que o usuário está registrando uma venda
When informa valor "0,00"
And clica em "Registrar Venda"
Then o sistema deve exibir erro "Valor deve ser maior que zero"
And não deve registrar a venda
```

## 6. Funcionalidade: Dashboard e Relatórios

### Cenário 6.1: Visualização de receita consolidada mensal
```gherkin
Given que existem as seguintes receitas para Julho/2025:
  | Tipo         | Valor Total |
  | Mensalidades | 109,00     |
  | Cantina      | 250,30     |
  | Bazar        | 85,70      |
  | Livros       | 45,00      |
When o usuário seleciona Julho/2025 no dashboard
Then o sistema deve exibir:
  | Métrica              | Valor   |
  | Receita Total        | 490,00  |
  | Receita Mensalidades | 109,00  |
  | Receita Cantina      | 250,30  |
  | Receita Bazar        | 85,70   |
  | Receita Livros       | 45,00   |
```

### Cenário 6.2: Tempo de resposta do relatório
```gherkin
Given que existem 100 associados no sistema
And 500 transações no mês selecionado
When o usuário gera o relatório mensal
Then o sistema deve apresentar os dados em menos de 1 minuto
And todos os valores devem estar corretos
```

## 7. Cenários de Integração e Segurança

### Cenário 7.1: Expiração de token JWT
```gherkin
Given que o usuário está logado há mais de 8 horas
When o token JWT expira
And o usuário tenta fazer uma operação
Then o sistema deve redirecionar para login
And exibir mensagem "Sessão expirada. Faça login novamente"
```

### Cenário 7.2: Validação de CPF
```gherkin
Given que o usuário está cadastrando um associado
When informa CPF "123.456.789-00" (inválido)
And tenta salvar
Then o sistema deve exibir erro "CPF inválido"
And não deve permitir o cadastro
```

### Cenário 7.3: Backup de dados durante operações críticas
```gherkin
Given que o sistema vai processar um extrato com 50 transações
When inicia o processamento
Then o sistema deve criar backup das mensalidades atuais
And processar as transações
And em caso de erro, restaurar o estado anterior
```

## 8. Cenários de Performance e Usabilidade

### Cenário 8.1: Responsividade em tablet
```gherkin
Given que o usuário acessa via tablet
When acessa a tela de "Registro de Venda"
Then a interface deve ser otimizada para toque
And os botões devem ter tamanho adequado (mínimo 44px)
And deve ser possível registrar uma venda em no máximo 3 toques
```

### Cenário 8.2: Carregamento de lista grande de associados
```gherkin
Given que existem 1000 associados cadastrados
When o usuário acessa "Gestão de Associados"
Then o sistema deve implementar paginação
And carregar inicialmente apenas 50 registros
And permitir busca sem recarregar a página
```

## 9. Cenários de Exceção e Recuperação

### Cenário 9.1: Falha na conexão durante upload
```gherkin
Given que o usuário está fazendo upload de um extrato
When a conexão com internet falha durante o upload
Then o sistema deve exibir mensagem de erro clara
And permitir tentar novamente
And não deve corromper dados existentes
```

### Cenário 9.2: Arquivo de extrato corrompido
```gherkin
Given que o usuário faz upload de um arquivo CSV corrompido
When o sistema tenta processar o arquivo
Then deve detectar a corrupção
And exibir mensagem "Arquivo inválido ou corrompido"
And sugerir verificar o formato do arquivo
```