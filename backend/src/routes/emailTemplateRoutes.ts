import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as EmailTemplateController from "../controllers/EmailTemplateController";

const emailTemplateRoutes = Router();

// Todas as rotas requerem autenticação
emailTemplateRoutes.use(isAuth);

// Rotas CRUD
emailTemplateRoutes.get("/email-templates", EmailTemplateController.index);
emailTemplateRoutes.post("/email-templates", EmailTemplateController.store);
emailTemplateRoutes.get("/email-templates/:templateId", EmailTemplateController.show);
emailTemplateRoutes.put("/email-templates/:templateId", EmailTemplateController.update);
emailTemplateRoutes.delete("/email-templates/:templateId", EmailTemplateController.remove);

// Rotas especiais
emailTemplateRoutes.post("/email-templates/:templateId/preview", EmailTemplateController.preview);
emailTemplateRoutes.post("/email-templates/:templateId/duplicate", EmailTemplateController.duplicate);
emailTemplateRoutes.get("/email-templates/:templateId/stats", EmailTemplateController.stats);

export default emailTemplateRoutes;