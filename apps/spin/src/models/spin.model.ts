import { Table, Model, Column, DataType, Default, PrimaryKey } from 'sequelize-typescript';
import type { CreationOptional } from 'sequelize';

@Table({ tableName: 'spins', timestamps: true, createdAt: 'createdAt', updatedAt: false })
export class Spin extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: CreationOptional<string>;

    @Column(DataType.UUID)
    declare userId: string;

    @Column(DataType.UUID)
    declare prizeId: string;

    @Default(DataType.NOW)
    @Column(DataType.DATE)
    declare createdAt: Date;

    @Column(DataType.JSON)
    declare resultMeta?: any;
}
