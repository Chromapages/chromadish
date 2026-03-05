import { supabase } from './client';

export interface MediaAsset {
    id: string;
    filename: string;
    storage_path: string;
    public_url: string;
    alt_text: string | null;
    created_at: string;
}

export interface MediaAssetsPage {
    assets: MediaAsset[];
    hasMore: boolean;
}

const PAGE_SIZE = 24;

/**
 * Fetches a page of media assets from the Supabase database.
 */
export async function getMediaAssets(page = 1): Promise<MediaAssetsPage> {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await supabase
        .from('media_assets')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching media assets:', error);
        throw error;
    }

    return {
        assets: data || [],
        hasMore: count !== null && to < count - 1,
    };
}

/**
 * Deletes a media asset from storage and the database.
 */
export async function deleteMediaAsset(id: string, storagePath: string): Promise<void> {
    const { error: storageError } = await supabase.storage
        .from('food-assets')
        .remove([storagePath]);

    if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        throw storageError;
    }

    const { error: dbError } = await supabase
        .from('media_assets')
        .delete()
        .eq('id', id);

    if (dbError) {
        console.error('Error deleting database record:', dbError);
        throw dbError;
    }
}

/**
 * Uploads a file to Supabase storage and creates a record in the database.
 */
export async function uploadMediaAsset(file: File, altText: string = ''): Promise<MediaAsset> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `food-images/${fileName}`;

    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
        .from('food-assets')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('food-assets')
        .getPublicUrl(filePath);

    // 3. Create DB record
    const { data, error: dbError } = await supabase
        .from('media_assets')
        .insert([
            {
                filename: file.name,
                storage_path: filePath,
                public_url: publicUrl,
                alt_text: altText,
            },
        ])
        .select()
        .single();

    if (dbError) {
        console.error('Error creating database record:', dbError);
        throw dbError;
    }

    return data;
}

/**
 * Searches media assets by filename or alt text.
 */
export async function searchMediaAssets(query: string): Promise<MediaAsset[]> {
    const { data, error } = await supabase
        .from('media_assets')
        .select('*')
        .or(`filename.ilike.%${query}%,alt_text.ilike.%${query}%`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error searching media assets:', error);
        throw error;
    }

    return data || [];
}
