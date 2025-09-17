import { Request, Response } from "express";
import AppError from "../errors/AppError";

import CreateEmailTemplateService from "../services/EmailTemplateService/CreateEmailTemplateService";
import ListEmailTemplatesService from "../services/EmailTemplateService/ListEmailTemplatesService";
import ShowEmailTemplateService from "../services/EmailTemplateService/ShowEmailTemplateService";
import UpdateEmailTemplateService from "../services/EmailTemplateService/UpdateEmailTemplateService";
import DeleteEmailTemplateService from "../services/EmailTemplateService/DeleteEmailTemplateService";
import PreviewEmailTemplateService from "../services/EmailTemplateService/PreviewEmailTemplateService";
import DuplicateEmailTemplateService from "../services/EmailTemplateService/DuplicateEmailTemplateService";
import { getQueueStats } from "../queues/EmailQueue";
import EmailLog from "../models/EmailLog";
import { Op } from "sequelize";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber, active } = req.query;
  const { companyId } = req.user;

  const { templates, count, hasMore } = await ListEmailTemplatesService({
    companyId,
    searchParam: searchParam as string,
    pageNumber: pageNumber as string,
    active: active === "true"
  });

  return res.json({ templates, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    description,
    subject,
    previewText,
    blocks,
    settings
  } = req.body;

  const { companyId, id: userId } = req.user;

  const template = await CreateEmailTemplateService({
    name,
    description,
    subject,
    previewText,
    blocks,
    settings,
    companyId,
    userId: Number(userId)
  });

  return res.status(201).json(template);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { templateId } = req.params;
  const { companyId } = req.user;

  const template = await ShowEmailTemplateService({
    templateId: Number(templateId),
    companyId
  });

  return res.json(template);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { templateId } = req.params;
  const {
    name,
    description,
    subject,
    previewText,
    blocks,
    settings,
    active
  } = req.body;

  const { companyId } = req.user;

  const template = await UpdateEmailTemplateService({
    templateId: Number(templateId),
    name,
    description,
    subject,
    previewText,
    blocks,
    settings,
    active,
    companyId
  });

  return res.json(template);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { templateId } = req.params;
  const { companyId } = req.user;

  await DeleteEmailTemplateService({
    templateId: Number(templateId),
    companyId
  });

  return res.status(200).json({ message: "Template removido com sucesso" });
};

export const preview = async (req: Request, res: Response): Promise<Response> => {
  const { templateId } = req.params;
  const { variables } = req.body;
  const { companyId } = req.user;

  const html = await PreviewEmailTemplateService({
    templateId: Number(templateId),
    companyId,
    variables
  });

  return res.json({ html });
};

export const duplicate = async (req: Request, res: Response): Promise<Response> => {
  const { templateId } = req.params;
  const { name } = req.body;
  const { companyId, id: userId } = req.user;

  const template = await DuplicateEmailTemplateService({
    templateId: Number(templateId),
    newName: name,
    companyId,
    userId: Number(userId)
  });

  return res.status(201).json(template);
};

export const stats = async (req: Request, res: Response): Promise<Response> => {
  const { templateId } = req.params;
  const { companyId } = req.user;
  const { startDate, endDate } = req.query;

  const whereCondition: any = {
    companyId
  };

  if (templateId && templateId !== "all") {
    whereCondition.templateId = Number(templateId);
  }

  if (startDate) {
    whereCondition.createdAt = {
      [Op.gte]: new Date(startDate as string)
    };
  }

  if (endDate) {
    whereCondition.createdAt = {
      ...whereCondition.createdAt,
      [Op.lte]: new Date(endDate as string)
    };
  }

  // Buscar logs de email
  const [
    totalSent,
    totalFailed,
    totalOpened,
    totalClicked
  ] = await Promise.all([
    EmailLog.count({
      where: {
        ...whereCondition,
        status: "sent"
      }
    }),
    EmailLog.count({
      where: {
        ...whereCondition,
        status: "failed"
      }
    }),
    EmailLog.count({
      where: {
        ...whereCondition,
        status: "opened"
      }
    }),
    EmailLog.count({
      where: {
        ...whereCondition,
        status: "clicked"
      }
    })
  ]);

  // Buscar estatísticas da fila
  const queueStats = await getQueueStats();

  return res.json({
    emails: {
      sent: totalSent,
      failed: totalFailed,
      opened: totalOpened,
      clicked: totalClicked,
      openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0
    },
    queue: queueStats
  });
};