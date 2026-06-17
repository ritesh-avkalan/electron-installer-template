import { contextBridge as e, ipcRenderer as t } from "electron";
//#region electron/preload.ts
e.exposeInMainWorld("electronAPI", {
	platform: process.platform,
	appName: "ESD Desktop",
	checkForUpdates: () => t.send("check-for-updates"),
	installUpdate: () => t.send("install-update"),
	onUpdateStatus: (e) => {
		let n = (t, n, r) => e(n, r);
		return t.on("update-status", n), () => {
			t.removeListener("update-status", n);
		};
	}
});
//#endregion
export {};
