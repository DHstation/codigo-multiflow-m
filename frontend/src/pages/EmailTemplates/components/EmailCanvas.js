import React from "react";
import { Box, Paper, Typography, IconButton, Tooltip } from "@material-ui/core";
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Add as AddIcon
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { useDrop, useDrag } from "react-dnd";
import { v4 as uuidv4 } from "uuid";

const useStyles = makeStyles((theme) => ({
  canvas: {
    minHeight: 400,
    backgroundColor: "#ffffff",
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(4), // Padding extra na parte inferior
    position: "relative"
  },
  canvasActive: {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + "08"
  },
  block: {
    marginBottom: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(0.5),
    position: "relative",
    cursor: "pointer",
    transition: "all 0.3s ease",
    width: "100%", // Garante largura total
    boxSizing: "border-box", // Inclui border no cálculo da largura
    "&:hover": {
      borderColor: theme.palette.primary.main,
      "& $blockActions": {
        opacity: 1
      }
    }
  },
  blockSelected: {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
    backgroundColor: theme.palette.primary.light + "10"
  },
  blockContent: {
    padding: theme.spacing(2)
  },
  blockActions: {
    position: "absolute",
    top: 4,
    right: 4,
    opacity: 0,
    transition: "opacity 0.3s ease",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: theme.spacing(0.5),
    display: "flex",
    gap: theme.spacing(0.5)
  },
  dragHandle: {
    position: "absolute",
    left: 4,
    top: "50%",
    transform: "translateY(-50%)",
    opacity: 0,
    transition: "opacity 0.3s ease",
    cursor: "move"
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary
  },
  addButton: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: theme.palette.primary.main,
    color: "white",
    width: 32,
    height: 32,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark
    }
  }
}));

