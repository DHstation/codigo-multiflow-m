import WebhookLink from "../../models/WebhookLink";
import EmailTemplate from "../../models/EmailTemplate";
import EmailRenderer from "../EmailService/EmailRenderer";
import { addEmailToQueue, calculateDelay } from "../../queues/EmailQueue";
import { extractVariables, determineEventType } from "../../utils/PaymentDataExtractor";
import logger from "../../utils/logger";
import AppError from "../../errors/AppError";

interface ProcessEmailRequest {
  webhookLink: WebhookLink;
  payload: any;
  ipAddress?: string;
  userAgent?: string;
}

interface ProcessEmailResult {
  scheduled: boolean;
  scheduledFor: Date;
  emailTemplateId: number;
  recipientEmail: string;
  subject: string;
  delay: number;
}

const ProcessWebhookEmailService = async ({
  webhookLink,
  payload,
  ipAddress,
  userAgent
}: ProcessEmailRequest): Promise<ProcessEmailResult> => {

  const startTime = Date.now();

  try {
    // 1. Verificar se o template existe
    if (!webhookLink.emailTemplateId) {
      throw new AppError("Template de email não configurado para este webhook", 400);
    }

    const emailTemplate = await EmailTemplate.findOne({
      where: {
        id: webhookLink.emailTemplateId,
        companyId: webhookLink.companyId,
        active: true
      }
    });

    if (!emailTemplate) {
      throw new AppError("Template de email não encontrado ou inativo", 404);
    }

    // 2. Extrair variáveis do webhook
    const variables = extractVariables(webhookLink.platform, payload);
    const eventType = determineEventType(webhookLink.platform, payload);

    logger.info(`[WEBHOOK EMAIL] Processando webhook para email - Plataforma: ${webhookLink.platform}, Evento: ${eventType}`);
    logger.info(`[WEBHOOK EMAIL] Dados extraídos - Nome: ${variables.customer_name}, Email: ${variables.customer_email}`);

    // 3. Verificar se temos um email de destinatário
    if (!variables.customer_email) {
      throw new AppError("Email do cliente não encontrado no payload", 400);
    }

    // 4. Adicionar variáveis extras
    const enrichedVariables = {
      ...variables,
      webhook_platform: webhookLink.platform,
      webhook_event_type: eventType,
      webhook_link_name: webhookLink.name,
      company_name: process.env.COMPANY_NAME || "Nossa Empresa"
    };

    // 5. Renderizar o HTML do email
    const emailRenderer = new EmailRenderer();
    const html = await emailRenderer.render(emailTemplate, enrichedVariables);

    // 6. Processar o assunto com variáveis
    const subject = replaceVariables(emailTemplate.subject, enrichedVariables);

    // 7. Configurações de email
    const emailSettings = webhookLink.emailSettings || {
      sendDelay: 0,
      delayType: "immediate",
      fromName: process.env.COMPANY_NAME || "Sistema",
      fromEmail: process.env.MAIL_USER || "noreply@example.com",
      replyTo: process.env.MAIL_USER || "noreply@example.com"
    };

    // 8. Calcular delay
    const delay = calculateDelay(
      emailSettings.sendDelay || 0,
      emailSettings.delayType || "immediate"
    );

    logger.info(`[WEBHOOK EMAIL] Email será enviado com delay de ${delay}ms (${emailSettings.delayType})`);

    // 9. Adicionar email à fila
    const emailData = {
      to: variables.customer_email,
      subject,
      html,
      from: emailSettings.fromEmail,
      fromName: emailSettings.fromName,
      replyTo: emailSettings.replyTo,
      templateId: emailTemplate.id,
      webhookLinkId: webhookLink.id,
      companyId: webhookLink.companyId,
      recipientName: variables.customer_name,
      variables: enrichedVariables,
      metadata: {
        platform: webhookLink.platform,
        eventType,
        ipAddress,
        userAgent,
        processedAt: new Date()
      }
    };

    const job = await addEmailToQueue(emailData, delay);

    logger.info(`[WEBHOOK EMAIL] Email adicionado à fila - Job ID: ${job.id}, Para: ${variables.customer_email}`);

    // 10. Atualizar estatísticas do webhook
    await webhookLink.update({
      totalRequests: webhookLink.totalRequests + 1,
      successfulRequests: webhookLink.successfulRequests + 1,
      lastRequestAt: new Date()
    });

    const scheduledFor = new Date(Date.now() + delay);

    logger.info(`[WEBHOOK EMAIL] Processamento concluído em ${Date.now() - startTime}ms`);

    return {
      scheduled: true,
      scheduledFor,
      emailTemplateId: emailTemplate.id,
      recipientEmail: variables.customer_email,
      subject,
      delay
    };

  } catch (error) {
    logger.error(`[WEBHOOK EMAIL] Erro no processamento: ${error.message}`);

    // Atualizar estatísticas do webhook mesmo em caso de erro
    if (webhookLink) {
      await webhookLink.update({
        totalRequests: webhookLink.totalRequests + 1,
        lastRequestAt: new Date()
      });
    }

    throw error;
  }
};

/**
 * Substitui variáveis no texto
 * Suporta ${variable} e {{variable}}
 */
const replaceVariables = (text: string, variables: any): string => {
  if (!text) return "";

  // Substituir formato ${variable}
  text = text.replace(/\$\{([^}]+)\}/g, (match, key) => {
    return variables[key.trim()] || match;
  });

  // Substituir formato {{variable}}
  text = text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    return variables[key.trim()] || match;
  });

  return text;
};

export default ProcessWebhookEmailService;