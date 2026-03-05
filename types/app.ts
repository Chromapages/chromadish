export type AppStatus = 'idle' | 'ready' | 'generating' | 'success' | 'error';

export interface MediaAsset {
    id: string;
    filename: string;
    storage_path: string;
    public_url: string;
    alt_text: string | null;
    created_at: string;
}
