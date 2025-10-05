"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwardedPrize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
let AwardedPrize = class AwardedPrize extends sequelize_typescript_1.Model {
};
exports.AwardedPrize = AwardedPrize;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", Object)
], AwardedPrize.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Index)('uniq_user_prize'),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], AwardedPrize.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.Index)('uniq_user_prize'),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], AwardedPrize.prototype, "prizeId", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.NOW),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], AwardedPrize.prototype, "createdAt", void 0);
exports.AwardedPrize = AwardedPrize = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'awarded_prizes', timestamps: true, createdAt: 'createdAt', updatedAt: false })
], AwardedPrize);
//# sourceMappingURL=awarded-prize.model.js.map