/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    platform: string;
    appName: string;
    checkForUpdates: () => void;
    installUpdate: () => void;
    getAppVersion: () => Promise<string>;
    onUpdateStatus: (callback: (status: string, info: any) => void) => () => void;
  };
}
