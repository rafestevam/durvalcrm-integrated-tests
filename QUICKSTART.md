# Quick Start - Testes Integrados DurvalCRM

Guia rápido para começar a executar os testes integrados de negócio.

## ⚡ Setup Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Instalar navegadores
npx playwright install chromium

# 3. Configurar variáveis de ambiente (opcional)
cp .env.example .env
# Editar .env com as configurações do seu ambiente

# 4. Verificar que a aplicação está rodando
# Frontend: http://localhost:3000
# Backend: http://localhost:8082 ou https://localhost:9991
# Keycloak: http://localhost:8080
```

## 🏃 Executando os Testes

### Opção 1: Modo UI (Recomendado para desenvolvimento)

```bash
npm run test:ui
```

Isso abrirá uma interface interativa onde você pode:
- Ver todos os testes disponíveis
- Executar testes individuais
- Ver o resultado em tempo real
- Inspecionar cada passo do teste

### Opção 2: Modo Headless (CI/CD)

```bash
npm test
```

Executa todos os testes sem abrir o navegador (mais rápido).

### Opção 3: Modo Debug

```bash
npm run test:debug
```

Abre o Playwright Inspector para debug passo a passo.

## 📋 Testes Disponíveis na Sprint 1

### US-060: Contas Bancárias

```bash
npm run test:us060
```

**Cenários testados:**
- ✅ Cadastro de conta bancária
- ✅ Cadastro de caixa físico
- ✅ Validações de campos
- ✅ Listagem e filtros
- ✅ Edição e inativação

### US-061: Registro de Recebimentos

```bash
npm run test:us061
```

**Cenários testados:**
- ✅ Registro de recebimento
- ✅ Seleção automática de conta
- ✅ Vinculação a associado/venda
- ✅ Validações de negócio
- ✅ Listagem e filtros

## 🎯 Primeiro Teste

Execute o teste mais simples para verificar que tudo está funcionando:

```bash
# Executar apenas um teste específico
npx playwright test tests/sprint01/us060-contas-bancarias.spec.ts -g "Deve permitir cadastrar conta bancária"
```

Se esse teste passar, sua configuração está correta! ✅

## 🐛 Troubleshooting

### Problema: "Timeout waiting for locator"

**Causa**: Aplicação não está rodando ou URL está incorreta.

**Solução**:
1. Verifique se o frontend está rodando: `http://localhost:3000`
2. Verifique a variável `BASE_URL` no `.env` ou `playwright.config.ts`

### Problema: "Login não funciona"

**Causa**: Keycloak não está configurado ou credenciais incorretas.

**Solução**:
1. Verifique se Keycloak está rodando: `http://localhost:8080`
2. Verifique as credenciais no `auth.helper.ts` (padrão: admin/admin)
3. Certifique-se que o realm e cliente estão configurados

### Problema: "Element not found"

**Causa**: O elemento no frontend não tem o `data-testid` esperado.

**Solução**:
1. Abra o teste em modo debug: `npm run test:debug`
2. Inspecione o DOM para encontrar o seletor correto
3. Atualize o teste com o seletor correto
4. Ou adicione `data-testid` no componente do frontend

## 📊 Ver Relatório de Testes

Após executar os testes, veja o relatório HTML:

```bash
npm run report
```

Isso abrirá automaticamente o relatório no navegador mostrando:
- ✅ Testes que passaram
- ❌ Testes que falharam
- ⏱️ Tempo de execução
- 📸 Screenshots de falhas
- 🎥 Vídeos de testes com retry

## 🔄 Workflow Recomendado

### Para Desenvolvedores

1. **Desenvolver funcionalidade** no frontend/backend
2. **Executar testes relacionados** em modo UI
3. **Corrigir falhas** se necessário
4. **Executar todos os testes** antes de commitar
5. **Verificar relatório** de cobertura

### Para QA/Testers

1. **Executar suite completa**: `npm test`
2. **Analisar relatório**: `npm run report`
3. **Reportar bugs** encontrados
4. **Re-executar testes específicos** após correções

## 📝 Próximos Passos

1. ✅ Execute os testes da Sprint 1
2. 📖 Leia o [README.md](README.md) completo
3. 🔨 Aprenda a [escrever novos testes](README.md#-escrevendo-novos-testes)
4. 🤝 Contribua com novos cenários de teste

## 🆘 Ajuda

- **Documentação Playwright**: https://playwright.dev/
- **Issues do Projeto**: [GitHub Issues]
- **Slack**: #durvalcrm-tests

---

**Dica**: Use `npm run test:ui` para desenvolvimento e `npm test` para CI/CD! 🚀
