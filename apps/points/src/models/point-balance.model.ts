import { Table, Model, Column, DataType, PrimaryKey } from 'sequelize-typescript';

@Table({ tableName: 'point_balances', timestamps: false })
export class PointBalance extends Model {
  @PrimaryKey
  @Column(DataType.UUID)
  declare userId: string;

  @Column(DataType.INTEGER)
  declare balance: number;

  @Column(DataType.DATE)
  declare updatedAt: Date;
}
