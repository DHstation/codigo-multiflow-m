# 📧 Sistema de Templates de Email - Instalação e Configuração

## 🚀 Instalação

### 1. Backend - Instalar Dependências

```bash
cd backend
npm install juice
```

### 2. Frontend - Instalar Dependências

```bash
cd frontend
npm install react-dnd react-dnd-html5-backend uuid
```

### 3. Executar Migrações do Banco de Dados

```bash
cd backend
npm run db:migrate
```

As migrações criarão as seguintes tabelas:
- `EmailTemplates` - Armazena os templates de email
- `EmailLogs` - Registra o envio de emails
- Atualiza `WebhookLinks` com campos para suporte a email

### 4. Registrar Rotas no Backend ✅ **COMPLETO**

As rotas já foram registradas no arquivo `backend/src/routes/index.ts`:

```typescript
import emailTemplateRoutes from "./emailTemplateRoutes";

// Linha 108 - Rota já adicionada
routes.use(emailTemplateRoutes);
```

**WebhookReceiverController também foi atualizado** para suportar ação de email:
- Processa webhooks com `actionType: 'email'`
- Valida se template está ativo antes de enviar
- Chama `ProcessWebhookEmailService` para emails
- Retorna dados específicos de email na resposta

### 5. Adicionar ao Menu do Frontend ✅ **COMPLETO**

**Rota já adicionada** no arquivo de rotas do React (`frontend/src/routes/index.js`):

```javascript
import EmailTemplates from "../pages/EmailTemplates";

// Rota já configurada
{
  path: "/email-templates",
  component: EmailTemplates,
  isPrivate: true,
  exact: true
}
```

**Menu já adicionado** no arquivo (`frontend/src/layout/MainListItems.js`):

```javascript
import { Email } from "@mui/icons-material";

// Item já adicionado ao menu (linha 918-923)
<ListItemLink
  to="/email-templates"
  primary="Templates de Email"
  icon={<Email />}
  tooltip={collapsed}
/>
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Verifique se as variáveis de SMTP estão configuradas no `.env`:

```env
# Configurações de Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=seu-email@gmail.com
MAIL_PASS=sua-senha-de-app
MAIL_FROM="Sistema <seu-email@gmail.com>"
```

### 2. Redis para Filas

Certifique-se de que o Redis está rodando para o sistema de filas:

```bash
# Verificar se Redis está rodando
redis-cli ping

# Se não estiver, iniciar Redis
redis-server
```

## 📝 Como Usar

### 1. Criar um Template de Email

1. Acesse **Templates de Email** no menu lateral
2. Clique em **Novo Template**
3. Preencha nome e assunto básicos
4. Clique em **Criar e Editar** para abrir o editor visual

### 2. Editor Visual Drag & Drop

#### Blocos Disponíveis:
- **Título**: Cabeçalhos H1, H2, H3
- **Texto**: Parágrafos e texto formatado
- **Imagem**: Imagens com links opcionais
- **Botão**: Call-to-action com links
- **Divisor**: Linha horizontal
- **Espaçador**: Espaço vertical
- **HTML**: Código HTML personalizado

#### Funcionalidades:
- Arraste blocos da paleta para o canvas
- Clique em um bloco para editar propriedades
- Use o painel de propriedades para estilizar
- Preview em tempo real na aba Preview
- Undo/Redo para desfazer alterações
- Inserir variáveis do webhook

### 3. Variáveis Disponíveis

#### Variáveis de Webhook (${variable}):
- `${customer_name}` - Nome do cliente
- `${customer_email}` - Email do cliente
- `${customer_phone}` - Telefone do cliente
- `${product_name}` - Nome do produto
- `${transaction_amount}` - Valor da transação
- `${transaction_status}` - Status do pagamento
- E muitas outras...

#### Variáveis de Sistema ({{variable}}):
- `{{date}}` - Data atual
- `{{time}}` - Hora atual
- `{{greeting}}` - Saudação (Bom dia/tarde/noite)

### 4. Configurar Webhook para Email

1. Vá para **Webhook Links**
2. Crie um novo webhook ou edite existente
3. Em **Tipo de Ação**, selecione **Enviar Email**
4. Escolha o template de email criado
5. Configure o delay de envio:
   - **Imediato**: Envia assim que recebe o webhook
   - **Segundos/Minutos/Horas/Dias**: Aguarda o tempo especificado
6. Configure remetente e reply-to
7. Salve e copie a URL do webhook

### 5. Testar o Sistema

Para testar um webhook de email:

```bash
curl -X POST https://seu-dominio.com/webhook/payment/SEU_HASH_AQUI \
  -H "Content-Type: application/json" \
  -d '{
    "Customer": {
      "full_name": "João Silva",
      "email": "joao@example.com",
      "mobile": "11999999999"
    },
    "Product": {
      "product_name": "Curso de Programação"
    },
    "order_id": "12345",
    "order_status": "approved"
  }'
