import { Op } from "sequelize";
import EmailTemplate from "../../models/EmailTemplate";
import AppError from "../../errors/AppError";
import * as Yup from "yup";

interface Request {
  templateId: number;
  name?: string;
  description?: string;
  subject?: string;
  previewText?: string;
  blocks?: any[];
  settings?: any;
  active?: boolean;
  companyId: number;
}

const UpdateEmailTemplateService = async ({
  templateId,
  name,
  description,
  subject,
  previewText,
  blocks,
  settings,
  active,
  companyId
}: Request): Promise<EmailTemplate> => {
  // Buscar template
  const template = await EmailTemplate.findOne({
    where: {
      id: templateId,
      companyId
    }
  });

  if (!template) {
    throw new AppError("Template não encontrado", 404);
  }

  // Validação
  if (name || subject) {
    const schema = Yup.object().shape({
      name: Yup.string().min(3),
      subject: Yup.string().min(3)
    });

    try {
      await schema.validate({ name, subject });
    } catch (error) {
      throw new AppError(error.message);
    }
  }

  // Verificar nome duplicado
  if (name && name !== template.name) {
    const existingTemplate = await EmailTemplate.findOne({
      where: {
        name,
        companyId,
        id: { [Op.ne]: templateId }
      }
    });

    if (existingTemplate) {
      throw new AppError("Já existe um template com este nome", 409);
    }
  }

  // Atualizar template
  await template.update({
    name: name || template.name,
    description: description !== undefined ? description : template.description,
    subject: subject || template.subject,
    previewText: previewText !== undefined ? previewText : template.previewText,
    blocks: blocks !== undefined ? blocks : template.blocks,
    settings: settings !== undefined ? settings : template.settings,
    active: active !== undefined ? active : template.active
  });

  await template.reload();

  return template;
};

export default UpdateEmailTemplateService;