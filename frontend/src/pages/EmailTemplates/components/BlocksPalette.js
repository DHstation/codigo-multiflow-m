import React from "react";
import { Box, Paper, Typography } from "@material-ui/core";
import { useDrag } from "react-dnd";
import {
  Title as TitleIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  TouchApp as ButtonIcon,
  Remove as DividerIcon,
  Height as SpacerIcon,
  Code as HtmlIcon
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { v4 as uuidv4 } from "uuid";

const useStyles = makeStyles((theme) => ({
  blockItem: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    backgroundColor: "#fff",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(0.5),
    cursor: "move",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: "white",
      transform: "translateX(4px)"
    }
  },
  dragging: {
    opacity: 0.5
  },
  icon: {
    fontSize: 20
  }
}));

const BlockItem = ({ type, label, icon: Icon }) => {
  const classes = useStyles();
  const [{ isDragging }, drag] = useDrag({
    type: "EMAIL_BLOCK",
    item: () => {
      return {
        type,
        id: uuidv4(),
        isNew: true
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  return (
    <Paper
      ref={drag}
      className={`${classes.blockItem} ${isDragging ? classes.dragging : ""}`}
    >
      <Icon className={classes.icon} />
      <Typography variant="body2">{label}</Typography>
    </Paper>
  );
};

const BlocksPalette = () => {
  const blocks = [
    { type: "heading", label: "Título", icon: TitleIcon },
    { type: "text", label: "Texto", icon: TextIcon },
    { type: "image", label: "Imagem", icon: ImageIcon },
    { type: "button", label: "Botão", icon: ButtonIcon },
    { type: "divider", label: "Divisor", icon: DividerIcon },
    { type: "spacer", label: "Espaçador", icon: SpacerIcon },
    { type: "html", label: "HTML", icon: HtmlIcon }
  ];

  return (
    <Box>
      {blocks.map((block) => (
        <BlockItem key={block.type} {...block} />
      ))}
    </Box>
  );
};

export default BlocksPalette;