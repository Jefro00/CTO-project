"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Enable CORS
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    // Global Prefix (Section 31)
    app.setGlobalPrefix('api/v1', {
        exclude: ['health', 'api/docs'],
    });
    // Validation pipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    // Swagger OpenAPI Documentation (Section 108)
    const config = new swagger_1.DocumentBuilder()
        .setTitle('AUTOMOTIVE OS API')
        .setDescription('Multi-tenant SaaS REST API for automotive repair shops (СТО) with Vehicle-centric history tracking, Inspections, Work Orders, Documents, and Real-time WebSockets.')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addTag('auth', 'Authentication & Authorization')
        .addTag('organization', 'Organization Settings')
        .addTag('locations', 'Branches & Locations')
        .addTag('users', 'User Management & Location Scopes')
        .addTag('roles', 'Roles & Permissions')
        .addTag('customers', 'Customer CRM')
        .addTag('vehicles', 'Vehicle Registry & Timeline History')
        .addTag('inspections', 'Vehicle Check-in Inspections & Damage Marking')
        .addTag('media', 'Photos, Videos, Presigned Uploads')
        .addTag('work-orders', 'Work Orders & Job Calculation')
        .addTag('documents', 'Document Templates & Acts Generation')
        .addTag('tasks', 'Workshop Tasks')
        .addTag('reminders', 'Maintenance Reminders')
        .addTag('notifications', 'In-App Notifications')
        .addTag('search', 'Unified Global Search')
        .addTag('audit', 'Immutable Audit Logs')
        .addTag('backups', 'Backup & Restore')
        .addTag('reports', 'Analytics & KPI Reports')
        .addTag('health', 'System Health Check')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        customSiteTitle: 'AUTOMOTIVE OS — API Documentation',
    });
    const port = process.env.PORT || 4000;
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 AUTOMOTIVE OS API is running on: http://localhost:${port}`);
    logger.log(`📚 Swagger OpenAPI Documentation available at: http://localhost:${port}/api/docs`);
    logger.log(`🏥 Health Check available at: http://localhost:${port}/health`);
}
bootstrap();
//# sourceMappingURL=main.js.map