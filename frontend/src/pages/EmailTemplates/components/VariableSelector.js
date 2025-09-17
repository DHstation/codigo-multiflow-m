import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Chip,
  InputAdornment,
  IconButton,
  Tooltip
} from "@material-ui/core";
import {
  Search as SearchIcon,
  Code as VariableIcon,
  Person as PersonIcon,
  ShoppingCart as ProductIcon,
  Payment as PaymentIcon,
  Event as DateIcon,
  Schedule as TimeIcon,
  WbSunny as GreetingIcon,
  FileCopy as CopyIcon
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  dialog: {
    minWidth: 600
  },
  searchField: {
    marginBottom: theme.spacing(2)
  },
  tabContent: {
    minHeight: 400,
    maxHeight: 400,
    overflowY: "auto"
  },
  variableGroup: {
    marginBottom: theme.spacing(2)
  },
  groupTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    color: theme.palette.primary.main,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1)
  },
  variableItem: {
    borderRadius: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    "&:hover": {
      backgroundColor: theme.palette.action.hover
    }
  },
  variableCode: {
    fontFamily: "monospace",
    backgroundColor: theme.palette.grey[100],
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: "0.9em"
  },
  chip: {
    marginLeft: theme.spacing(1)
  },
  exampleBox: {
    backgroundColor: theme.palette.grey[50],
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(2)
  },
  copyButton: {
    padding: 4
  }
}));

