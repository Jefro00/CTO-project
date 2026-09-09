import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
export declare class AuthService {
    private readonly db;
    private readonly jwtService;
    constructor(db: DatabaseService, jwtService: JwtService);
    register(data: {
        organizationName: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
        locationName?: string;
    }): Promise<{
        user: any;
        organization: any;
        accessToken: string;
        refreshToken: string;
    }>;
    login(email: string, pass: string): Promise<{
        user: any;
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(refreshToken: string): Promise<{
        user: any;
        accessToken: string;
        refreshToken: string;
    }>;
    getUserById(id: string): any;
    private generateTokens;
}
