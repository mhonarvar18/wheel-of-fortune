"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const api_gateway_module_1 = require("./api-gateway.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(api_gateway_module_1.ApiGatewayModule, { bufferLogs: true });
    app.setGlobalPrefix('api');
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    const port = Number(process.env.PORT || 3000);
    await app.listen(port);
    console.log(`API Gateway http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map