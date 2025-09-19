import { Router } from "express";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import multer from "multer";
import * as EmailTemplateController from "../controllers/EmailTemplateController";

const upload = multer(uploadConfig);
const emailTemplateRoutes = Router();

// Todas as rotas requerem autenticação
emailTemplateRoutes.use(isAuth);

// Rotas CRUD
emailTemplateRoutes.get("/email-templates", EmailTemplateController.index);
emailTemplateRoutes.post("/email-templates", EmailTemplateController.store);

// Rotas especiais (devem vir antes das rotas com parâmetros)
emailTemplateRoutes.get("/email-templates/all/stats", EmailTemplateController.stats);
emailTemplateRoutes.get("/email-templates/:templateId/stats", EmailTemplateController.stats);
emailTemplateRoutes.post("/email-templates/:templateId/preview", EmailTemplateController.preview);
emailTemplateRoutes.post("/email-templates/:templateId/duplicate", EmailTemplateController.duplicate);

// Upload de imagens para templates
//@ts-ignore
emailTemplateRoutes.post("/email-templates/upload-image", upload.array("medias"), EmailTemplateController.uploadImage);

// Rotas com parâmetros devem vir por último
emailTemplateRoutes.get("/email-templates/:templateId", EmailTemplateController.show);
emailTemplateRoutes.put("/email-templates/:templateId", EmailTemplateController.update);
emailTemplateRoutes.delete("/email-templates/:templateId", EmailTemplateController.remove);

export default emailTemplateRoutes;