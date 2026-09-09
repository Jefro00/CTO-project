import { MediaService } from './media.service';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    generateUploadUrl(user: any, body: any): Promise<{
        mediaId: string;
        uploadUrl: string;
        storageKey: string;
    }>;
    completeUpload(user: any, id: string, body: any): Promise<any>;
    getMedia(user: any, id: string): Promise<any>;
    getDownloadUrl(user: any, id: string): Promise<{
        mediaId: any;
        fileName: any;
        mimeType: any;
        url: string;
        expiresAt: string;
    }>;
    deleteMedia(user: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
