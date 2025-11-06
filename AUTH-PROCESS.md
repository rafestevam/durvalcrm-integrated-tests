# Processo de Autenticação - DurvalCRM

Documentação do fluxo de autenticação utilizado nos testes integrados.

## 🔐 Fluxo de Login

Todos os testes seguem o seguinte processo de autenticação:

### 1. Acessar página de login
```
URL: http://localhost:9080/crm/login
```

### 2. Clicar no botão "Entrar com Keycloak"
O botão pode ter os seguintes textos:
- "Entrar com Keycloak" (preferencial)
- "Entrar"

### 3. Preencher credenciais no Keycloak

**Credenciais padrão:**
- **Usuário**: `tesouraria`
- **Senha**: `cairbar@2025`

### 4. Aguardar redirecionamento

Após submeter as credenciais, o Keycloak redireciona de volta para a aplicação.

### 5. Redirecionamento para painel

**URL final esperada:** `http://localhost:9080/crm/painel`

Outras URLs aceitas como login bem-sucedido:
- `/painel` (padrão)
- `/dashboard`
- `/associados`
- `/contas`
- `/mensalidades`

## 🔧 Implementação nos Testes

O `AuthHelper` implementa esse fluxo automaticamente:

```typescript
import { AuthHelper } from '../helpers/auth.helper';

test.beforeEach(async ({ page }) => {
  const authHelper = new AuthHelper(page);

  // Login com credenciais padrão (tesouraria/cairbar@2025)
  await authHelper.login();

  // Ou com credenciais customizadas
  await authHelper.login('outro-usuario', 'outra-senha');
});
```

## 📝 Logs do Processo

O AuthHelper gera logs detalhados de cada passo:

```
[AUTH] Iniciando processo de login com usuário: tesouraria
[AUTH] Passo 1: Acessando /login
[AUTH] URL atual: http://localhost:9080/crm/login
[AUTH] Passo 2: Procurando botão "Entrar com Keycloak"
[AUTH] Botão encontrado com seletor: button:has-text("Entrar com Keycloak")
[AUTH] Botão "Entrar com Keycloak" encontrado, clicando...
[AUTH] Passo 3: Aguardando redirecionamento para Keycloak...
[AUTH] Passo 4: Preenchendo credenciais no Keycloak
[AUTH] Preenchendo username...
[AUTH] Username preenchido usando: input[name="username"]
[AUTH] Preenchendo password...
[AUTH] Password preenchido usando: input[name="password"]
[AUTH] Clicando no botão de submit...
[AUTH] Submit clicado usando: button[type="submit"]
[AUTH] Credenciais submetidas com sucesso
[AUTH] Passo 5: Aguardando redirecionamento para /painel
[AUTH] ✅ Redirecionamento detectado para: http://localhost:9080/crm/painel
[AUTH] ✅ Login concluído com sucesso!
[AUTH] URL final: http://localhost:9080/crm/painel
```

## 🐛 Troubleshooting

### Erro: "Botão 'Entrar com Keycloak' não encontrado"

**Possíveis causas:**
1. Aplicação não está rodando em `http://localhost:9080/crm`
2. Botão tem texto diferente
3. Página de login não carregou completamente

**Solução:**
```bash
# Verificar se a aplicação está respondendo
curl http://localhost:9080/crm/login

# Executar teste de debug para ver a página
npm run test:debug-login
```

### Erro: "Campo de username não encontrado"

**Possíveis causas:**
1. Keycloak não está rodando
2. Redirecionamento para Keycloak falhou
3. Página do Keycloak mudou estrutura

**Solução:**
```bash
# Verificar se Keycloak está rodando
curl http://localhost:8080

# Ver screenshot de erro em test-results/
```

### Erro: Timeout aguardando redirecionamento

**Possíveis causas:**
1. Credenciais incorretas
2. Backend muito lento
3. Problema na configuração do Keycloak

**Solução:**
1. Verificar credenciais: `tesouraria` / `cairbar@2025`
2. Verificar logs do WildFly
3. Verificar configuração do client no Keycloak

## 🔄 Logout

O processo de logout segue os seguintes passos:

1. Clicar no menu do usuário
2. Clicar no botão "Sair"
3. Aguardar redirecionamento para `/login`

```typescript
await authHelper.logout();
```

## ⚙️ Configuração

### Credenciais padrão

Definidas no `AuthHelper`:
```typescript
async login(username: string = 'tesouraria', password: string = 'cairbar@2025')
```

### Variáveis de ambiente (opcional)

Crie um arquivo `.env`:

```env
BASE_URL=http://localhost:9080/crm
TEST_USERNAME=tesouraria
TEST_PASSWORD=cairbar@2025
```

## 🎯 Seletores Data-TestID Recomendados

Para melhorar a estabilidade dos testes, recomenda-se adicionar esses `data-testid` no frontend:

### Página de Login
```html
<button data-testid="btn-login-keycloak">Entrar com Keycloak</button>
```

### Menu do Usuário
```html
<button data-testid="user-menu">Menu do Usuário</button>
<button data-testid="btn-logout">Sair</button>
```

## 📊 Timeouts Configurados

- **Página de login**: 20 segundos
- **Redirecionamento para Keycloak**: 2 segundos
- **Campos no Keycloak**: 2 segundos por campo
- **Redirecionamento para /painel**: 20 segundos
- **Carregamento da página**: 10 segundos
- **Network idle**: 5 segundos (com fallback)

## ✅ Validações Realizadas

O `AuthHelper` valida:

1. ✅ Página de login carregou
2. ✅ Botão de login existe e está visível
3. ✅ Redirecionamento para Keycloak ocorreu
4. ✅ Campos de username e password estão presentes
5. ✅ Credenciais foram preenchidas
6. ✅ Botão de submit foi clicado
7. ✅ Redirecionamento de volta para aplicação ocorreu
8. ✅ URL final é uma página interna válida

---

**Versão**: 2.0
**Última Atualização**: Novembro 2025
**Status**: Processo padronizado e documentado
