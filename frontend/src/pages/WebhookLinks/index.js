import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Grid,
  FormControlLabel,
  RadioGroup,
  Radio,
  Divider
} from "@material-ui/core";
import {
  Add as AddIcon,
  FileCopy as CopyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  AccountTree as FlowIcon
} from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import ConfirmationModal from "../../components/ConfirmationModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dialogContent: {
    padding: theme.spacing(2),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  infoCard: {
    marginTop: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: "white",
  },
  warningCard: {
    marginTop: theme.spacing(2),
    backgroundColor: theme.palette.warning.main,
    color: "white",
  },
  urlBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  urlText: {
    flex: 1,
    wordBreak: "break-all",
    fontSize: "0.875rem",
    fontFamily: "monospace",
    color: "#333333",
  },
  searchField: {
    marginBottom: theme.spacing(2),
  },
  platformChip: {
    textTransform: "capitalize",
  },
  statsBox: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: "#f0f0f0",
    borderRadius: theme.spacing(0.5),
  }
}));

const WebhookLinks = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [webhookLinks, setWebhookLinks] = useState([]);
  const [flows, setFlows] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    platform: "generic",
    actionType: "flow",
    flowId: "",
    emailTemplateId: "",
    emailSettings: {
      sendDelay: 0,
      delayType: "immediate",
      fromName: "",
      fromEmail: "",
      replyTo: ""
    },
    active: true
  });

  const platforms = [
    { value: "kiwify", label: "Kiwify", color: "#7C3AED" },
    { value: "hotmart", label: "Hotmart", color: "#ED8936" },
    { value: "braip", label: "Braip", color: "#3182CE" },
    { value: "monetizze", label: "Monetizze", color: "#38A169" },
    { value: "cacto", label: "Cacto", color: "#D69E2E" },
    { value: "perfectpay", label: "Perfect Pay", color: "#E53E3E" },
    { value: "eduzz", label: "Eduzz", color: "#319795" },
    { value: "generic", label: "Genérico", color: "#718096" }
  ];

  useEffect(() => {
    loadWebhookLinks();
    loadFlows();
    loadEmailTemplates();
  }, []);

  const loadWebhookLinks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/webhook-links", {
        params: { searchParam }
      });
      setWebhookLinks(data.webhookLinks || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFlows = async () => {
    try {
      const { data } = await api.get("/flowbuilder");
      setFlows(data.flows || []);
    } catch (err) {
      toastError(err);
    }
  };

  const loadEmailTemplates = async () => {
    try {
      console.log("🔍 Carregando email templates...");
      const { data } = await api.get("/email-templates");
      console.log("📧 Email templates recebidos:", data);
      setEmailTemplates(data.templates || []);
      console.log("✅ Templates carregados:", data.templates?.length || 0);
    } catch (err) {
      console.error("❌ Erro ao carregar email templates:", err);
      toastError(err);
    }
  };

  const handleOpenModal = (webhook = null) => {
    if (webhook) {
      setFormData({
        name: webhook.name,
        description: webhook.description || "",
        platform: webhook.platform,
        actionType: webhook.actionType || "flow",
        flowId: webhook.flowId || "",
        emailTemplateId: webhook.emailTemplateId || "",
        emailSettings: webhook.emailSettings || {
          sendDelay: 0,
          delayType: "immediate",
          fromName: "",
          fromEmail: "",
          replyTo: ""
        },
        active: webhook.active
      });
      setSelectedWebhook(webhook);
    } else {
      setFormData({
        name: "",
        description: "",
        platform: "generic",
        actionType: "flow",
        flowId: "",
        emailTemplateId: "",
        emailSettings: {
          sendDelay: 0,
          delayType: "immediate",
          fromName: "",
          fromEmail: "",
          replyTo: ""
        },
        active: true
      });
      setSelectedWebhook(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedWebhook(null);
    setFormData({
      name: "",
      description: "",
      platform: "generic",
      actionType: "flow",
      flowId: "",
      emailTemplateId: "",
      emailSettings: {
        sendDelay: 0,
        delayType: "immediate",
        fromName: "",
        fromEmail: "",
        replyTo: ""
      },
      active: true
    });
  };

  const handleSaveWebhook = async () => {
    if (!formData.name) {
      toast.error("Nome é obrigatório!");
      return;
    }

    if (formData.actionType === "flow" && !formData.flowId) {
      toast.error("Flow Builder é obrigatório para ação de Flow!");
      return;
    }

    if (formData.actionType === "email" && !formData.emailTemplateId) {
      toast.error("Template de Email é obrigatório para ação de Email!");
      return;
    }

    try {
      if (selectedWebhook) {
        // Update
        await api.put(`/webhook-links/${selectedWebhook.id}`, formData);
        toast.success("Webhook atualizado com sucesso!");
      } else {
        // Create
        await api.post("/webhook-links", formData);
        toast.success("Webhook criado com sucesso!");
      }
      handleCloseModal();
      loadWebhookLinks();
    } catch (err) {
      toastError(err);
    }
  };

  const handleDeleteWebhook = async () => {
    try {
      await api.delete(`/webhook-links/${deleteId}`);
      toast.success("Webhook deletado com sucesso!");
      setConfirmationOpen(false);
      setDeleteId(null);
      loadWebhookLinks();
    } catch (err) {
      toastError(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("URL copiada para a área de transferência!");
  };

  const handleViewDetails = async (webhook) => {
    try {
      const { data } = await api.get(`/webhook-links/${webhook.id}`);
      setSelectedWebhook(data);
      setDetailsModalOpen(true);
    } catch (err) {
      toastError(err);
    }
  };

  const getPlatformConfig = (platform) => {
    return platforms.find((p) => p.value === platform) || platforms[platforms.length - 1];
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Webhook Links</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
          >
            Novo Webhook Link
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <TextField
          fullWidth
          placeholder="Pesquisar webhook..."
          className={classes.searchField}
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && loadWebhookLinks()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Plataforma</TableCell>
                <TableCell>Tipo/Destino</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Requisições</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : webhookLinks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Nenhum webhook encontrado
                  </TableCell>
                </TableRow>
              ) : (
                webhookLinks.map((webhook) => {
                  const platformConfig = getPlatformConfig(webhook.platform);
                  return (
                    <TableRow key={webhook.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{webhook.name}</Typography>
                        {webhook.description && (
                          <Typography variant="caption" color="textSecondary">
                            {webhook.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={platformConfig.label}
                          size="small"
                          className={classes.platformChip}
                          style={{ backgroundColor: platformConfig.color, color: "white" }}
                        />
                      </TableCell>
                      <TableCell>
                        {webhook.actionType === "email" ? (
                          webhook.emailTemplate ? (
                            <Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <EmailIcon fontSize="small" color="action" />
                                <Typography variant="body2">{webhook.emailTemplate.name}</Typography>
                              </Box>
                              <Chip
                                size="small"
                                label={webhook.emailTemplate.active ? "Ativo" : "Inativo"}
                                color={webhook.emailTemplate.active ? "primary" : "default"}
                              />
                            </Box>
                          ) : (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <EmailIcon fontSize="small" color="error" />
                              <Typography variant="body2" color="error">
                                Template não encontrado
                              </Typography>
                            </Box>
                          )
                        ) : (
                          webhook.flow ? (
                            <Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <FlowIcon fontSize="small" color="action" />
                                <Typography variant="body2">{webhook.flow.name}</Typography>
                              </Box>
                              <Chip
                                size="small"
                                label={webhook.flow.active ? "Ativo" : "Inativo"}
                                color={webhook.flow.active ? "primary" : "default"}
                              />
                            </Box>
                          ) : (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <FlowIcon fontSize="small" color="error" />
                              <Typography variant="body2" color="error">
                                Flow não encontrado
                              </Typography>
                            </Box>
                          )
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={webhook.active ? <CheckIcon /> : <WarningIcon />}
                          label={webhook.active ? "Ativo" : "Inativo"}
                          color={webhook.active ? "primary" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box className={classes.statsBox}>
                          <Typography variant="caption">
                            Total: {webhook.totalRequests || 0}
                          </Typography>
                          <br />
                          <Typography variant="caption">
                            Sucesso: {webhook.successfulRequests || 0}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver detalhes">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(webhook)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copiar URL">
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(webhook.webhookUrl)}
                          >
                            <CopyIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenModal(webhook)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Deletar">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setDeleteId(webhook.id);
                              setConfirmationOpen(true);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal de Criação/Edição */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedWebhook ? "Editar Webhook Link" : "Criar Novo Webhook Link"}
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome do Webhook"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                variant="outlined"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Tipo de Ação
              </Typography>
              <RadioGroup
                row
                value={formData.actionType}
                onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
              >
                <FormControlLabel
                  value="flow"
                  control={<Radio color="primary" />}
                  label={
                    <Box display="flex" alignItems="center">
                      <FlowIcon style={{ marginRight: 4 }} />
                      Flow Builder
                    </Box>
                  }
                />
                <FormControlLabel
                  value="email"
                  control={<Radio color="primary" />}
                  label={
                    <Box display="flex" alignItems="center">
                      <EmailIcon style={{ marginRight: 4 }} />
                      Email Template
                    </Box>
                  }
                />
              </RadioGroup>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Plataforma de Pagamento</InputLabel>
                <Select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  label="Plataforma de Pagamento"
                >
                  {platforms.map((platform) => (
                    <MenuItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {formData.actionType === "flow" ? (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel>Flow Builder</InputLabel>
                  <Select
                    value={formData.flowId}
                    onChange={(e) => setFormData({ ...formData, flowId: e.target.value })}
                    label="Flow Builder"
                  >
                    <MenuItem value="">
                      <em>Selecione um flow</em>
                    </MenuItem>
                    {flows.map((flow) => (
                      <MenuItem key={flow.id} value={flow.id}>
                        {flow.name} {!flow.active && "(Inativo)"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ) : (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>Template de Email</InputLabel>
                    <Select
                      value={formData.emailTemplateId}
                      onChange={(e) => setFormData({ ...formData, emailTemplateId: e.target.value })}
                      label="Template de Email"
                    >
                      <MenuItem value="">
                        <em>Selecione um template</em>
                      </MenuItem>
                      {emailTemplates.map((template) => (
                        <MenuItem key={template.id} value={template.id}>
                          {template.name} {!template.active && "(Inativo)"}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Configurações de Envio
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Atraso no Envio"
                    type="number"
                    value={formData.emailSettings.sendDelay}
                    onChange={(e) => setFormData({
                      ...formData,
                      emailSettings: {
                        ...formData.emailSettings,
                        sendDelay: parseInt(e.target.value) || 0
                      }
                    })}
                    variant="outlined"
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Tipo de Atraso</InputLabel>
                    <Select
                      value={formData.emailSettings.delayType}
                      onChange={(e) => setFormData({
                        ...formData,
                        emailSettings: {
                          ...formData.emailSettings,
                          delayType: e.target.value
                        }
                      })}
                      label="Tipo de Atraso"
                    >
                      <MenuItem value="immediate">Imediato</MenuItem>
                      <MenuItem value="seconds">Segundos</MenuItem>
                      <MenuItem value="minutes">Minutos</MenuItem>
                      <MenuItem value="hours">Horas</MenuItem>
                      <MenuItem value="days">Dias</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Nome do Remetente"
                    value={formData.emailSettings.fromName}
                    onChange={(e) => setFormData({
                      ...formData,
                      emailSettings: {
                        ...formData.emailSettings,
                        fromName: e.target.value
                      }
                    })}
                    variant="outlined"
                    helperText="Ex: Equipe de Vendas"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email do Remetente"
                    value={formData.emailSettings.fromEmail}
                    onChange={(e) => setFormData({
                      ...formData,
                      emailSettings: {
                        ...formData.emailSettings,
                        fromEmail: e.target.value
                      }
                    })}
                    variant="outlined"
                    helperText="Ex: vendas@empresa.com"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email de Resposta"
                    value={formData.emailSettings.replyTo}
                    onChange={(e) => setFormData({
                      ...formData,
                      emailSettings: {
                        ...formData.emailSettings,
                        replyTo: e.target.value
                      }
                    })}
                    variant="outlined"
                    helperText="Ex: suporte@empresa.com"
                  />
                </Grid>
              </>
            )}
          </Grid>

          {selectedWebhook && (
            <Card className={classes.infoCard}>
              <CardContent>
                <Typography variant="h6">URL do Webhook</Typography>
                <Box className={classes.urlBox}>
                  <Typography className={classes.urlText}>
                    {selectedWebhook.webhookUrl}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(selectedWebhook.webhookUrl)}
                    style={{ color: "#333333" }}
                  >
                    <CopyIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          )}

          <Card className={classes.warningCard}>
            <CardContent>
              <Typography variant="h6">📋 Instruções de Configuração</Typography>
              <Typography variant="body2">
                1. Após criar o webhook, copie a URL gerada
                <br />
                2. Acesse sua plataforma de pagamento ({getPlatformConfig(formData.platform).label})
                <br />
                3. Configure a URL do webhook nas configurações
                <br />
                4. Teste enviando um evento para verificar funcionamento
                <br />
                <br />
                {formData.actionType === "email" ? (
                  <>
                    <strong>📧 Modo Email:</strong> Quando um evento for recebido, o sistema enviará
                    automaticamente o template de email selecionado para o cliente, usando as variáveis
                    do webhook (nome, email, produto, etc.).
                  </>
                ) : (
                  <>
                    <strong>🔄 Modo Flow:</strong> Quando um evento for recebido, o sistema executará
                    o Flow Builder selecionado, criando um ticket e enviando mensagens automáticas
                    via WhatsApp.
                  </>
                )}
              </Typography>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSaveWebhook} variant="contained" color="primary">
            {selectedWebhook ? "Atualizar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalhes do Webhook</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {selectedWebhook && selectedWebhook.webhookLink && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">{selectedWebhook.webhookLink.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedWebhook.webhookLink.description}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">URL do Webhook</Typography>
                    <Box className={classes.urlBox}>
                      <Typography className={classes.urlText}>
                        {selectedWebhook.webhookLink.webhookUrl}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          copyToClipboard(selectedWebhook.webhookLink.webhookUrl)
                        }
                      >
                        <CopyIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">Estatísticas</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          Total de Requisições: {selectedWebhook.stats?.totalRequests || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          Requisições Bem-sucedidas:{" "}
                          {selectedWebhook.stats?.successfulRequests || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          Taxa de Sucesso: {selectedWebhook.stats?.successRate || 0}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          Última Requisição:{" "}
                          {selectedWebhook.stats?.lastRequestAt
                            ? new Date(selectedWebhook.stats.lastRequestAt).toLocaleString()
                            : "Nunca"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {selectedWebhook.recentLogs && selectedWebhook.recentLogs.length > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">Logs Recentes</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Data/Hora</TableCell>
                              <TableCell>Evento</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Tempo (ms)</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedWebhook.recentLogs.map((log) => (
                              <TableRow key={log.id}>
                                <TableCell>
                                  {new Date(log.createdAt).toLocaleString()}
                                </TableCell>
                                <TableCell>{log.eventType}</TableCell>
                                <TableCell>
                                  <Chip
                                    size="small"
                                    label={log.flowTriggered ? "Sucesso" : "Erro"}
                                    color={log.flowTriggered ? "primary" : "secondary"}
                                  />
                                </TableCell>
                                <TableCell>{log.responseTimeMs}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsModalOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmação */}
      <ConfirmationModal
        title="Deletar Webhook"
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleDeleteWebhook}
      >
        Tem certeza que deseja deletar este webhook? Esta ação não pode ser desfeita.
      </ConfirmationModal>
    </MainContainer>
  );
};

export default WebhookLinks;