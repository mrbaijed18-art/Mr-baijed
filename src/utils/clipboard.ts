import confetti from 'canvas-confetti';
import { incrementPromptCopies } from '../supabase/promptService';
import { handleDirectLinkOnCopy } from './adsterraManager';

export interface CopyOptions {
  promptId?: string;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
  triggerConfetti?: boolean;
}

/**
 * Copies complete prompt text to the user's device clipboard
 * and increments copy count metrics.
 */
export async function copyPromptToClipboard(
  promptText: string, 
  options: CopyOptions = {}
): Promise<boolean> {
  if (!promptText || promptText.trim().length === 0) {
    if (options.onError) options.onError(new Error('Prompt text is empty.'));
    return false;
  }

  try {
    // 1. Primary standard modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(promptText);
    } else {
      // 2. Fallback for non-secure contexts or embedded iframes
      const textArea = document.createElement('textarea');
      textArea.value = promptText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (!successful) throw new Error('execCommand copy returned false');
    }

    // 3. Track copy metric in background
    if (options.promptId) {
      incrementPromptCopies(options.promptId).catch(() => {});
    }

    // 4. Trigger Adsterra Direct Link if enabled
    handleDirectLinkOnCopy();

    // 5. Subtle celebratory confetti burst (optional, light weight)
    if (options.triggerConfetti) {
      try {
        confetti({
          particleCount: 28,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#a855f7', '#ec4899', '#38bdf8'],
          disableForReducedMotion: true
        });
      } catch {
        // Ignored if canvas-confetti fails
      }
    }

    if (options.onSuccess) options.onSuccess();
    return true;
  } catch (err: any) {
    console.error('Clipboard copy error:', err);
    if (options.onError) options.onError(err);
    return false;
  }
}
