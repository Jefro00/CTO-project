export const APP_CONFIG = {
  APP_NAME: 'AUTOMOTIVE OS',
  APP_VERSION: '1.0.0-mvp',
  API_PREFIX: '/api/v1',
  DEFAULT_PORT: 4000,
  DEFAULT_WEB_PORT: 3000,
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 25,
    MAX_LIMIT: 100,
  },
  MAX_FILE_SIZES: {
    PHOTO: 20 * 1024 * 1024, // 20 MB (Section 85)
    VIDEO: 500 * 1024 * 1024, // 500 MB (Section 85)
    DOCUMENT: 50 * 1024 * 1024, // 50 MB (Section 85)
  },
  ALLOWED_MIME_TYPES: {
    PHOTO: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
    VIDEO: ['video/mp4', 'video/quicktime', 'video/webm'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
  },
  LATENCY_SLAS: {
    VEHICLE_SEARCH_MS: 300,
    TYPICAL_API_P95_MS: 500,
    VEHICLE_PAGE_MS: 1000,
    WEBSOCKET_EVENT_MS: 1000,
    UPLOAD_INIT_MS: 300,
  },
} as const;
