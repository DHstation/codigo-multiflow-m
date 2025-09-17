import EmailTemplate from "../../models/EmailTemplate";
import AppError from "../../errors/AppError";
import User from "../../models/User";

interface Request {
  templateId: number;
  companyId: number;
}

const ShowEmailTemplateService = async ({
  templateId,
  companyId
}: Request): Promise<EmailTemplate> => {
  const template = await EmailTemplate.findOne({
    where: {
      id: templateId,
      companyId
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"]
      }
    ]
  });

  if (!template) {
    throw new AppError("Template não encontrado", 404);
  }

  return template;
};

export default ShowEmailTemplateService;