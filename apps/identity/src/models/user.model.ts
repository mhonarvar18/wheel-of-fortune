import { Table, Model, Column, DataType, Default, PrimaryKey, Unique } from 'sequelize-typescript';
import type { CreationOptional } from 'sequelize';

@Table({ tableName: 'users', timestamps: true, createdAt: 'createdAt', updatedAt: false })
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @Unique
  @Column(DataType.STRING)
  declare mobile: string;

  @Column(DataType.STRING)
  declare password: string;

  @Column(DataType.STRING)
  declare referralCode?: string;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare createdAt: Date;
}
