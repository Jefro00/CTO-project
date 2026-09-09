export declare const APP_CONFIG: {
    readonly APP_NAME: "AUTOMOTIVE OS";
    readonly APP_VERSION: "1.0.0-mvp";
    readonly API_PREFIX: "/api/v1";
    readonly DEFAULT_PORT: 4000;
    readonly DEFAULT_WEB_PORT: 3000;
    readonly PAGINATION: {
        readonly DEFAULT_PAGE: 1;
        readonly DEFAULT_LIMIT: 25;
        readonly MAX_LIMIT: 100;
    };
    readonly MAX_FILE_SIZES: {
        readonly PHOTO: number;
        readonly VIDEO: number;
        readonly DOCUMENT: number;
    };
    readonly ALLOWED_MIME_TYPES: {
        readonly PHOTO: readonly ["image/jpeg", "image/png", "image/webp", "image/heic"];
        readonly VIDEO: readonly ["video/mp4", "video/quicktime", "video/webm"];
        readonly DOCUMENT: readonly ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"];
    };
    readonly LATENCY_SLAS: {
        readonly VEHICLE_SEARCH_MS: 300;
        readonly TYPICAL_API_P95_MS: 500;
        readonly VEHICLE_PAGE_MS: 1000;
        readonly WEBSOCKET_EVENT_MS: 1000;
        readonly UPLOAD_INIT_MS: 300;
    };
};
