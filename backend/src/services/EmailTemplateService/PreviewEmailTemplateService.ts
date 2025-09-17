import EmailTemplate from "../../models/EmailTemplate";
import EmailRenderer from "../EmailService/EmailRenderer";
import AppError from "../../errors/AppError";

interface Request {
  templateId: number;
  companyId: number;
  variables?: any;
}

const PreviewEmailTemplateService = async ({
  templateId,
  companyId,
  variables = {}
}: Request): Promise<string> => {
  const template = await EmailTemplate.findOne({
    where: {
      id: templateId,
      companyId
    }
  });

  if (!template) {
    throw new AppError("Template não encontrado", 404);
  }

  // Adicionar variáveis de exemplo se não fornecidas
  const previewVariables = {
    customer_name: variables.customer_name || "João Silva",
    customer_email: variables.customer_email || "joao.silva@example.com",
    customer_phone: variables.customer_phone || "11999999999",
    customer_cpf: variables.customer_cpf || "123.456.789-00",
    product_name: variables.product_name || "Produto Exemplo",
    product_id: variables.product_id || "PROD123",
    transaction_id: variables.transaction_id || "TRX987654321",
    transaction_amount: variables.transaction_amount || "197,00",
    transaction_status: variables.transaction_status || "approved",
    transaction_date: variables.transaction_date || new Date().toLocaleDateString("pt-BR"),
    payment_method: variables.payment_method || "credit_card",
    event_type: variables.event_type || "order_approved",
    webhook_platform: variables.webhook_platform || "kiwify",
    webhook_link_name: variables.webhook_link_name || "Vendas Kiwify",
    pix_code: variables.pix_code || "00020126330014BR.GOV.BCB.PIX",
    access_url: variables.access_url || "https://example.com/access",
    ...variables
  };

  const renderer = new EmailRenderer();
  const html = await renderer.render(template, previewVariables);

  return html;
};

export default PreviewEmailTemplateService;