import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Adicionar campo actionType
    await queryInterface.addColumn("WebhookLinks", "actionType", {
      type: DataTypes.ENUM("flow", "email"),
      allowNull: false,
      defaultValue: "flow"
    });

    // Adicionar campo emailTemplateId
    await queryInterface.addColumn("WebhookLinks", "emailTemplateId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "EmailTemplates",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });

    // Adicionar campo emailSettings
    await queryInterface.addColumn("WebhookLinks", "emailSettings", {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        sendDelay: 0,
        delayType: "immediate",
        fromName: "",
        fromEmail: "",
        replyTo: ""
      }
    });

    // Criar índice
    await queryInterface.addIndex("WebhookLinks", ["emailTemplateId"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("WebhookLinks", "actionType");
    await queryInterface.removeColumn("WebhookLinks", "emailTemplateId");
    await queryInterface.removeColumn("WebhookLinks", "emailSettings");
  }
};