const VariableSelector = ({ open, onClose, onSelect }) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const webhookVariables = {
    customer: {
      title: "Dados do Cliente",
      icon: <PersonIcon />,
      variables: [
        { name: "${customer_name}", description: "Nome completo do cliente", example: "João Silva" },
        { name: "${customer_email}", description: "Email do cliente", example: "joao@email.com" },
        { name: "${customer_phone}", description: "Telefone do cliente", example: "(11) 98765-4321" },
        { name: "${customer_doc}", description: "CPF/CNPJ do cliente", example: "123.456.789-00" },
        { name: "${customer_address}", description: "Endereço do cliente", example: "Rua Exemplo, 123" },
        { name: "${customer_city}", description: "Cidade do cliente", example: "São Paulo" },
        { name: "${customer_state}", description: "Estado do cliente", example: "SP" },
        { name: "${customer_zip}", description: "CEP do cliente", example: "01234-567" }
      ]
    },
    product: {
      title: "Dados do Produto",
      icon: <ProductIcon />,
      variables: [
        { name: "${product_name}", description: "Nome do produto", example: "Curso Online" },
        { name: "${product_id}", description: "ID do produto", example: "PROD123" },
        { name: "${product_price}", description: "Preço do produto", example: "R$ 197,00" },
        { name: "${product_quantity}", description: "Quantidade comprada", example: "1" },
        { name: "${product_description}", description: "Descrição do produto", example: "Curso completo..." }
      ]
    },
    transaction: {
      title: "Dados da Transação",
      icon: <PaymentIcon />,
      variables: [
        { name: "${transaction_id}", description: "ID da transação", example: "TRX123456" },
        { name: "${transaction_amount}", description: "Valor total", example: "R$ 197,00" },
        { name: "${transaction_status}", description: "Status do pagamento", example: "Aprovado" },
        { name: "${transaction_date}", description: "Data da transação", example: "15/01/2025" },
        { name: "${transaction_method}", description: "Método de pagamento", example: "Cartão de Crédito" },
        { name: "${order_id}", description: "ID do pedido", example: "PED789456" },
        { name: "${invoice_url}", description: "Link da fatura", example: "https://exemplo.com/fatura/123" },
        { name: "${payment_method}", description: "Forma de pagamento", example: "PIX" }
      ]
    },
    affiliate: {
      title: "Dados de Afiliado",
      icon: <PersonIcon />,
      variables: [
        { name: "${affiliate_name}", description: "Nome do afiliado", example: "Maria Santos" },
        { name: "${affiliate_email}", description: "Email do afiliado", example: "maria@email.com" },
        { name: "${commission_value}", description: "Valor da comissão", example: "R$ 39,40" }
      ]
    }
  };

  const systemVariables = {
    datetime: {
      title: "Data e Hora",
      icon: <DateIcon />,
      variables: [
        { name: "{{date}}", description: "Data atual", example: "15/01/2025" },
        { name: "{{time}}", description: "Hora atual", example: "14:30" },
        { name: "{{datetime}}", description: "Data e hora completas", example: "15/01/2025 14:30" },
        { name: "{{day}}", description: "Dia do mês", example: "15" },
        { name: "{{month}}", description: "Mês", example: "Janeiro" },
        { name: "{{year}}", description: "Ano", example: "2025" },
        { name: "{{weekday}}", description: "Dia da semana", example: "Quarta-feira" }
      ]
    },
    greetings: {
      title: "Saudações",
      icon: <GreetingIcon />,
      variables: [
        { name: "{{greeting}}", description: "Saudação baseada no horário", example: "Bom dia" },
        { name: "{{formal_greeting}}", description: "Saudação formal", example: "Prezado(a)" }
      ]
    }
  };

  const handleCopy = (variable) => {
    navigator.clipboard.writeText(variable);
    toast.success(`Variável ${variable} copiada!`);
  };

  const handleSelect = (variable) => {
    onSelect(variable);
  };

  const filterVariables = (variables) => {
    if (!searchTerm) return variables;

    const filtered = {};
    Object.entries(variables).forEach(([key, group]) => {
      const filteredVars = group.variables.filter(
        v =>
          v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filteredVars.length > 0) {
        filtered[key] = { ...group, variables: filteredVars };
      }
    });

    return filtered;
  };

  const renderVariableGroup = (variables) => {
    const filtered = filterVariables(variables);

    if (Object.keys(filtered).length === 0) {
      return (
        <Box textAlign="center" p={4}>
          <Typography variant="body2" color="textSecondary">
            Nenhuma variável encontrada
          </Typography>
        </Box>
      );
    }

    return Object.entries(filtered).map(([key, group]) => (
      <Box key={key} className={classes.variableGroup}>
        <Typography className={classes.groupTitle}>
          {group.icon}
          {group.title}
        </Typography>
        <List dense>
          {group.variables.map((variable) => (
            <ListItem
              key={variable.name}
              button
              className={classes.variableItem}
              onClick={() => handleSelect(variable.name)}
            >
              <ListItemIcon>
                <VariableIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center">
                    <span className={classes.variableCode}>
                      {variable.name}
                    </span>
                    <Tooltip title="Copiar variável">
                      <IconButton
                        size="small"
                        className={classes.copyButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(variable.name);
                        }}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption">
                      {variable.description}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {" → "}{variable.example}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    ));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className={classes.dialog}
    >
      <DialogTitle>
        Selecionar Variável
      </DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          className={classes.searchField}
          placeholder="Buscar variável..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />

        <Tabs
          value={tabValue}
          onChange={(e, value) => setTabValue(value)}
          variant="fullWidth"
        >
          <Tab label="Variáveis do Webhook" />
          <Tab label="Variáveis do Sistema" />
        </Tabs>

        <Paper className={classes.tabContent} elevation={0}>
          {tabValue === 0 && (
            <Box p={2}>
              {renderVariableGroup(webhookVariables)}

              <Box className={classes.exampleBox}>
                <Typography variant="subtitle2" gutterBottom>
                  💡 Como usar:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  As variáveis com <code>${"${...}"}</code> são substituídas pelos dados
                  recebidos do webhook de pagamento. Por exemplo, <code>${"${customer_name}"}</code>{" "}
                  será substituído pelo nome do cliente que realizou a compra.
                </Typography>
              </Box>
            </Box>
          )}

          {tabValue === 1 && (
            <Box p={2}>
              {renderVariableGroup(systemVariables)}

              <Box className={classes.exampleBox}>
                <Typography variant="subtitle2" gutterBottom>
                  💡 Como usar:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  As variáveis com <code>{"{{...}}"}</code> são substituídas automaticamente
                  pelo sistema no momento do envio. Por exemplo, <code>{"{{greeting}}"}</code>{" "}
                  mostrará "Bom dia", "Boa tarde" ou "Boa noite" baseado no horário.
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            onClose();
            toast.info("Clique em uma variável para inserir");
          }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VariableSelector;