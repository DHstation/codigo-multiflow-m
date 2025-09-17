import Mustache from "mustache";
import { EmailTemplate, EmailBlock, EmailTemplateSettings } from "../../models/EmailTemplate";
import logger from "../../utils/logger";

class EmailRenderer {
  /**
   * Renderiza um template de email com as variáveis fornecidas
   */
  async render(template: EmailTemplate, variables: any): Promise<string> {
    try {
      const { blocks, settings, subject } = template;

      // Construir HTML base
      let html = this.buildHtmlBase(settings);

      // Renderizar cada bloco
      const sortedBlocks = blocks ? blocks.sort((a, b) => a.order - b.order) : [];
      for (const block of sortedBlocks) {
        html += await this.renderBlock(block, variables);
      }

      // Fechar HTML
      html += this.buildHtmlFooter();

      // Processar variáveis com Mustache
      // Suporta tanto ${variable} quanto {{variable}}
      const processedVariables = this.prepareVariables(variables);
      html = this.replaceVariables(html, processedVariables);

      return html;
    } catch (error) {
      logger.error("Error rendering email template:", error);
      throw error;
    }
  }

  /**
   * Prepara as variáveis para substituição
   */
  private prepareVariables(variables: any): any {
    const processed = { ...variables };

    // Adicionar variáveis de sistema comuns
    const now = new Date();
    processed.date = now.toLocaleDateString("pt-BR");
    processed.time = now.toLocaleTimeString("pt-BR");
    processed.year = now.getFullYear();

    // Saudação baseada no horário
    const hour = now.getHours();
    if (hour >= 6 && hour < 12) {
      processed.greeting = "Bom dia";
    } else if (hour >= 12 && hour < 18) {
      processed.greeting = "Boa tarde";
    } else {
      processed.greeting = "Boa noite";
    }

    return processed;
  }

  /**
   * Substitui variáveis no template
   * Suporta ${variable} e {{variable}}
   */
  private replaceVariables(html: string, variables: any): string {
    // Primeiro, substituir formato ${variable}
    html = html.replace(/\$\{([^}]+)\}/g, (match, key) => {
      return variables[key.trim()] || match;
    });

    // Depois, usar Mustache para {{variable}}
    html = Mustache.render(html, variables);

