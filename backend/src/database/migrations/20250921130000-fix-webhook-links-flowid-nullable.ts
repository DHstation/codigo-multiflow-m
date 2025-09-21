import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Tornar flowId nullable para permitir webhooks de email
    await queryInterface.changeColumn("WebhookLinks", "flowId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "FlowBuilders",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    // Reverter para não permitir null (cuidado: pode falhar se houver registros com null)
    await queryInterface.changeColumn("WebhookLinks", "flowId", {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "FlowBuilders",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    });
  }
};