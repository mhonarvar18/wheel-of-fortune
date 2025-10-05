import {
  Table,
  Model,
  Column,
  DataType,
  PrimaryKey,
  Default,
  Index,
  Unique,
} from 'sequelize-typescript';

@Table({ tableName: 'point_entries', timestamps: false })
export class PointEntry extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Index('ix_entries_user')
  @Column(DataType.UUID)
  declare userId: string;

  @Column(DataType.INTEGER)
  declare delta: number;

  @Column(DataType.STRING)
  declare reason: string;

  // برای idempotency؛ با reason یا به‌تنهایی یکتا نگه می‌داریم:
  @Unique('uq_external')
  @Column(DataType.STRING)
  declare externalId: string;

  @Column(DataType.JSON)
  declare meta?: Record<string, unknown> | null;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare createdAt: Date;
}
