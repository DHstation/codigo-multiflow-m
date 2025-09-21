import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Tornar flowId nullable para suportar actionType="email"
    await queryInterface.changeColumn("WebhookLinks", "flowId", {
      type: DataTypes.INTEGER,
      allowNull: true, // Mudança crítica: permitir NULL
      references: {
        model: "FlowBuilders",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL" // Mudar para SET NULL em vez de CASCADE
    });
  },

  down: async (queryInterface: QueryInterface) => {
    // Reverter para NOT NULL (cuidado: pode falhar se houver valores NULL)
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