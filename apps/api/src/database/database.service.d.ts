import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    db: any;
    private dbPath;
    constructor();
    onModuleInit(): void;
    onModuleDestroy(): void;
    private initDb;
    all<T = any>(sql: string, params?: any[]): T[];
    get<T = any>(sql: string, params?: any[]): T | null;
    run(sql: string, params?: any[]): {
        changes: number;
        lastInsertRowid: number | bigint;
    };
    transaction<T>(fn: () => T): T;
}
