import { Request, Response } from "express";
import CreateWebhookLinkService from "../services/WebhookLinkService/CreateWebhookLinkService";
import ListWebhookLinksService from "../services/WebhookLinkService/ListWebhookLinksService";
import UpdateWebhookLinkService from "../services/WebhookLinkService/UpdateWebhookLinkService";
import DeleteWebhookLinkService from "../services/WebhookLinkService/DeleteWebhookLinkService";
import ShowWebhookLinkService from "../services/WebhookLinkService/ShowWebhookLinkService";

export const createWebhookLink = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log("🚀 CREATE WEBHOOK - Start");
    console.log("📥 Request body:", JSON.stringify(req.body, null, 2));

    const { name, description, platform, actionType, flowId, emailTemplateId, emailSettings } = req.body;
    const { companyId } = req.user;
    const userId = parseInt(req.user.id);

    console.log("👤 User info:", { companyId, userId });

    // Converter strings vazias para null/undefined
    const parsedFlowId = flowId && flowId !== "" ? parseInt(flowId) : undefined;
    const parsedEmailTemplateId = emailTemplateId && emailTemplateId !== "" ? parseInt(emailTemplateId) : undefined;

    console.log("🔢 Parsed IDs:", {
      originalFlowId: flowId,
      parsedFlowId,
      originalEmailTemplateId: emailTemplateId,
      parsedEmailTemplateId
    });

    const serviceParams = {
      name,
      description,
      platform,
      actionType,
      flowId: parsedFlowId,
      emailTemplateId: parsedEmailTemplateId,
      emailSettings,
      companyId,
      userId
    };

    console.log("⚙️ Service params:", JSON.stringify(serviceParams, null, 2));

    const webhookLink = await CreateWebhookLinkService(serviceParams);

    console.log("✅ CREATE WEBHOOK - Success");
    return res.status(200).json(webhookLink);
  } catch (error) {
    console.error("❌ CREATE WEBHOOK - Error:", error);
    console.error("📄 Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};

export const listWebhookLinks = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam, pageNumber } = req.query;
  
  const { webhookLinks, count, hasMore } = await ListWebhookLinksService({ 
    companyId,
    searchParam: searchParam as string,
    pageNumber: pageNumber as string
  });
  
  return res.status(200).json({ webhookLinks, count, hasMore });
};

export const showWebhookLink = async (req: Request, res: Response): Promise<Response> => {
  const { webhookLinkId } = req.params;
  const { companyId } = req.user;

  const result = await ShowWebhookLinkService({
    webhookLinkId: parseInt(webhookLinkId),
    companyId
  });

  return res.status(200).json(result);
};

export const updateWebhookLink = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log("🚀 UPDATE WEBHOOK - Start");
    console.log("📥 Request body:", JSON.stringify(req.body, null, 2));

    const { webhookLinkId } = req.params;
    const { companyId } = req.user;
    const updateData = req.body;

    console.log("👤 User info:", { companyId, webhookLinkId });

    // Converter strings vazias para null/undefined em flowId e emailTemplateId
    if (updateData.flowId === "") {
      updateData.flowId = undefined;
    } else if (updateData.flowId) {
      updateData.flowId = parseInt(updateData.flowId);
    }

    if (updateData.emailTemplateId === "") {
      updateData.emailTemplateId = undefined;
    } else if (updateData.emailTemplateId) {
      updateData.emailTemplateId = parseInt(updateData.emailTemplateId);
    }

    console.log("🔢 Processed updateData:", JSON.stringify(updateData, null, 2));

    const webhookLink = await UpdateWebhookLinkService({
      webhookLinkId: parseInt(webhookLinkId),
      companyId,
      updateData
    });

    console.log("✅ UPDATE WEBHOOK - Success");
    return res.status(200).json(webhookLink);
  } catch (error) {
    console.error("❌ UPDATE WEBHOOK - Error:", error);
    console.error("📄 Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};

export const deleteWebhookLink = async (req: Request, res: Response): Promise<Response> => {
  const { webhookLinkId } = req.params;
  const { companyId } = req.user;

  await DeleteWebhookLinkService({
    webhookLinkId: parseInt(webhookLinkId),
    companyId
  });

  return res.status(200).json({ message: "Webhook link deleted successfully" });
};