import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("EmailLogs", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      templateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "EmailTemplates",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      webhookLinkId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "WebhookLinks",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Companies",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      recipientEmail: {
        type: DataTypes.STRING,
        allowNull: false
      },
      recipientName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM("pending", "sent", "failed", "opened", "clicked", "bounced"),
        allowNull: false,
        defaultValue: "pending"
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      openedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      clickedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      failedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      variables: {
        type: DataTypes.JSON,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Criar índices
    await queryInterface.addIndex("EmailLogs", ["templateId"]);
    await queryInterface.addIndex("EmailLogs", ["webhookLinkId"]);
    await queryInterface.addIndex("EmailLogs", ["companyId"]);
    await queryInterface.addIndex("EmailLogs", ["recipientEmail"]);
    await queryInterface.addIndex("EmailLogs", ["status"]);
    await queryInterface.addIndex("EmailLogs", ["sentAt"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("EmailLogs");
  }
};