const BlockRenderer = ({ block, isSelected, onSelect, onUpdate, onDelete, index, moveBlock }) => {
  const classes = useStyles();

  const [{ isDragging }, drag] = useDrag({
    type: "EXISTING_BLOCK",
    item: { id: block.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const renderBlockContent = () => {
    switch (block.type) {
      case "heading":
        const level = block.content?.level || 1;
        const HeadingComponent = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
        return React.createElement(
          HeadingComponent,
          {
            style: {
              margin: 0,
              color: block.styles?.color || "#333",
              textAlign: block.styles?.textAlign || "left",
              fontSize: block.styles?.fontSize || "inherit"
            }
          },
          block.content?.text || "Título"
        );

      case "text":
        return (
          <Typography
            variant="body1"
            style={{
              margin: 0,
              color: block.styles?.color || "#333",
              textAlign: block.styles?.textAlign || "left",
              fontSize: block.styles?.fontSize || "14px"
            }}
          >
            {block.content?.text || "Texto do parágrafo"}
          </Typography>
        );

      case "image":
        return (
          <Box textAlign={block.styles?.textAlign || "center"}>
            {block.content?.src ? (
              <img
                src={block.content.src}
                alt={block.content.alt || "Imagem"}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  width: block.styles?.width || "auto"
                }}
              />
            ) : (
              <Box
                p={2}
                bgcolor="grey.100"
                border="1px dashed grey"
                textAlign="center"
              >
                <Typography variant="body2" color="textSecondary">
                  [Imagem - {block.content?.alt || "Clique para configurar"}]
                </Typography>
              </Box>
            )}
          </Box>
        );

      case "button":
        return (
          <Box textAlign={block.styles?.textAlign || "center"}>
            <Box
              component="span"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                backgroundColor: block.styles?.backgroundColor || "#007bff",
                color: block.styles?.color || "#ffffff",
                textDecoration: "none",
                borderRadius: block.styles?.borderRadius || "4px",
                border: "none",
                cursor: "pointer",
                fontSize: block.styles?.fontSize || "14px"
              }}
            >
              {block.content?.text || "Botão"}
            </Box>
          </Box>
        );

      case "divider":
        return (
          <hr style={{
            border: "none",
            borderTop: `${block.styles?.thickness || 1}px ${block.styles?.style || "solid"} ${block.styles?.color || "#ddd"}`,
            margin: `${block.styles?.spacing || 16}px 0`
          }} />
        );

      case "spacer":
        return (
          <Box
            style={{
              height: block.styles?.height || 20,
              backgroundColor: "transparent"
            }}
          >
            <Typography
              variant="caption"
              color="textSecondary"
              style={{ opacity: 0.5 }}
            >
              Espaçador ({block.styles?.height || 20}px)
            </Typography>
          </Box>
        );

      case "html":
        return (
          <Box
            p={1}
            bgcolor="grey.50"
            border="1px solid #ddd"
            style={{ fontFamily: "monospace", fontSize: "12px" }}
          >
            <Typography variant="caption" color="textSecondary">
              HTML:
            </Typography>
            <div dangerouslySetInnerHTML={{ __html: block.content?.html || "<!-- HTML personalizado -->" }} />
          </Box>
        );

      default:
        return (
          <Typography variant="body2" color="textSecondary">
            Bloco desconhecido: {block.type}
          </Typography>
        );
    }
  };

  return (
    <Paper
      ref={drag}
      className={`${classes.block} ${isSelected ? classes.blockSelected : ""}`}
      onClick={() => onSelect(block)}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Box className={classes.blockContent}>
        {renderBlockContent()}
      </Box>

      <Box className={classes.dragHandle}>
        <DragIcon fontSize="small" color="action" />
      </Box>

      <Box className={classes.blockActions}>
        <Tooltip title="Excluir bloco">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(block.id);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

const EmailCanvas = ({ blocks, setBlocks, selectedBlock, onSelectBlock, settings }) => {
  const classes = useStyles();

  const [{ isOver }, drop] = useDrop({
    accept: ["EMAIL_BLOCK", "EXISTING_BLOCK"],
    drop: (item, monitor) => {
      if (item.isNew) {
        const newBlock = createBlock(item.type);
        setBlocks([...blocks, newBlock]);
      } else if (item.index !== undefined) {
        moveBlock(item.index, blocks.length);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  const createBlock = (type) => {
    const baseBlock = {
      id: uuidv4(),
      type,
      order: blocks.length,
      content: {},
      styles: {}
    };

    switch (type) {
      case "heading":
        return {
          ...baseBlock,
          content: { text: "Novo Título", level: 1 },
          styles: { color: "#333", textAlign: "left", fontSize: "24px" }
        };
      case "text":
        return {
          ...baseBlock,
          content: { text: "Novo parágrafo de texto" },
          styles: { color: "#333", textAlign: "left", fontSize: "14px" }
        };
      case "image":
        return {
          ...baseBlock,
          content: { src: "", alt: "Imagem" },
          styles: { textAlign: "center", width: "100%" }
        };
      case "button":
        return {
          ...baseBlock,
          content: { text: "Clique Aqui", url: "#" },
          styles: { backgroundColor: "#007bff", color: "#ffffff", textAlign: "center" }
        };
      case "divider":
        return {
          ...baseBlock,
          styles: { color: "#ddd", thickness: 1, style: "solid", spacing: 16 }
        };
      case "spacer":
        return {
          ...baseBlock,
          styles: { height: 20 }
        };
      case "html":
        return {
          ...baseBlock,
          content: { html: "<!-- Seu código HTML aqui -->" }
        };
      default:
        return baseBlock;
    }
  };

  const moveBlock = (fromIndex, toIndex) => {
    const newBlocks = [...blocks];
    const [removed] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, removed);

    const reorderedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index
    }));

    setBlocks(reorderedBlocks);
  };

  const handleDeleteBlock = (blockId) => {
    const newBlocks = blocks.filter(block => block.id !== blockId);
    setBlocks(newBlocks);

    if (selectedBlock?.id === blockId) {
      onSelectBlock(null);
    }
  };

  const handleUpdateBlock = (blockId, updates) => {
    const newBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );
    setBlocks(newBlocks);
  };

  return (
    <Box mt={2}>
      <Typography variant="h6" gutterBottom>
        Canvas do Email
      </Typography>

      <Box
        ref={drop}
        className={`${classes.canvas} ${isOver ? classes.canvasActive : ""}`}
        style={{
          backgroundColor: settings?.backgroundColor || "#f4f4f4",
          fontFamily: settings?.fontFamily || "Arial, sans-serif"
        }}
      >
        {blocks.length === 0 ? (
          <Box className={classes.emptyState}>
            <Typography variant="h6" gutterBottom>
              Canvas Vazio
            </Typography>
            <Typography variant="body2">
              Arraste blocos da paleta à esquerda para começar a construir seu email
            </Typography>
          </Box>
        ) : (
          <Box style={{ width: "100%", paddingBottom: "80px" }}>
            {blocks
              .sort((a, b) => a.order - b.order)
              .map((block, index) => (
                <Box
                  key={block.id}
                  style={{
                    marginBottom: index === blocks.length - 1 ? "40px" : "0" // Margem extra no último bloco
                  }}
                >
                  <BlockRenderer
                    block={block}
                    index={index}
                    isSelected={selectedBlock?.id === block.id}
                    onSelect={onSelectBlock}
                    onUpdate={handleUpdateBlock}
                    onDelete={handleDeleteBlock}
                    moveBlock={moveBlock}
                  />
                </Box>
              ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EmailCanvas;