    return html;
  }

  /**
   * Constrói o HTML base do email
   */
  private buildHtmlBase(settings: EmailTemplateSettings): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body {
      margin: 0 !important;
      padding: 0 !important;
      -webkit-text-size-adjust: 100% !important;
      -ms-text-size-adjust: 100% !important;
      -webkit-font-smoothing: antialiased !important;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0px;
      mso-table-rspace: 0px;
    }
    img {
      border: 0;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    p {
      margin: 0;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${settings.backgroundColor}; font-family: ${settings.fontFamily};">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${settings.backgroundColor};">
    <tr>
      <td align="center" style="padding: ${settings.padding.top}px ${settings.padding.right}px ${settings.padding.bottom}px ${settings.padding.left}px;">
        <table border="0" cellpadding="0" cellspacing="0" width="${settings.containerWidth}" style="max-width: ${settings.containerWidth}px;">
`;
  }

  /**
   * Fecha o HTML do email
   */
  private buildHtmlFooter(): string {
    return `
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Renderiza um bloco individual
   */
  private async renderBlock(block: EmailBlock, variables: any): Promise<string> {
    const { type, content, styles } = block;

    switch (type) {
      case "heading":
        return this.renderHeading(content, styles);
      case "text":
        return this.renderText(content, styles);
      case "image":
        return this.renderImage(content, styles);
      case "button":
        return this.renderButton(content, styles);
      case "divider":
        return this.renderDivider(styles);
      case "spacer":
        return this.renderSpacer(styles);
      case "html":
        return this.renderHtml(content);
      case "columns":
        return this.renderColumns(block.columns || [], variables);
      default:
        return "";
    }
  }

  /**
   * Renderiza um título
   */
  private renderHeading(content: any, styles: any): string {
    const fontSize = styles.fontSize || "24px";
    const color = styles.color || "#333333";
    const textAlign = styles.textAlign || "left";
    const fontWeight = styles.fontWeight || "bold";
    const padding = this.getPaddingStyle(styles.padding);
    const margin = this.getMarginStyle(styles.margin);

    return `
      <tr>
        <td style="padding: ${padding}; margin: ${margin};">
          <h2 style="
            margin: 0;
            font-size: ${fontSize};
            color: ${color};
            text-align: ${textAlign};
            font-weight: ${fontWeight};
            font-family: inherit;
            line-height: 1.4;
          ">${content.text || ""}</h2>
        </td>
      </tr>
    `;
  }

  /**
   * Renderiza um texto
   */
  private renderText(content: any, styles: any): string {
    const fontSize = styles.fontSize || "16px";
    const color = styles.color || "#555555";
    const textAlign = styles.textAlign || "left";
    const lineHeight = styles.lineHeight || "1.6";
    const padding = this.getPaddingStyle(styles.padding);
    const margin = this.getMarginStyle(styles.margin);

    const text = content.html || content.text || "";

    return `
      <tr>
        <td style="padding: ${padding}; margin: ${margin};">
          <div style="
            font-size: ${fontSize};
            color: ${color};
            text-align: ${textAlign};
            line-height: ${lineHeight};
            font-family: inherit;
          ">${text}</div>
        </td>
      </tr>
    `;
  }

  /**
   * Renderiza uma imagem
   */
  private renderImage(content: any, styles: any): string {
    const width = styles.width || "100%";
    const height = styles.height || "auto";
    const textAlign = styles.textAlign || "center";
    const padding = this.getPaddingStyle(styles.padding);
    const borderRadius = styles.borderRadius || "0";

    if (!content.src) {
      return "";
    }

    return `
      <tr>
        <td align="${textAlign}" style="padding: ${padding};">
          <img
            src="${content.src}"
            alt="${content.alt || ""}"
            width="${width}"
            height="${height}"
            style="
              display: block;
              border: 0;
              max-width: 100%;
              border-radius: ${borderRadius};
            "
          />
        </td>
      </tr>
    `;
  }

  /**
   * Renderiza um botão
   */
  private renderButton(content: any, styles: any): string {
    const backgroundColor = styles.backgroundColor || "#007bff";
    const color = styles.color || "#ffffff";
    const fontSize = styles.fontSize || "16px";
    const padding = styles.padding || { top: 12, right: 24, bottom: 12, left: 24 };
    const borderRadius = styles.borderRadius || "4px";
    const textAlign = styles.textAlign || "center";
    const margin = this.getMarginStyle(styles.margin);

    const paddingStr = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;

    return `
      <tr>
        <td align="${textAlign}" style="padding: ${margin};">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: ${borderRadius};" bgcolor="${backgroundColor}">
                <a
                  href="${content.href || "#"}"
                  target="${content.target || "_blank"}"
                  style="
                    display: inline-block;
                    padding: ${paddingStr};
                    font-family: inherit;
                    font-size: ${fontSize};
                    color: ${color};
                    text-decoration: none;
                    border-radius: ${borderRadius};
                    background-color: ${backgroundColor};
                  "
                >${content.buttonText || "Clique aqui"}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }

  /**
   * Renderiza um divisor
   */
  private renderDivider(styles: any): string {
    const color = styles.color || "#dddddd";
    const height = styles.height || "1px";
    const margin = this.getMarginStyle(styles.margin || { top: 20, bottom: 20 });

    return `
      <tr>
        <td style="padding: ${margin};">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="border-top: ${height} solid ${color};"></td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }

  /**
   * Renderiza um espaçador
   */
  private renderSpacer(styles: any): string {
    const height = styles.height || "20px";

    return `
      <tr>
        <td style="height: ${height}; line-height: ${height}; font-size: 0;">
          &nbsp;
        </td>
      </tr>
    `;
  }

  /**
   * Renderiza HTML customizado
   */
  private renderHtml(content: any): string {
    return `
      <tr>
        <td>
          ${content.html || ""}
        </td>
      </tr>
    `;
  }

  /**
   * Renderiza colunas
   */
  private async renderColumns(columns: EmailBlock[], variables: any): Promise<string> {
    if (!columns || columns.length === 0) {
      return "";
    }

    const columnWidth = Math.floor(100 / columns.length);
    let columnsHtml = '<tr><td><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>';

    for (const column of columns) {
      columnsHtml += `<td width="${columnWidth}%" valign="top">`;
      columnsHtml += '<table border="0" cellpadding="0" cellspacing="0" width="100%">';

      for (const block of column.columns || []) {
        columnsHtml += await this.renderBlock(block, variables);
      }

      columnsHtml += '</table></td>';
    }

    columnsHtml += '</tr></table></td></tr>';

    return columnsHtml;
  }

  /**
   * Converte padding object para string CSS
   */
  private getPaddingStyle(padding: any): string {
    if (!padding) {
      return "10px";
    }

    const top = padding.top || 0;
    const right = padding.right || 0;
    const bottom = padding.bottom || 0;
    const left = padding.left || 0;

    return `${top}px ${right}px ${bottom}px ${left}px`;
  }

  /**
   * Converte margin object para string CSS
   */
  private getMarginStyle(margin: any): string {
    if (!margin) {
      return "0";
    }

    const top = margin.top || 0;
    const right = margin.right || 0;
    const bottom = margin.bottom || 0;
    const left = margin.left || 0;

    return `${top}px ${right}px ${bottom}px ${left}px`;
  }
}

export default EmailRenderer;