import React, { useEffect } from 'react';
import { useAdsterra } from '../utils/adsterraManager';

export const AdsterraGlobalScripts: React.FC = () => {
  const [config] = useAdsterra();

  useEffect(() => {
    if (!config.enabled) {
      // Clean up any previously injected Adsterra global scripts
      const oldScripts = document.querySelectorAll('[data-adsterra-script="true"]');
      oldScripts.forEach((el) => el.remove());
      return;
    }

    const scriptsToInject: Array<{ type: 'popunder' | 'socialBar'; code: string }> = [];

    if (config.popunder?.enabled && config.popunder?.code?.trim()) {
      scriptsToInject.push({ type: 'popunder', code: config.popunder.code });
    }

    if (config.socialBar?.enabled && config.socialBar?.code?.trim()) {
      scriptsToInject.push({ type: 'socialBar', code: config.socialBar.code });
    }

    // Clean up old scripts before injecting updated ones
    const oldScripts = document.querySelectorAll('[data-adsterra-script="true"]');
    oldScripts.forEach((el) => el.remove());

    scriptsToInject.forEach(({ type, code }) => {
      try {
        // Parse script tags from the code string
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = code;
        const scriptElements = tempDiv.querySelectorAll('script');

        if (scriptElements.length > 0) {
          scriptElements.forEach((s) => {
            const newScript = document.createElement('script');
            newScript.setAttribute('data-adsterra-script', 'true');
            newScript.setAttribute('data-adsterra-type', type);

            // Copy attributes (src, type, async, etc.)
            Array.from(s.attributes).forEach((attr) => {
              newScript.setAttribute(attr.name, attr.value);
            });

            if (s.src) {
              newScript.src = s.src;
            } else {
              newScript.textContent = s.textContent;
            }

            document.body.appendChild(newScript);
          });
        } else {
          // If the user pasted plain text or inline JS
          const newScript = document.createElement('script');
          newScript.setAttribute('data-adsterra-script', 'true');
          newScript.setAttribute('data-adsterra-type', type);
          newScript.textContent = code;
          document.body.appendChild(newScript);
        }
      } catch (err) {
        console.error(`Failed to inject Adsterra ${type} script:`, err);
      }
    });

    return () => {
      const activeScripts = document.querySelectorAll('[data-adsterra-script="true"]');
      activeScripts.forEach((el) => el.remove());
    };
  }, [config.enabled, config.popunder?.enabled, config.popunder?.code, config.socialBar?.enabled, config.socialBar?.code]);

  return null;
};