```

## 🔧 Componentes Criados ✅ **COMPLETO**

### Backend ✅
- `/backend/src/models/EmailTemplate.ts` - Modelo do template
- `/backend/src/models/EmailLog.ts` - Modelo de logs
- `/backend/src/services/EmailService/EmailRenderer.ts` - Renderizador HTML
- `/backend/src/services/EmailTemplateService/*` - Serviços CRUD
- `/backend/src/services/WebhookService/ProcessWebhookEmailService.ts` - Processador
- `/backend/src/queues/EmailQueue.ts` - Fila de emails
- `/backend/src/controllers/EmailTemplateController.ts` - Controller
- `/backend/src/routes/emailTemplateRoutes.ts` - Rotas
- `/backend/src/controllers/WebhookReceiverController.ts` - Atualizado para suporte a email

### Frontend ✅
- `/frontend/src/pages/EmailTemplates/index.js` - Página principal
- `/frontend/src/pages/EmailTemplates/EmailBuilder.js` - Editor visual completo
- `/frontend/src/pages/EmailTemplates/EmailTemplateModal.js` - Modal de criação
- `/frontend/src/pages/EmailTemplates/components/BlocksPalette.js` - Paleta de blocos
- `/frontend/src/pages/EmailTemplates/components/EmailCanvas.js` - Canvas drag-and-drop
- `/frontend/src/pages/EmailTemplates/components/PropertiesPanel.js` - Painel de propriedades
- `/frontend/src/pages/EmailTemplates/components/EmailPreview.js` - Preview responsivo
- `/frontend/src/pages/EmailTemplates/components/VariableSelector.js` - Seletor de variáveis

### Migrações do Banco ✅
- `20250117100000-create-email-templates.ts` - Tabela EmailTemplates
- `20250117100001-create-email-logs.ts` - Tabela EmailLogs
- `20250117100002-update-webhook-links-email-support.ts` - Suporte a email em WebhookLinks

## 📊 Monitoramento

### Dashboard de Estatísticas

A página de templates mostra:
- Total de emails enviados
- Taxa de abertura
- Taxa de cliques
- Emails na fila

### Logs de Email

Todos os emails são registrados em `EmailLogs` com:
- Status (pending, sent, failed, opened, clicked)
- Data/hora de envio
- Erros se houver
- Variáveis utilizadas

## 🐛 Troubleshooting

### Erro: "Template não encontrado"
- Verifique se o template está ativo
- Confirme que pertence à mesma empresa

### Emails não sendo enviados
- Verifique configurações SMTP no `.env`
- Confirme que Redis está rodando
- Verifique logs em `backend/logs/`

### Variáveis não sendo substituídas
- Use `${variable}` para dados do webhook
- Use `{{variable}}` para variáveis do sistema
- Verifique se o nome da variável está correto

## 🔒 Segurança

- Templates são isolados por empresa (multi-tenant)
- Validação de HTML para prevenir XSS
- Rate limiting na fila de emails
- Logs de auditoria completos

## ✅ STATUS DA IMPLEMENTAÇÃO

### ✅ **COMPLETO - Pronto para Uso**
- [x] Backend completo com todos os serviços
- [x] Frontend com editor drag-and-drop funcional
- [x] Integração com sistema de webhooks
- [x] Suporte a variáveis dinâmicas
- [x] Preview responsivo (desktop/mobile)
- [x] Sistema de filas para emails
- [x] Logs e monitoramento

### 📋 **PENDENTE - Fazer Manualmente**
1. **Instalar dependências npm:** ✅ **COMPLETO**
   ```bash
   # Dependências já adicionadas nos package.json
   cd frontend && npm install  # Instala react-dnd e react-dnd-html5-backend
   cd backend && npm install   # Instala juice
   ```

2. **Executar migrações:**
   ```bash
   cd backend && npm run db:migrate
   ```

3. **Configurar variáveis SMTP no .env**

### 🚦 Próximos Passos (Opcionais)

#### Melhorias Futuras:
1. **Templates pré-definidos** para diferentes ocasiões
2. **A/B Testing** de templates
3. **Tracking de abertura** com pixel invisível
4. **Editor de CSS** avançado
5. **Importação/Exportação** de templates
6. **Integração com SendGrid/AWS SES**

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs em `backend/logs/`
2. Consulte a documentação das variáveis
3. Teste com o preview antes de enviar

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0.0