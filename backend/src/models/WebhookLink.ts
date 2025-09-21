import {
  Model,
  Table,
  Column,
  PrimaryKey,
  AutoIncrement,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  HasMany,
  BeforeCreate,
  Default
} from "sequelize-typescript";
import { FlowBuilderModel } from "./FlowBuilder";
import Company from "./Company";
import User from "./User";
import crypto from "crypto";
import EmailTemplate from "./EmailTemplate";

export interface EmailSettings {
  sendDelay: number;
  delayType: "immediate" | "seconds" | "minutes" | "hours" | "days";
  fromName: string;
  fromEmail: string;
  replyTo: string;
}

@Table({
  tableName: "WebhookLinks"
})
export class WebhookLink extends Model<WebhookLink> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @Column
  platform: string; // kiwify, hotmart, braip, monetizze, cacto, perfectpay, eduzz, generic

  @Default("flow")
  @Column(DataType.ENUM("flow", "email"))
  actionType: string;

  @ForeignKey(() => FlowBuilderModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  flowId: number;

  @ForeignKey(() => EmailTemplate)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  emailTemplateId: number;

  @Column({
    type: DataType.JSON,
    allowNull: true
  })
  emailSettings: EmailSettings;

  @Column
  webhookHash: string;

  @Column(DataType.TEXT)
  webhookUrl: string;

  @Default(true)
  @Column
  active: boolean;

  @Default(0)
  @Column
  totalRequests: number;

  @Default(0)
  @Column
  successfulRequests: number;

  @Column
  lastRequestAt: Date;

  @Column(DataType.JSON)
  metadata: object;

  @BelongsTo(() => Company)
  company: Company;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => FlowBuilderModel, 'flowId')
  flow: FlowBuilderModel;

  @BelongsTo(() => EmailTemplate, 'emailTemplateId')
  emailTemplate: EmailTemplate;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BeforeCreate
  static async generateWebhookHash(instance: WebhookLink) {
    // Gerar hash único para o webhook
    const hash = crypto.randomBytes(20).toString('hex');
    instance.webhookHash = hash;
    
    // Gerar URL completa do webhook
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    instance.webhookUrl = `${baseUrl}/webhook/payment/${hash}`;
  }
}

export default WebhookLink;