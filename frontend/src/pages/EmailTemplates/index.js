import React, { useState, useEffect, useContext, useCallback } from "react";
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
  IconButton,
  Tooltip,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Switch,
  FormControlLabel
} from "@material-ui/core";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  BarChart as StatsIcon,
  Refresh as RefreshIcon
} from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import ConfirmationModal from "../../components/ConfirmationModal";
import EmailTemplateModal from "./EmailTemplateModal";
import EmailBuilder from "./EmailBuilder";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles
  },
  searchField: {
    marginBottom: theme.spacing(2)
  },
  statsCard: {
    marginBottom: theme.spacing(2)
  },
  activeChip: {
    backgroundColor: theme.palette.success.main,
    color: "white"
  },
  inactiveChip: {
    backgroundColor: theme.palette.grey[500],
    color: "white"
  },
  tableContainer: {
    marginTop: theme.spacing(2)
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1)
  }
}));

const EmailTemplates = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadTemplates();
    loadStats();
  }, [searchParam]);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/email-templates", {
        params: { searchParam }
      });
      setTemplates(data.templates);
    } catch (err) {
      toast.error("Erro ao carregar templates de email");
    } finally {
      setLoading(false);
    }
  }, [searchParam]);

  const loadStats = async () => {
    try {
      const { data } = await api.get("/email-templates/all/stats");
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    }
  };

  const handleOpenModal = (template = null) => {
    setSelectedTemplate(template);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTemplate(null);
    setModalOpen(false);
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      if (selectedTemplate) {
        await api.put(`/email-templates/${selectedTemplate.id}`, templateData);
        toast.success("Template atualizado com sucesso!");
      } else {
        await api.post("/email-templates", templateData);
        toast.success("Template criado com sucesso!");
      }
      loadTemplates();
      handleCloseModal();
    } catch (err) {
      toast.error("Erro ao salvar template");
    }
  };

  const handleEditBuilder = (template) => {
    setSelectedTemplate(template);
    setBuilderOpen(true);
  };

  const handleDeleteTemplate = async () => {
    try {
      await api.delete(`/email-templates/${templateToDelete.id}`);
      toast.success("Template removido com sucesso!");
      loadTemplates();
      setConfirmModalOpen(false);
      setTemplateToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erro ao remover template");
    }
  };

  const handleDuplicateTemplate = async (template) => {
    try {
      const { data } = await api.post(`/email-templates/${template.id}/duplicate`, {
        name: `${template.name} (Cópia)`
      });
      toast.success("Template duplicado com sucesso!");
      loadTemplates();
    } catch (err) {
      toast.error("Erro ao duplicar template");
    }
  };

  const handleToggleActive = async (template) => {
    try {
      await api.put(`/email-templates/${template.id}`, {
        active: !template.active
      });
      loadTemplates();
      toast.success(
        template.active ? "Template desativado" : "Template ativado"
      );
    } catch (err) {
      toast.error("Erro ao alterar status do template");
    }
  };

  const handlePreviewTemplate = async (template) => {
    try {
      const { data } = await api.post(`/email-templates/${template.id}/preview`, {
        variables: {}
      });

      // Abrir preview em nova janela
      const previewWindow = window.open("", "_blank");
      previewWindow.document.write(data.html);
      previewWindow.document.close();
    } catch (err) {
      toast.error("Erro ao visualizar template");
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title="Excluir Template"
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDeleteTemplate}
      >
        Tem certeza que deseja excluir o template "{templateToDelete?.name}"?
      </ConfirmationModal>

      <EmailTemplateModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTemplate}
        template={selectedTemplate}
      />

      {builderOpen && (
        <EmailBuilder
          template={selectedTemplate}
          onClose={() => setBuilderOpen(false)}
          onSave={async (templateData) => {
            await handleSaveTemplate(templateData);
            setBuilderOpen(false);
          }}
        />
      )}

      <MainHeader>
        <Title>Templates de Email</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
          >
            Novo Template
          </Button>
          <IconButton onClick={loadTemplates}>
            <RefreshIcon />
          </IconButton>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper}>
        {stats && (
          <Grid container spacing={2} className={classes.statsCard}>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Emails Enviados
                  </Typography>
                  <Typography variant="h4">{stats.emails.sent}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Taxa de Abertura
                  </Typography>
                  <Typography variant="h4">
                    {stats.emails.openRate.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Taxa de Clique
                  </Typography>
                  <Typography variant="h4">
                    {stats.emails.clickRate.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Fila de Envio
                  </Typography>
                  <Typography variant="h4">{stats.queue.waiting}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <TextField
          fullWidth
          placeholder="Pesquisar templates..."
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
          className={classes.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />

        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Assunto</TableCell>
                <TableCell>Criado por</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography>Nenhum template encontrado</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon color="primary" />
                        <Typography>{template.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{template.subject}</TableCell>
                    <TableCell>{template.user?.name}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={template.active ? "Ativo" : "Inativo"}
                        size="small"
                        className={
                          template.active
                            ? classes.activeChip
                            : classes.inactiveChip
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <div className={classes.actionButtons}>
                        <Tooltip title="Editar no Builder">
                          <IconButton
                            size="small"
                            onClick={() => handleEditBuilder(template)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Visualizar">
                          <IconButton
                            size="small"
                            onClick={() => handlePreviewTemplate(template)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicar">
                          <IconButton
                            size="small"
                            onClick={() => handleDuplicateTemplate(template)}
                          >
                            <CopyIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ativar/Desativar">
                          <Switch
                            checked={template.active}
                            onChange={() => handleToggleActive(template)}
                            size="small"
                          />
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setTemplateToDelete(template);
                              setConfirmModalOpen(true);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </MainContainer>
  );
};

export default EmailTemplates;