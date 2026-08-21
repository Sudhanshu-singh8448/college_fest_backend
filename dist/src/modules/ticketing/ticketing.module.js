"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketingModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const ticketing_service_1 = require("./ticketing.service");
const ticketing_controller_1 = require("./ticketing.controller");
let TicketingModule = class TicketingModule {
};
exports.TicketingModule = TicketingModule;
exports.TicketingModule = TicketingModule = __decorate([
    (0, common_1.Module)({
        imports: [jwt_1.JwtModule.register({})],
        controllers: [ticketing_controller_1.TicketingController],
        providers: [ticketing_service_1.TicketingService],
        exports: [ticketing_service_1.TicketingService],
    })
], TicketingModule);
//# sourceMappingURL=ticketing.module.js.map