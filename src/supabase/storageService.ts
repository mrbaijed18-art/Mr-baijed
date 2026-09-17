import { getSupabaseClient, isSupabaseConfigured } from './client';

/**
 * Upload prompt cover image to Supabase Storage
 */
export async function uploadPromptImage(
  file: File,
  promptId: string = `img_${Date.now()}`,
  onProgress?: (percent: number) => void
): Promise<string> {
  const client = getSupabaseClient();

  if (isSupabaseConfigured() && client) {
    try {
      if (onProgress) onProgress(20);
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `prompts/${promptId}_${Date.now()}.${fileExt}`;

      const { data, error } = await client.storage
        .from('prompt-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (onProgress) onProgress(70);

      if (!error && data) {
        const { data: publicUrlData } = client.storage
          .from('prompt-images')
          .getPublicUrl(filePath);

        if (onProgress) onProgress(100);
        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, using Data URL fallback:', err);
    }
  }

  // Fallback: Read as base64 Data URL so local images always preview properly!
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (onProgress) onProgress(100);
      resolve(reader.result as string);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}
