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
  Default
} from "sequelize-typescript";
import Company from "./Company";
import EmailTemplate from "./EmailTemplate";
import WebhookLink from "./WebhookLink";

export enum EmailStatus {
  PENDING = "pending",
  SENT = "sent",
  FAILED = "failed",
  OPENED = "opened",
  CLICKED = "clicked",
  BOUNCED = "bounced"
}

@Table({
  tableName: "EmailLogs"
})
export class EmailLog extends Model<EmailLog> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => EmailTemplate)
  @Column
  templateId: number;

  @ForeignKey(() => WebhookLink)
  @Column
  webhookLinkId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column
  recipientEmail: string;

  @Column
  recipientName: string;

  @Column
  subject: string;

  @Default(EmailStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(EmailStatus)))
  status: EmailStatus;

  @Column
  sentAt: Date;

  @Column
  openedAt: Date;

  @Column
  clickedAt: Date;

  @Column
  failedAt: Date;

  @Column(DataType.TEXT)
  errorMessage: string;

  @Column(DataType.JSON)
  variables: object;

  @Column(DataType.JSON)
  metadata: object;

  @BelongsTo(() => EmailTemplate)
  template: EmailTemplate;

  @BelongsTo(() => WebhookLink)
  webhookLink: WebhookLink;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default EmailLog;