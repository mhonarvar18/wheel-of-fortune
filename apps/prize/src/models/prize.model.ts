import { Table, Model, Column, DataType, Default, PrimaryKey } from 'sequelize-typescript';
import { type CreationOptional } from 'sequelize';


export type PrizeType = 'cash'|'coupon'|'lottery_ticket'|'lottery_ticket_x3';

@Table({ tableName: 'prizes', timestamps: true, createdAt: 'createdAt', updatedAt: false })
export class Prize extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.ENUM('cash','coupon','lottery_ticket','lottery_ticket_x3'))
  declare type: PrizeType;

  // DECIMAL به صورت string میاد؛ در خروجی می‌تونی Number() کنی
  @Column(DataType.DECIMAL(5,2))
  declare weight: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare oneTimePerUser: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare active: boolean;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare createdAt: Date;
}
