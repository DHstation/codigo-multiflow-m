import { Op } from "sequelize";
import WebhookLink from "../../models/WebhookLink";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import EmailTemplate from "../../models/EmailTemplate";
import AppError from "../../errors/AppError";

interface UpdateData {
  name?: string;
  description?: string;
  platform?: string;
  actionType?: string;
  flowId?: number;
  emailTemplateId?: number;
  emailSettings?: object;
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

  // Validações condicionais baseadas no actionType
  const actionType = updateData.actionType || webhookLink.actionType;

  // Se for tipo "flow", validar flowId
  if (actionType === "flow" && updateData.flowId) {
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

  // Se for tipo "email", validar emailTemplateId
  if (actionType === "email" && updateData.emailTemplateId) {
    const emailTemplate = await EmailTemplate.findOne({
      where: {
        id: updateData.emailTemplateId,
        companyId: companyId,
        active: true
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

export default UpdateWebhookLinkService;