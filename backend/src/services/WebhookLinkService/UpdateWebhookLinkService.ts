import { Op } from "sequelize";
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

interface UpdateData {
  name?: string;
  description?: string;
  platform?: string;
  actionType?: "flow" | "email";
  flowId?: number;
  emailTemplateId?: number;
  emailSettings?: EmailSettings;
  active?: boolean;
  metadata?: object;
}

interface Request {
  webhookLinkId: number;
  companyId: number;
  updateData: UpdateData;
}

const UpdateWebhookLinkService = async ({
  webhookLinkId,
  companyId,
  updateData
}: Request): Promise<WebhookLink> => {
  
  // Buscar o webhook link
  const webhookLink = await WebhookLink.findOne({
    where: {
      id: webhookLinkId,
      companyId
    }
  });

  if (!webhookLink) {
    throw new AppError("ERR_WEBHOOK_NOT_FOUND", 404);
  }

  // Validar baseado no tipo de ação
  if (updateData.actionType) {
    if (updateData.actionType === "flow") {
      // Se mudando para flow, limpar campos de email
      updateData.emailTemplateId = null;
      updateData.emailSettings = null;

      if (!updateData.flowId) {
        throw new AppError("ERR_FLOW_REQUIRED", 400);
      }
    } else if (updateData.actionType === "email") {
      // Se mudando para email, limpar campo de flow
      updateData.flowId = null;

      if (!updateData.emailTemplateId) {
        throw new AppError("ERR_EMAIL_TEMPLATE_REQUIRED", 400);
      }
    }
  }

  // Se estiver atualizando o flowId, verificar se existe
  if (updateData.flowId) {
    const flow = await FlowBuilderModel.findOne({
      where: {
        id: updateData.flowId,
        company_id: companyId
      }
    });

    if (!flow) {
      throw new AppError("ERR_FLOW_NOT_FOUND", 404);
    }
  }

  // Se estiver atualizando o emailTemplateId, verificar se existe
  if (updateData.emailTemplateId) {
    const emailTemplate = await EmailTemplate.findOne({
      where: {
        id: updateData.emailTemplateId,
        companyId
      }
    });

    if (!emailTemplate) {
      throw new AppError("ERR_EMAIL_TEMPLATE_NOT_FOUND", 404);
    }
  }

  // Se estiver atualizando o nome, verificar duplicação
  if (updateData.name && updateData.name !== webhookLink.name) {
    const existingWebhook = await WebhookLink.findOne({
      where: {
        name: updateData.name,
        companyId,
        id: { [Op.ne]: webhookLinkId }
      }
    });

    if (existingWebhook) {
      throw new AppError("ERR_WEBHOOK_NAME_EXISTS", 409);
    }
  }

  // Atualizar o webhook
  await webhookLink.update(updateData);

  // Retornar com dados atualizados
  return await WebhookLink.findByPk(webhookLinkId, {
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
};

export default UpdateWebhookLinkService;