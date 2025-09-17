import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid
} from "@material-ui/core";

const EmailTemplateModal = ({ open, onClose, onSave, template }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    previewText: ""
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || "",
        description: template.description || "",
        subject: template.subject || "",
        previewText: template.previewText || ""
      });
    } else {
      setFormData({
        name: "",
        description: "",
        subject: "",
        previewText: ""
      });
    }
  }, [template, open]);

  const handleSubmit = () => {
    if (!formData.name || !formData.subject) {
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {template ? "Editar Template" : "Novo Template de Email"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nome do Template"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descrição"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={2}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Assunto do Email"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              required
              margin="normal"
              helperText="Você pode usar variáveis como ${customer_name}"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Texto de Preview"
              value={formData.previewText}
              onChange={(e) =>
                setFormData({ ...formData, previewText: e.target.value })
              }
              margin="normal"
              helperText="Texto que aparece antes de abrir o email"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={!formData.name || !formData.subject}
        >
          {template ? "Salvar" : "Criar e Editar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailTemplateModal;