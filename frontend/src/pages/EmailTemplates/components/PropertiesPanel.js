import React from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  Slider,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Switch,
  FormControlLabel
} from "@material-ui/core";
import {
  FormatColorFill as ColorIcon,
  Code as VariableIcon
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%"
  },
  section: {
    marginBottom: theme.spacing(3)
  },
  propertyGroup: {
    marginBottom: theme.spacing(2)
  },
  colorInput: {
    marginTop: theme.spacing(1)
  },
  noSelection: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary
  }
}));

const PropertiesPanel = ({
  selectedBlock,
  blocks,
  setBlocks,
  settings,
  setSettings,
  onInsertVariable,
  onSelectBlock
}) => {
  const classes = useStyles();

  const updateBlock = (field, value) => {
    if (!selectedBlock) return;

    const updatedBlocks = blocks.map(block => {
      if (block.id === selectedBlock.id) {
        let updatedBlock;
        if (field.includes(".")) {
          const [parent, child] = field.split(".");
          updatedBlock = {
            ...block,
            [parent]: {
              ...block[parent],
              [child]: value
            }
          };
        } else {
          updatedBlock = { ...block, [field]: value };
        }

        // Atualizar também o bloco selecionado para manter sincronia
        if (onSelectBlock) {
          onSelectBlock(updatedBlock);
        }

        return updatedBlock;
      }
      return block;
    });

    setBlocks(updatedBlocks);
  };

  const renderBlockProperties = () => {
    if (!selectedBlock) {
      return (
        <Box className={classes.noSelection}>
          <Typography variant="h6" gutterBottom>
            Nenhum bloco selecionado
          </Typography>
          <Typography variant="body2">
            Clique em um bloco no canvas para editar suas propriedades
          </Typography>
        </Box>
      );
    }

    switch (selectedBlock.type) {
      case "heading":
        return (
          <>
            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Texto do Título"
                value={selectedBlock.content?.text || ""}
                onChange={(e) => updateBlock("content.text", e.target.value)}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={onInsertVariable}
                        title="Inserir variável"
                      >
                        <VariableIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Nível do Título</FormLabel>
                <Select
                  value={selectedBlock.content?.level || 1}
                  onChange={(e) => {
                    // Atualizar nível e limpar fontSize em uma única operação
                    const updatedBlocks = blocks.map(block => {
                      if (block.id === selectedBlock.id) {
                        const updatedBlock = {
                          ...block,
                          content: {
                            ...block.content,
                            level: e.target.value
                          },
                          styles: {
                            ...block.styles,
                            fontSize: "" // Limpar para usar tamanho automático
                          }
                        };

                        // Atualizar bloco selecionado
                        if (onSelectBlock) {
                          onSelectBlock(updatedBlock);
                        }

                        return updatedBlock;
                      }
                      return block;
                    });

                    setBlocks(updatedBlocks);
                  }}
                >
                  <MenuItem value={1}>H1 - Título Principal</MenuItem>
                  <MenuItem value={2}>H2 - Subtítulo</MenuItem>
                  <MenuItem value={3}>H3 - Título Menor</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box className={classes.propertyGroup}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Alinhamento</FormLabel>
                <Select
                  value={selectedBlock.styles?.textAlign || "left"}
                  onChange={(e) => updateBlock("styles.textAlign", e.target.value)}
                >
                  <MenuItem value="left">Esquerda</MenuItem>
                  <MenuItem value="center">Centro</MenuItem>
                  <MenuItem value="right">Direita</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Cor do Texto"
                type="color"
                value={selectedBlock.styles?.color || "#333333"}
                onChange={(e) => updateBlock("styles.color", e.target.value)}
                className={classes.colorInput}
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Tamanho da Fonte"
                value={selectedBlock.styles?.fontSize || ""}
                onChange={(e) => updateBlock("styles.fontSize", e.target.value)}
                margin="normal"
                placeholder="Automático baseado no nível"
                helperText="Ex: 24px, 1.5em, 2rem (deixe vazio para tamanho automático)"
              />
            </Box>
          </>
        );

      case "text":
        return (
          <>
            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Texto do Parágrafo"
                value={selectedBlock.content?.text || ""}
                onChange={(e) => updateBlock("content.text", e.target.value)}
                margin="normal"
                multiline
                rows={4}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={onInsertVariable}
                        title="Inserir variável"
                      >
                        <VariableIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Alinhamento</FormLabel>
                <Select
                  value={selectedBlock.styles?.textAlign || "left"}
                  onChange={(e) => updateBlock("styles.textAlign", e.target.value)}
                >
                  <MenuItem value="left">Esquerda</MenuItem>
                  <MenuItem value="center">Centro</MenuItem>
                  <MenuItem value="right">Direita</MenuItem>
                  <MenuItem value="justify">Justificado</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Cor do Texto"
                type="color"
                value={selectedBlock.styles?.color || "#333333"}
                onChange={(e) => updateBlock("styles.color", e.target.value)}
                className={classes.colorInput}
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Tamanho da Fonte"
                value={selectedBlock.styles?.fontSize || "14px"}
                onChange={(e) => updateBlock("styles.fontSize", e.target.value)}
                margin="normal"
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Espaçamento entre Linhas"
                value={selectedBlock.styles?.lineHeight || "1.5"}
                onChange={(e) => updateBlock("styles.lineHeight", e.target.value)}
                margin="normal"
              />
            </Box>
          </>
        );

      case "image":
        return (
          <>
            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="URL da Imagem"
                value={selectedBlock.content?.src || ""}
                onChange={(e) => updateBlock("content.src", e.target.value)}
                margin="normal"
                helperText="Cole a URL da imagem aqui"
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Texto Alternativo"
                value={selectedBlock.content?.alt || ""}
                onChange={(e) => updateBlock("content.alt", e.target.value)}
                margin="normal"
                helperText="Descrição da imagem para acessibilidade"
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Link (opcional)"
                value={selectedBlock.content?.url || ""}
                onChange={(e) => updateBlock("content.url", e.target.value)}
                margin="normal"
                helperText="URL ao clicar na imagem"
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Largura"
                value={selectedBlock.styles?.width || "100%"}
                onChange={(e) => updateBlock("styles.width", e.target.value)}
                margin="normal"
                helperText="Ex: 100%, 300px, auto"
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Alinhamento</FormLabel>
                <Select
                  value={selectedBlock.styles?.textAlign || "center"}
                  onChange={(e) => updateBlock("styles.textAlign", e.target.value)}
                >
                  <MenuItem value="left">Esquerda</MenuItem>
                  <MenuItem value="center">Centro</MenuItem>
                  <MenuItem value="right">Direita</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </>
        );

      case "button":
        return (
          <>
            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Texto do Botão"
                value={selectedBlock.content?.text || ""}
                onChange={(e) => updateBlock("content.text", e.target.value)}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={onInsertVariable}
                        title="Inserir variável"
                      >
                        <VariableIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="URL do Link"
                value={selectedBlock.content?.url || ""}
                onChange={(e) => updateBlock("content.url", e.target.value)}
                margin="normal"
                helperText="Para onde o botão deve levar"
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Cor de Fundo"
                type="color"
                value={selectedBlock.styles?.backgroundColor || "#007bff"}
                onChange={(e) => updateBlock("styles.backgroundColor", e.target.value)}
                className={classes.colorInput}
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Cor do Texto"
                type="color"
                value={selectedBlock.styles?.color || "#ffffff"}
                onChange={(e) => updateBlock("styles.color", e.target.value)}
                className={classes.colorInput}
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Tamanho da Fonte"
                value={selectedBlock.styles?.fontSize || "14px"}
                onChange={(e) => updateBlock("styles.fontSize", e.target.value)}
                margin="normal"
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Borda Arredondada"
                value={selectedBlock.styles?.borderRadius || "4px"}
                onChange={(e) => updateBlock("styles.borderRadius", e.target.value)}
                margin="normal"
                helperText="Ex: 4px, 50%, 0"
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Alinhamento</FormLabel>
                <Select
                  value={selectedBlock.styles?.textAlign || "center"}
                  onChange={(e) => updateBlock("styles.textAlign", e.target.value)}
                >
                  <MenuItem value="left">Esquerda</MenuItem>
                  <MenuItem value="center">Centro</MenuItem>
                  <MenuItem value="right">Direita</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </>
        );

      case "divider":
        return (
          <>
            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Cor da Linha"
                type="color"
                value={selectedBlock.styles?.color || "#dddddd"}
                onChange={(e) => updateBlock("styles.color", e.target.value)}
                className={classes.colorInput}
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Espessura</FormLabel>
                <Slider
                  value={selectedBlock.styles?.thickness || 1}
                  onChange={(e, value) => updateBlock("styles.thickness", value)}
                  min={1}
                  max={10}
                  valueLabelDisplay="auto"
                  marks
                />
              </FormControl>
            </Box>

            <Box className={classes.propertyGroup}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Estilo da Linha</FormLabel>
                <Select
                  value={selectedBlock.styles?.style || "solid"}
                  onChange={(e) => updateBlock("styles.style", e.target.value)}
                >
                  <MenuItem value="solid">Sólida</MenuItem>
                  <MenuItem value="dashed">Tracejada</MenuItem>
                  <MenuItem value="dotted">Pontilhada</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box className={classes.propertyGroup}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Espaçamento Vertical</FormLabel>
                <Slider
                  value={selectedBlock.styles?.spacing || 16}
                  onChange={(e, value) => updateBlock("styles.spacing", value)}
                  min={0}
                  max={50}
                  valueLabelDisplay="auto"
                />
              </FormControl>
            </Box>
          </>
        );

      case "spacer":
        return (
          <>
            <Box className={classes.propertyGroup}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Altura do Espaçador (px)</FormLabel>
                <Slider
                  value={selectedBlock.styles?.height || 20}
                  onChange={(e, value) => updateBlock("styles.height", value)}
                  min={5}
                  max={200}
                  valueLabelDisplay="auto"
                  step={5}
                />
              </FormControl>
            </Box>
          </>
        );

      case "html":
        return (
          <>
            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Código HTML"
                value={selectedBlock.content?.html || ""}
                onChange={(e) => updateBlock("content.html", e.target.value)}
                margin="normal"
                multiline
                rows={10}
                variant="outlined"
                helperText="Insira seu código HTML personalizado"
                style={{ fontFamily: "monospace" }}
              />
            </Box>
            <Box className={classes.propertyGroup}>
              <Button
                variant="outlined"
                size="small"
                onClick={onInsertVariable}
                startIcon={<VariableIcon />}
              >
                Inserir Variável
              </Button>
            </Box>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box className={classes.root}>
      {!selectedBlock ? (
        <>
          <Typography variant="h6" gutterBottom>
            Configurações Gerais
          </Typography>

          <Divider />

          <Box mt={2} className={classes.section}>
            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Cor de Fundo"
                type="color"
                value={settings?.backgroundColor || "#f4f4f4"}
                onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                className={classes.colorInput}
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Fonte Padrão</FormLabel>
                <Select
                  value={settings?.fontFamily || "Arial, sans-serif"}
                  onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                >
                  <MenuItem value="Arial, sans-serif">Arial</MenuItem>
                  <MenuItem value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</MenuItem>
                  <MenuItem value="Georgia, serif">Georgia</MenuItem>
                  <MenuItem value="'Times New Roman', Times, serif">Times New Roman</MenuItem>
                  <MenuItem value="Verdana, Geneva, sans-serif">Verdana</MenuItem>
                  <MenuItem value="'Trebuchet MS', sans-serif">Trebuchet MS</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Largura do Container (px)"
                type="number"
                value={settings?.containerWidth || 600}
                onChange={(e) => setSettings({ ...settings, containerWidth: parseInt(e.target.value) })}
                margin="normal"
              />
            </Box>

            <Box className={classes.propertyGroup}>
              <TextField
                fullWidth
                label="Cor de Link"
                type="color"
                value={settings?.linkColor || "#007bff"}
                onChange={(e) => setSettings({ ...settings, linkColor: e.target.value })}
                className={classes.colorInput}
              />
            </Box>
          </Box>

          <Divider />

          <Box mt={2} className={classes.noSelection}>
            <Typography variant="body2">
              Selecione um bloco para editar suas propriedades
            </Typography>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            Propriedades do {selectedBlock.type === "heading" ? "Título" :
              selectedBlock.type === "text" ? "Texto" :
              selectedBlock.type === "image" ? "Imagem" :
              selectedBlock.type === "button" ? "Botão" :
              selectedBlock.type === "divider" ? "Divisor" :
              selectedBlock.type === "spacer" ? "Espaçador" :
              selectedBlock.type === "html" ? "HTML" : "Bloco"}
          </Typography>

          <Divider />

          <Box mt={2}>
            {renderBlockProperties()}
          </Box>
        </>
      )}
    </Box>
  );
};

export default PropertiesPanel;