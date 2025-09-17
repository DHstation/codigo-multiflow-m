import EmailTemplate from "../../models/EmailTemplate";
import AppError from "../../errors/AppError";
import WebhookLink from "../../models/WebhookLink";

interface Request {
  templateId: number;
  companyId: number;
}

const DeleteEmailTemplateService = async ({
  templateId,
  companyId
}: Request): Promise<void> => {
  const template = await EmailTemplate.findOne({
    where: {
      id: templateId,
      companyId
    }
  });

  if (!template) {
    throw new AppError("Template não encontrado", 404);
  }

  // Verificar se o template está sendo usado em algum webhook
  const webhooksUsingTemplate = await WebhookLink.count({
    where: {
      emailTemplateId: templateId,
      companyId
    }
  });

  if (webhooksUsingTemplate > 0) {
    throw new AppError(
      `Este template está sendo usado em ${webhooksUsingTemplate} webhook(s). Remova ou altere os webhooks antes de excluir o template.`,
      409
    );
  }

  await template.destroy();
};

export default DeleteEmailTemplateService;