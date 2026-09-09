import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    getDocuments(user: any, vehicleId?: string, workOrderId?: string, customerId?: string, type?: string): Promise<any[]>;
    generateDocument(user: any, body: any): Promise<any>;
    createDocument(user: any, body: any): Promise<any>;
    getDocument(user: any, id: string): Promise<any>;
    getDownloadUrl(user: any, id: string): Promise<{
        documentId: any;
        name: any;
        downloadUrl: string;
    }>;
    deleteDocument(user: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
