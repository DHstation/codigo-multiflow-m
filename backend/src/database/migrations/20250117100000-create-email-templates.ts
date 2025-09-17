import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("EmailTemplates", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL"
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false
      },
      previewText: {
        type: DataTypes.STRING,
        allowNull: true
      },
      blocks: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      settings: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {
          backgroundColor: "#f4f4f4",
          fontFamily: "Arial, sans-serif",
          containerWidth: 600,
          padding: { top: 20, right: 20, bottom: 20, left: 20 }
        }
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.addIndex("EmailTemplates", ["companyId"]);
    await queryInterface.addIndex("EmailTemplates", ["userId"]);
    await queryInterface.addIndex("EmailTemplates", ["active"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("EmailTemplates");
  }
};