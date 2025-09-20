import WebhookLink from "../../models/WebhookLink";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import EmailTemplate from "../../models/EmailTemplate";
import AppError from "../../errors/AppError";

interface Request {
  name: string;
  description?: string;
  platform: string;
  actionType?: string;
  flowId?: number;
  emailTemplateId?: number;
  emailSettings?: object;
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

  // Validação condicional baseada no actionType
  if (actionType === "flow") {
    if (!flowId) {
      throw new AppError("ERR_FLOW_ID_REQUIRED", 400);
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
  }

  if (actionType === "email") {
    if (!emailTemplateId) {
      throw new AppError("ERR_EMAIL_TEMPLATE_ID_REQUIRED", 400);
    }

    // Verificar se o template existe e pertence à empresa
    const emailTemplate = await EmailTemplate.findOne({
      where: {
        id: emailTemplateId,
        companyId: companyId,
        active: true
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

  // Criar o webhook link
  const webhookLink = await WebhookLink.create({
    name,
    description,
    platform,
    actionType,
    flowId: actionType === "flow" ? flowId : null,
    emailTemplateId: actionType === "email" ? emailTemplateId : null,
    emailSettings: emailSettings || {},
    companyId,
    userId,
    active: true,
    metadata: {}
  });

  // Retornar com dados do flow e template
  return await WebhookLink.findByPk(webhookLink.id, {
    include: [
      {
        model: FlowBuilderModel,
        as: 'flow',
        attributes: ['id', 'name', 'active'],
        required: false
      },
      {
        model: EmailTemplate,
        as: 'emailTemplate',
        attributes: ['id', 'name', 'active'],
        required: false
      }
    ]
  });
};

export default CreateWebhookLinkService;