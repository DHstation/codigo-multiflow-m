import EmailTemplate from "../../models/EmailTemplate";
import AppError from "../../errors/AppError";
import * as Yup from "yup";

interface Request {
  name: string;
  description?: string;
  subject: string;
  previewText?: string;
  blocks?: any[];
  settings?: any;
  companyId: number;
  userId: number;
}

const CreateEmailTemplateService = async ({
  name,
  description,
  subject,
  previewText,
  blocks = [],
  settings,
  companyId,
  userId
}: Request): Promise<EmailTemplate> => {
  // Validação
  const schema = Yup.object().shape({
    name: Yup.string().required("Nome é obrigatório").min(3),
    subject: Yup.string().required("Assunto é obrigatório").min(3),
    companyId: Yup.number().required(),
    userId: Yup.number().required()
  });

  try {
    await schema.validate({ name, subject, companyId, userId });
  } catch (error) {
    throw new AppError(error.message);
  }

  // Verificar se já existe template com mesmo nome
  const existingTemplate = await EmailTemplate.findOne({
    where: {
      name,
      companyId
    }
  });

  if (existingTemplate) {
    throw new AppError("Já existe um template com este nome", 409);
  }

  // Settings padrão
  const defaultSettings = {
    backgroundColor: "#f4f4f4",
    fontFamily: "Arial, sans-serif",
    containerWidth: 600,
    padding: { top: 20, right: 20, bottom: 20, left: 20 },
    textColor: "#333333",
    linkColor: "#007bff",
    buttonColor: "#007bff",
    buttonTextColor: "#ffffff"
  };

  // Criar template
  const template = await EmailTemplate.create({
    name,
    description,
    subject,
    previewText,
    blocks,
    settings: settings || defaultSettings,
    companyId,
    userId,
    active: true
  });

  return template;
};

export default CreateEmailTemplateService;