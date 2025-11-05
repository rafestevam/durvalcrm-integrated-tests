# Guia de Troubleshooting - Testes Integrados DurvalCRM

Este guia ajuda a diagnosticar e resolver problemas comuns ao executar os testes.

## 🔧 Ferramentas de Debug

### 1. Teste de Debug de Login

Execute o teste de debug para diagnosticar problemas de autenticação:

```bash
# Com interface visual
npm run test:debug-login

# Com UI interativa
npm run test:debug-login-ui
```

Este teste irá:
- ✅ Capturar screenshots em cada etapa
- ✅ Listar todos os inputs e botões visíveis
- ✅ Salvar o HTML da página
- ✅ Verificar conectividade com aplicação e Keycloak
- ✅ Mostrar logs detalhados no console

### 2. Screenshots e Vídeos

Após uma falha, verifique:
- **Screenshots**: `test-results/login-error-*.png`
- **Vídeos**: `test-results/videos/`
- **HTML da página**: `test-results/debug-page-content.html`

## 🐛 Problemas Comuns

### Erro: "Timeout waiting for locator('input[name=\"username\"]')"

**Causa**: O Playwright não consegue encontrar o campo de login.

**Soluções**:

1. **Verifique se a aplicação está rodando:**
   ```bash
   curl http://localhost:9080/crm/login
   ```
   Deve retornar status 200.

2. **Verifique se o Keycloak está rodando:**
   ```bash
   curl http://localhost:8080
   ```

3. **Execute o teste de debug:**
   ```bash
   npm run test:debug-login
   ```
   Verifique os logs e screenshots gerados.

4. **Verifique a URL no navegador:**
   - Abra: `http://localhost:9080/crm/login`
   - Deve redirecionar para Keycloak ou mostrar formulário de login

5. **Verifique as credenciais:**
   - Usuário: `tesouraria`
   - Senha: `cairbar@2025`
   - Confirme que o usuário existe no Keycloak

### Erro: "Timeout 60000ms exceeded"

**Causa**: A aplicação está demorando muito para responder.

**Soluções**:

1. **Verifique se o WildFly está rodando:**
   ```bash
   # Verificar processo WildFly
   ps aux | grep wildfly
   ```

2. **Verifique os logs do WildFly:**
   ```bash
   tail -f /path/to/wildfly/standalone/log/server.log
   ```

3. **Verifique se há problemas de memória:**
   - WildFly precisa de memória suficiente
   - Configure `-Xmx` se necessário

4. **Reinicie o WildFly:**
   ```bash
   # Parar WildFly
   /path/to/wildfly/bin/jboss-cli.sh --connect command=:shutdown

   # Iniciar WildFly
   /path/to/wildfly/bin/standalone.sh
   ```

### Erro: "Navigation timeout of 20000ms exceeded"

**Causa**: Redirecionamentos entre aplicação e Keycloak demorando muito.

**Soluções**:

1. **Verifique configuração de rede:**
   - DNS local pode estar lento
   - Adicione entradas no `/etc/hosts` se necessário

2. **Aumente os timeouts temporariamente:**

   Edite `.env`:
   ```env
   TEST_TIMEOUT=90000
   ```

3. **Verifique configuração do Keycloak:**
   - Realm está configurado corretamente?
   - Client redirect URIs estão corretos?

### Erro: "Campo de username/password não encontrado"

**Causa**: Os seletores CSS não correspondem aos elementos da página.

**Soluções**:

1. **Execute o teste de debug:**
   ```bash
   npm run test:debug-login
   ```

2. **Verifique o HTML gerado:**
   - Abra `test-results/debug-page-content.html`
   - Procure pelos campos de input
   - Verifique os atributos `name`, `id`, `class`

3. **Atualize os seletores no auth.helper.ts:**
   ```typescript
   const usernameSelectors = [
     'input[name="username"]',
     'input[id="username"]',
     // Adicione o seletor correto aqui
   ];
   ```

### Erro: "Login bem-sucedido mas testes falham"

**Causa**: Navegação após login não está indo para a página esperada.

**Soluções**:

1. **Verifique a URL padrão após login:**
   - Pode redirecionar para `/dashboard`, `/associados`, etc.
   - Atualize o regex em `waitForLoginSuccess()`

