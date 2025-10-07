import {
  Table,
  Model,
  Column,
  DataType,
  Default,
  PrimaryKey,
  Unique,
  Index,
} from 'sequelize-typescript';
import type { CreationOptional } from 'sequelize';

@Table({ tableName: 'purchases', timestamps: true })
export class Purchase extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @Index
  @Column(DataType.UUID)
  declare userId: string;

  @Column(DataType.STRING)
  declare itemId: string;

  @Column(DataType.INTEGER)
  declare amount: number;

  @Column(DataType.STRING) // 'IRR' | 'IRT' | 'USD'
  declare currency: string;

  @Column(DataType.ENUM('pending', 'paid', 'failed', 'refunded'))
  declare status: 'pending' | 'paid' | 'failed' | 'refunded';

  @Unique
  @Column(DataType.STRING)
  declare externalId: string;

  @Column(DataType.STRING)
  declare paymentRef?: string;

  @Column(DataType.JSON)
  declare meta?: Record<string, unknown> | null;
}
