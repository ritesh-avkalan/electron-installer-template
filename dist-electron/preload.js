import { contextBridge as e } from "electron";
//#region electron/preload.ts
e.exposeInMainWorld("electronAPI", {
	platform: process.platform,
	appName: "ESD Desktop"
});
//#endregion
export {};
