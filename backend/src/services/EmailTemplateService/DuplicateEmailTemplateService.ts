import EmailTemplate from "../../models/EmailTemplate";
import CreateEmailTemplateService from "./CreateEmailTemplateService";
import AppError from "../../errors/AppError";

interface Request {
  templateId: number;
  newName: string;
  companyId: number;
  userId: number;
}

const DuplicateEmailTemplateService = async ({
  templateId,
  newName,
  companyId,
  userId
}: Request): Promise<EmailTemplate> => {
  // Buscar template original
  const originalTemplate = await EmailTemplate.findOne({
    where: {
      id: templateId,
      companyId
    }
  });

  if (!originalTemplate) {
    throw new AppError("Template não encontrado", 404);
  }

  // Criar cópia do template
  const duplicatedTemplate = await CreateEmailTemplateService({
    name: newName || `${originalTemplate.name} (Cópia)`,
    description: originalTemplate.description ? `${originalTemplate.description} (Cópia)` : "Cópia de template",
    subject: originalTemplate.subject,
    previewText: originalTemplate.previewText,
    blocks: originalTemplate.blocks,
    settings: originalTemplate.settings,
    companyId,
    userId
  });

  return duplicatedTemplate;
};

export default DuplicateEmailTemplateService;