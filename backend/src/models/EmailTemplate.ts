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
  Default,
  AllowNull
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";

export interface EmailBlock {
  id: string;
  type: "heading" | "text" | "image" | "button" | "divider" | "spacer" | "columns" | "html";
  order: number;
  content: {
    text?: string;
    html?: string;
    src?: string;
    alt?: string;
    href?: string;
    buttonText?: string;
    target?: string;
  };
  styles: {
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontWeight?: string;
    fontFamily?: string;
    textAlign?: string;
    padding?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    borderRadius?: string;
    border?: string;
    width?: string;
    height?: string;
    lineHeight?: string;
  };
  columns?: EmailBlock[];
}

export interface EmailTemplateSettings {
  backgroundColor: string;
  fontFamily: string;
  containerWidth: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  textColor?: string;
  linkColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
}

@Table({
  tableName: "EmailTemplates"
})
export class EmailTemplate extends Model<EmailTemplate> {
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

  @AllowNull(false)
  @Column
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @AllowNull(false)
  @Column
  subject: string;

  @Column
  previewText: string;

  @Column(DataType.JSON)
  blocks: EmailBlock[];

  @Column(DataType.JSON)
  settings: EmailTemplateSettings;

  @Default(true)
  @Column
  active: boolean;

  @BelongsTo(() => Company)
  company: Company;

  @BelongsTo(() => User)
  user: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default EmailTemplate;