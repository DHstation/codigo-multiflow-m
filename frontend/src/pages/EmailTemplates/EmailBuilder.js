import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  IconButton,
  Box,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Divider
} from "@material-ui/core";
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Visibility as PreviewIcon,
  Undo as UndoIcon,
  Redo as RedoIcon
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "react-toastify";

import BlocksPalette from "./components/BlocksPalette";
import EmailCanvas from "./components/EmailCanvas";
import PropertiesPanel from "./components/PropertiesPanel";
import EmailPreview from "./components/EmailPreview";
import VariableSelector from "./components/VariableSelector";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  dialog: {
    maxWidth: "100%",
    width: "95vw",
    height: "95vh"
  },
  appBar: {
    position: "relative"
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1
  },
  content: {
    padding: 0,
    height: "calc(100% - 64px)",
    overflow: "hidden"
  },
  gridContainer: {
    height: "100%"
  },
  panel: {
    height: "100%",
    overflowY: "auto",
    padding: theme.spacing(2),
    borderRight: `1px solid ${theme.palette.divider}`
  },
  canvas: {
    height: "100%",
    overflowY: "auto",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50]
  },
  metadataSection: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  tabContent: {
    padding: theme.spacing(2),
    height: "calc(100% - 48px)",
    overflowY: "auto"
  }
}));

const EmailBuilder = ({ template, onClose, onSave }) => {
  const classes = useStyles();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [settings, setSettings] = useState({
    backgroundColor: "#f4f4f4",
    fontFamily: "Arial, sans-serif",
    containerWidth: 600,
    padding: { top: 20, right: 20, bottom: 20, left: 20 },
    textColor: "#333333",
    linkColor: "#007bff",
    buttonColor: "#007bff",
    buttonTextColor: "#ffffff"
  });
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tabValue, setTabValue] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [variableSelectorOpen, setVariableSelectorOpen] = useState(false);

  useEffect(() => {
    if (template) {
      setName(template.name || "");
      setSubject(template.subject || "");
      setPreviewText(template.previewText || "");
      setBlocks(template.blocks || []);
      setSettings(template.settings || settings);
    }
  }, [template]);

  // Sistema de histórico (undo/redo)
  const addToHistory = (newBlocks) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBlocks(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBlocks(history[historyIndex + 1]);
    }
  };

  const handleSave = async () => {
    if (!name || !subject) {
      toast.error("Nome e assunto são obrigatórios");
      return;
    }

    try {
      const templateData = {
        name,
        subject,
        previewText,
        blocks,
        settings
      };

      await onSave(templateData);
    } catch (error) {
      toast.error("Erro ao salvar template");
    }
  };

  const handlePreview = async () => {
    try {
      const { data } = await api.post(`/email-templates/${template?.id || 0}/preview`, {
        variables: {}
      });

      const previewWindow = window.open("", "_blank");
      previewWindow.document.write(data.html);
      previewWindow.document.close();
    } catch (error) {
      toast.error("Erro ao gerar preview");
    }
  };

  const handleInsertVariable = (variable) => {
    if (selectedBlock) {
      const updatedBlocks = blocks.map(block => {
        if (block.id === selectedBlock.id) {
          return {
            ...block,
            content: {
              ...block.content,
              text: (block.content.text || "") + " " + variable
            }
          };
        }
        return block;
      });
      setBlocks(updatedBlocks);
      addToHistory(updatedBlocks);
    } else {
      // Se não há bloco selecionado, inserir na linha de assunto
      setSubject(subject + " " + variable);
    }
    setVariableSelectorOpen(false);
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      fullScreen
      className={classes.dialog}
    >
      <DndProvider backend={HTML5Backend}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={onClose}>
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Editor de Template de Email
            </Typography>

            <IconButton
              color="inherit"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
            >
              <UndoIcon />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
            >
              <RedoIcon />
            </IconButton>
            <IconButton color="inherit" onClick={handlePreview}>
              <PreviewIcon />
            </IconButton>
            <Button color="inherit" onClick={handleSave} startIcon={<SaveIcon />}>
              Salvar
            </Button>
          </Toolbar>
        </AppBar>

        <DialogContent className={classes.content}>
          <Grid container className={classes.gridContainer}>
            {/* Painel de Blocos */}
            <Grid item xs={12} md={2}>
              <Paper className={classes.panel}>
                <Typography variant="h6" gutterBottom>
                  Blocos
                </Typography>
                <BlocksPalette />
              </Paper>
            </Grid>

            {/* Canvas Principal */}
            <Grid item xs={12} md={6}>
              <Box className={classes.canvas}>
                <Box className={classes.metadataSection}>
                  <TextField
                    fullWidth
                    label="Nome do Template"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    margin="normal"
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={9}>
                      <TextField
                        fullWidth
                        label="Assunto do Email"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Box mt={2}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setVariableSelectorOpen(true)}
                        >
                          Inserir Variável
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                  <TextField
                    fullWidth
                    label="Texto de Preview"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    margin="normal"
                    helperText="Texto que aparece antes de abrir o email"
                  />
                </Box>

                <Divider />

                <EmailCanvas
                  blocks={blocks}
                  setBlocks={(newBlocks) => {
                    setBlocks(newBlocks);
                    addToHistory(newBlocks);
                  }}
                  selectedBlock={selectedBlock}
                  onSelectBlock={setSelectedBlock}
                  settings={settings}
                />
              </Box>
            </Grid>

            {/* Painel de Propriedades/Preview */}
            <Grid item xs={12} md={4}>
              <Paper className={classes.panel}>
                <Tabs
                  value={tabValue}
                  onChange={(e, newValue) => setTabValue(newValue)}
                  variant="fullWidth"
                >
                  <Tab label="Propriedades" />
                  <Tab label="Preview" />
                </Tabs>

                <Box className={classes.tabContent}>
                  {tabValue === 0 && (
                    <PropertiesPanel
                      selectedBlock={selectedBlock}
                      blocks={blocks}
                      setBlocks={(newBlocks) => {
                        setBlocks(newBlocks);
                        addToHistory(newBlocks);
                      }}
                      settings={settings}
                      setSettings={setSettings}
                      onInsertVariable={() => setVariableSelectorOpen(true)}
                    />
                  )}

                  {tabValue === 1 && (
                    <EmailPreview
                      blocks={blocks}
                      settings={settings}
                      subject={subject}
                    />
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <VariableSelector
          open={variableSelectorOpen}
          onClose={() => setVariableSelectorOpen(false)}
          onSelect={handleInsertVariable}
        />
      </DndProvider>
    </Dialog>
  );
};

export default EmailBuilder;