2. **Adicione a rota no regex:**
   ```typescript
   await this.page.waitForURL(
     /.*\/(dashboard|associados|contas|mensalidades|sua-rota).*/,
     { timeout: 15000 }
   );
   ```

### Erro: "Element not visible"

**Causa**: Elemento existe no DOM mas está oculto.

**Soluções**:

1. **Aguarde o elemento aparecer:**
   ```typescript
   await page.waitForSelector('[data-testid="elemento"]', { state: 'visible' });
   ```

2. **Verifique CSS/JS que pode esconder elementos:**
   - Modais não abertos
   - Tabs não selecionadas
   - Elementos com `display: none`

3. **Use screenshots para debug:**
   ```typescript
   await page.screenshot({ path: 'debug.png', fullPage: true });
   ```

## 🔍 Comandos Úteis de Debug

### Inspecionar Página Atual

```typescript
// No teste, adicione:
await page.pause(); // Pausa para inspeção manual
```

### Executar com Logs Detalhados

```bash
DEBUG=pw:api npm run test:debug-login
```

### Executar Teste Específico

```bash
# Um teste específico
npx playwright test -g "Deve permitir cadastrar conta"

# Com modo headed (ver navegador)
npx playwright test -g "Deve permitir cadastrar conta" --headed

# Com debug passo a passo
npx playwright test -g "Deve permitir cadastrar conta" --debug
```

### Gerar Código de Teste Automaticamente

Use o Playwright Codegen para gerar seletores:

```bash
npm run codegen http://localhost:9080/crm
```

Isso abrirá o navegador e gerará código conforme você interage.

## 📊 Verificar Saúde do Ambiente

### Script de Verificação Completa

Crie um arquivo `check-env.sh`:

```bash
#!/bin/bash

echo "=== Verificando Ambiente de Testes ==="

# Verificar aplicação
echo -n "Aplicação (http://localhost:9080/crm): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:9080/crm | grep -q "200\|302"; then
    echo "✅ OK"
else
    echo "❌ FALHOU"
fi

# Verificar Keycloak
echo -n "Keycloak (http://localhost:8080): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
    echo "✅ OK"
else
    echo "❌ FALHOU"
fi

# Verificar WildFly
echo -n "WildFly: "
if ps aux | grep -q "[w]ildfly"; then
    echo "✅ Rodando"
else
    echo "❌ Não está rodando"
fi

# Verificar PostgreSQL
echo -n "PostgreSQL: "
if pg_isready -q; then
    echo "✅ OK"
else
    echo "❌ FALHOU"
fi

echo ""
echo "=== Fim da Verificação ==="
```

Execute:
```bash
chmod +x check-env.sh
./check-env.sh
```

## 🆘 Ainda com Problemas?

1. **Limpe o cache:**
   ```bash
   rm -rf test-results playwright-report
   npm run test:debug-login
   ```

2. **Reinstale dependências:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npx playwright install chromium
   ```

3. **Verifique versões:**
   ```bash
   node --version    # Deve ser 18+
   npm --version
   npx playwright --version
   ```

4. **Colete informações para suporte:**
   - Execute `npm run test:debug-login`
   - Cole os logs do console
   - Anexe screenshots de `test-results/`
   - Informe versões de Node, Playwright, etc.

## 📝 Logs Importantes

### Logs do Auth Helper

O helper de autenticação gera logs no formato:
```
[AUTH] Iniciando login com usuário: tesouraria
[AUTH] Navegando para /login
[AUTH] URL atual: http://localhost:9080/crm/login
[AUTH] Procurando botão de login na aplicação
[AUTH] Botão de login encontrado com seletor: button:has-text("Entrar")
[AUTH] Preenchendo credenciais no Keycloak
[AUTH] Campo username encontrado: input[name="username"]
[AUTH] Campo password encontrado: input[name="password"]
[AUTH] Botão submit encontrado: button[type="submit"]
[AUTH] Aguardando login ser concluído...
[AUTH] Login bem-sucedido! Redirecionado para: http://localhost:9080/crm/dashboard
```

Se algum passo falhar, os logs indicarão onde parou.

---

**Última atualização**: Novembro 2025
**Mantido por**: DurvalCRM Team
