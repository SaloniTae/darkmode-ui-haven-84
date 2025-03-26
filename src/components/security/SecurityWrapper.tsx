
import { ReactNode, useEffect } from 'react';

interface SecurityWrapperProps {
  children: ReactNode;
}

export function SecurityWrapper({ children }: SecurityWrapperProps) {
  useEffect(() => {
    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent keyboard shortcuts for developer tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault();
      }
    };

    // Detect and prevent DevTools
    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      if (widthThreshold || heightThreshold) {
        document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><div style="text-align:center;padding:20px;background:#f8d7da;color:#721c24;border-radius:5px;box-shadow:0 4px 6px rgba(0,0,0,0.1);"><h2>Security Alert</h2><p>Developer tools are not allowed on this site.</p></div></div>';
      }
    };

    // Add all event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', detectDevTools);
    
    // Set up anti-debugging techniques
    const interval = setInterval(detectDevTools, 1000);
    
    // Clean up all event listeners on unmount
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', detectDevTools);
      clearInterval(interval);
    };
  }, []);

  return <>{children}</>;
}
