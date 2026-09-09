import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../database/database.service';
export declare class JwtAuthGuard implements CanActivate {
    private readonly reflector;
    private readonly jwtService;
    private readonly db;
    constructor(reflector: Reflector, jwtService: JwtService, db: DatabaseService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
