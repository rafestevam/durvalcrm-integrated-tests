# Testes BDD Integrados com Ansible - DurvalCRM

Este diretório contém playbooks Ansible para executar testes BDD integrados do DurvalCRM.

## Cenários Implementados

### 1.2 - Login com credenciais inválidas
- **Arquivo**: `playbooks/test_login_credenciais_invalidas.yml`
- **Descrição**: Valida que o sistema rejeita corretamente credenciais inválidas

## Pré-requisitos

- Ubuntu 24.04 LTS no servidor gerenciado
- Ansible 2.9+ instalado na máquina de controle
- Python 3.8+ no servidor
- DurvalCRM stack completa rodando (Backend, Frontend, PostgreSQL, Keycloak)

## Estrutura

```
durvalcrm-integrated-tests/ansible/
├── playbooks/
│   └── test_login_credenciais_invalidas.yml
├── scripts/
│   ├── get_keycloak_admin_token.sh
│   └── validate_auth_failure.py
├── inventory/
│   └── hosts.yml
├── ansible.cfg
└── README.md
```

## Como executar

### Configuração inicial

1. Configure as variáveis de ambiente:
```bash
export TEST_SERVER_IP="192.168.1.100"
export TEST_SERVER_USER="ubuntu"
export SSH_KEY_PATH="~/.ssh/id_rsa"
```

2. Ou edite diretamente o arquivo `inventory/hosts.yml`

### Executar teste de login com credenciais inválidas

```bash
cd durvalcrm-integrated-tests/ansible
ansible-playbook playbooks/test_login_credenciais_invalidas.yml
```

### Executar com variáveis customizadas

```bash
ansible-playbook playbooks/test_login_credenciais_invalidas.yml \
  -e "test_server_ip=10.0.0.50" \
  -e "keycloak_url=http://10.0.0.50:8180"
```

## O que o teste valida

### Cenário 1.2 - Login com credenciais inválidas

1. **GIVEN**: Garante que existe um usuário com email "tesoureiro@org.com"
2. **WHEN**: Tenta autenticar com senha incorreta "senhaerrada"
3. **THEN**: Verifica que:
   - A autenticação falha com status HTTP 400 ou 401
   - Nenhum token JWT é gerado
   - A mensagem de erro apropriada seria exibida
   - O acesso a recursos protegidos é negado
   - Múltiplas tentativas também falham consistentemente

## Scripts auxiliares

### get_keycloak_admin_token.sh
- Obtém token de administrador do Keycloak
- Usado para criar/verificar usuários de teste

### validate_auth_failure.py
- Script Python para validar falhas de autenticação
- Pode ser executado independentemente para testes manuais:
```bash
./scripts/validate_auth_failure.py http://localhost:8180 durvalcrm durvalcrm-frontend tesoureiro@org.com senhaerrada
```

## Relatórios

Os testes geram relatórios detalhados em:
- `/tmp/bdd_login_failed_test_report.txt` - Relatório do teste de credenciais inválidas

## Troubleshooting

1. **Erro de token admin**: Verifique se o Keycloak está rodando e as credenciais admin estão corretas
2. **Timeout de conexão**: Confirme que os serviços estão acessíveis nas portas configuradas
3. **Falha de SSH**: Verifique as permissões da chave SSH e conectividade com o servidor

## Próximos passos

- Adicionar mais cenários de teste BDD
- Implementar testes de recuperação de senha
- Adicionar validação de bloqueio após múltiplas tentativas
- Integrar com pipeline CI/CD