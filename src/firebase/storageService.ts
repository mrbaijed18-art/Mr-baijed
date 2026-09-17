import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './config';

/**
 * Upload an image file for a prompt.
 * Strictly adheres to Firebase Storage path: prompt-images/{promptId}/image
 */
export async function uploadPromptImage(
  file: File,
  promptId: string = `img_${Date.now()}`,
  onProgress?: (percent: number) => void
): Promise<string> {
  // Check if live Firebase Storage is active
  if (isFirebaseConfigured() && storage) {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `prompt-images/${promptId}/image`);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          promptId,
          uploadedAt: new Date().toISOString()
        }
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error('Firebase Storage upload failed:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }

  // Fallback for demo/offline preview mode:
  // Simulate progress and convert to reliable base64 data URL for preview
  return new Promise((resolve, reject) => {
    let current = 0;
    const interval = setInterval(() => {
      current += 25;
      if (onProgress) onProgress(Math.min(current, 95));
      if (current >= 100) {
        clearInterval(interval);
        const reader = new FileReader();
        reader.onload = () => {
          if (onProgress) onProgress(100);
          resolve(reader.result as string);
        };
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      }
    }, 80);
  });
}
