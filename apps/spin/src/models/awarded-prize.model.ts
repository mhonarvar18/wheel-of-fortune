import { Table, Model, Column, DataType, Default, PrimaryKey, Index } from 'sequelize-typescript';
import type { CreationOptional } from 'sequelize';

@Table({ tableName: 'awarded_prizes', timestamps: true, createdAt: 'createdAt', updatedAt: false })
export class AwardedPrize extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @Index('uniq_user_prize')
  @Column(DataType.UUID)
  declare userId: string;

  @Index('uniq_user_prize')
  @Column(DataType.UUID)
  declare prizeId: string;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare createdAt: Date;
}
