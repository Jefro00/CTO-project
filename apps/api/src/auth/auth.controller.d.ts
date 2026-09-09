import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: any): Promise<{
        user: any;
        organization: any;
        accessToken: string;
        refreshToken: string;
    }>;
    login(body: any): Promise<{
        user: any;
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(body: any): Promise<{
        user: any;
        accessToken: string;
        refreshToken: string;
    }>;
    logout(): Promise<{
        success: boolean;
        message: string;
    }>;
    forgotPassword(body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getMe(user: any): Promise<any>;
}
