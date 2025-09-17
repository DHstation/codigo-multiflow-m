import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress
} from "@material-ui/core";
import {
  ToggleButtonGroup,
  ToggleButton
} from "@material-ui/lab";
import {
  Computer as DesktopIcon,
  PhoneIphone as MobileIcon,
  Refresh as RefreshIcon
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../../services/api";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2)
  },
  previewContainer: {
    flex: 1,
    overflow: "auto",
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2)
  },
  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
    backgroundColor: "white",
    borderRadius: theme.spacing(0.5),
    boxShadow: theme.shadows[2]
  },
  mobileFrame: {
    maxWidth: 375,
    margin: "0 auto"
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%"
  },
  metaInfo: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.spacing(0.5)
  },
  subjectLine: {
    fontWeight: 600,
    marginBottom: theme.spacing(0.5)
  },
  previewText: {
    color: theme.palette.text.secondary,
    fontSize: "0.9em"
  }
}));

const EmailPreview = ({ blocks, settings, subject, previewText, templateId }) => {
  const classes = useStyles();
  const [device, setDevice] = useState("desktop");
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(false);

  const generateHtmlPreview = () => {
    const containerStyle = `
      max-width: ${settings?.containerWidth || 600}px;
      margin: 0 auto;
      font-family: ${settings?.fontFamily || "Arial, sans-serif"};
      background-color: ${settings?.backgroundColor || "#f4f4f4"};
      padding: ${settings?.padding?.top || 20}px ${settings?.padding?.right || 20}px ${settings?.padding?.bottom || 20}px ${settings?.padding?.left || 20}px;
    `;

    const renderBlock = (block) => {
      switch (block.type) {
        case "heading":
          const HeadingTag = `h${block.content?.level || 1}`;
          return `<${HeadingTag} style="
            color: ${block.styles?.color || "#333"};
            text-align: ${block.styles?.textAlign || "left"};
            font-size: ${block.styles?.fontSize || "24px"};
            margin: 0 0 16px 0;
          ">${block.content?.text || "Título"}</${HeadingTag}>`;

        case "text":
          return `<p style="
            color: ${block.styles?.color || "#333"};
            text-align: ${block.styles?.textAlign || "left"};
            font-size: ${block.styles?.fontSize || "14px"};
            line-height: ${block.styles?.lineHeight || "1.5"};
            margin: 0 0 16px 0;
          ">${(block.content?.text || "Texto").replace(/\n/g, "<br/>")}</p>`;

        case "image":
          const imgTag = `<img src="${block.content?.src || ""}" alt="${block.content?.alt || ""}" style="
            max-width: 100%;
            width: ${block.styles?.width || "100%"};
            height: auto;
            display: block;
            margin: 0 auto 16px;
          "/>`;

          if (block.content?.url) {
            return `<a href="${block.content.url}" target="_blank" style="display: block; text-align: ${block.styles?.textAlign || "center"};">
              ${imgTag}
            </a>`;
          }

          return `<div style="text-align: ${block.styles?.textAlign || "center"};">
            ${imgTag}
          </div>`;

        case "button":
          return `<div style="text-align: ${block.styles?.textAlign || "center"}; margin: 0 0 16px 0;">
            <a href="${block.content?.url || "#"}" style="
              display: inline-block;
              padding: 12px 24px;
              background-color: ${block.styles?.backgroundColor || "#007bff"};
              color: ${block.styles?.color || "#ffffff"};
              text-decoration: none;
              border-radius: ${block.styles?.borderRadius || "4px"};
              font-size: ${block.styles?.fontSize || "14px"};
              font-weight: bold;
            ">${block.content?.text || "Botão"}</a>
          </div>`;

        case "divider":
          return `<hr style="
            border: none;
            border-top: ${block.styles?.thickness || 1}px ${block.styles?.style || "solid"} ${block.styles?.color || "#ddd"};
            margin: ${block.styles?.spacing || 16}px 0;
          "/>`;

        case "spacer":
          return `<div style="height: ${block.styles?.height || 20}px;"></div>`;

        case "html":
          return block.content?.html || "";

        default:
          return "";
      }
    };

    const blocksHtml = blocks
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(block => renderBlock(block))
      .join("");

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Preview</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
          }
          a {
            color: ${settings?.linkColor || "#007bff"};
          }
          @media only screen and (max-width: 600px) {
            body {
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div style="${containerStyle}">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: white; border-radius: 8px;">
            <tr>
              <td style="padding: 20px;">
                ${blocksHtml}
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

    return fullHtml;
  };

  useEffect(() => {
    const html = generateHtmlPreview();
    setHtmlContent(html);
  }, [blocks, settings]);

  const handleRefresh = async () => {
    if (!templateId) {
      const html = generateHtmlPreview();
      setHtmlContent(html);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/email-templates/${templateId}/preview`, {
        variables: {
          customer_name: "João Silva",
          customer_email: "joao@example.com",
          product_name: "Produto Exemplo",
          transaction_amount: "R$ 97,00"
        }
      });
      setHtmlContent(data.html);
    } catch (error) {
      toast.error("Erro ao gerar preview");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Typography variant="h6">
          Preview
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <ToggleButtonGroup
            value={device}
            exclusive
            onChange={(e, value) => value && setDevice(value)}
            size="small"
          >
            <ToggleButton value="desktop" aria-label="Desktop">
              <DesktopIcon />
            </ToggleButton>
            <ToggleButton value="mobile" aria-label="Mobile">
              <MobileIcon />
            </ToggleButton>
          </ToggleButtonGroup>

          <IconButton
            size="small"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          </IconButton>
        </Box>
      </Box>

      {subject && (
        <Paper className={classes.metaInfo}>
          <Typography className={classes.subjectLine}>
            Assunto: {subject}
          </Typography>
          {previewText && (
            <Typography className={classes.previewText}>
              Preview: {previewText}
            </Typography>
          )}
        </Paper>
      )}

      <Box className={classes.previewContainer}>
        {loading ? (
          <Box className={classes.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : (
          <Box className={device === "mobile" ? classes.mobileFrame : ""}>
            <iframe
              className={classes.iframe}
              srcDoc={htmlContent}
              title="Email Preview"
              sandbox="allow-same-origin"
            />
          </Box>
        )}
      </Box>

      <Box mt={2}>
        <Typography variant="caption" color="textSecondary">
          * Preview mostra o email com variáveis de exemplo
        </Typography>
      </Box>
    </Box>
  );
};

export default EmailPreview;