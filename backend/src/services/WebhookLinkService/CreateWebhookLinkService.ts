import WebhookLink from "../../models/WebhookLink";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import EmailTemplate from "../../models/EmailTemplate";
import AppError from "../../errors/AppError";

interface EmailSettings {
  sendDelay: number;
  delayType: "immediate" | "seconds" | "minutes" | "hours" | "days";
  fromName: string;
  fromEmail: string;
  replyTo: string;
}

interface Request {
  name: string;
  description?: string;
  platform: string;
  actionType?: "flow" | "email";
  flowId?: number;
  emailTemplateId?: number;
  emailSettings?: EmailSettings;
  companyId: number;
  userId: number;
}

const CreateWebhookLinkService = async ({
  name,
  description,
  platform,
  actionType = "flow",
  flowId,
  emailTemplateId,
  emailSettings,
  companyId,
  userId
}: Request): Promise<WebhookLink> => {
  try {
    console.log("🏭 CREATE SERVICE - Start");
    console.log("📦 Received params:", {
      name, description, platform, actionType, flowId, emailTemplateId, emailSettings, companyId, userId
    });

    // Validar baseado no tipo de ação
    if (actionType === "flow") {
    if (!flowId) {
      throw new AppError("ERR_FLOW_REQUIRED", 400);
    }

    // Verificar se o flow existe e pertence à empresa
    const flow = await FlowBuilderModel.findOne({
      where: {
        id: flowId,
        company_id: companyId
      }
    });

    if (!flow) {
      throw new AppError("ERR_FLOW_NOT_FOUND", 404);
    }
  } else if (actionType === "email") {
    if (!emailTemplateId) {
      throw new AppError("ERR_EMAIL_TEMPLATE_REQUIRED", 400);
    }

    // Verificar se o template existe e pertence à empresa
    const emailTemplate = await EmailTemplate.findOne({
      where: {
        id: emailTemplateId,
        companyId
      }
    });

    if (!emailTemplate) {
      throw new AppError("ERR_EMAIL_TEMPLATE_NOT_FOUND", 404);
    }
  }

  // Verificar se já existe um webhook com o mesmo nome para a empresa
  const existingWebhook = await WebhookLink.findOne({
    where: {
      name,
      companyId
    }
  });

  if (existingWebhook) {
    throw new AppError("ERR_WEBHOOK_NAME_EXISTS", 409);
  }

  // Preparar emailSettings com valores padrão se necessário
  const defaultEmailSettings = {
    sendDelay: 0,
    delayType: "immediate",
    fromName: "",
    fromEmail: "",
    replyTo: ""
  };

  // Criar o webhook link
  const webhookLink = await WebhookLink.create({
    name,
    description,
    platform,
    actionType,
    flowId: actionType === "flow" ? flowId : null,
    emailTemplateId: actionType === "email" ? emailTemplateId : null,
    emailSettings: actionType === "email" ? (emailSettings || defaultEmailSettings) : null,
    companyId,
    userId,
    active: true,
    metadata: {}
  });

    console.log("💾 Webhook created successfully:", webhookLink.id);

    // Retornar com dados do flow ou template
    const result = await WebhookLink.findByPk(webhookLink.id, {
      include: [
        {
          model: FlowBuilderModel,
          as: 'flow',
          attributes: ['id', 'name', 'active']
        },
        {
          model: EmailTemplate,
          as: 'emailTemplate',
          attributes: ['id', 'name', 'subject', 'active']
        }
      ]
    });

    console.log("✅ CREATE SERVICE - Success");
    return result;
  } catch (error) {
    console.error("❌ CREATE SERVICE - Error:", error);
    console.error("📄 Service Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};

export default CreateWebhookLinkService;