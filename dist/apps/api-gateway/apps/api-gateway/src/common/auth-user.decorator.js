"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserId = exports.AuthUser = void 0;
const common_1 = require("@nestjs/common");
exports.AuthUser = (0, common_1.createParamDecorator)((_data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
});
exports.UserId = (0, common_1.createParamDecorator)((_data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    const u = req.user;
    return u?.userId ?? u?.sub;
});
//# sourceMappingURL=auth-user.decorator.js.map