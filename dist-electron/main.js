import { BrowserWindow as e, Menu as t, app as n, shell as r } from "electron";
import * as i from "path";
import { dirname as a } from "path";
import { fileURLToPath as o } from "url";
import * as s from "http";
import * as c from "fs";
//#region electron/main.ts
var l = a(o(import.meta.url));
process.env.DIST = i.join(l, "../dist"), process.env.VITE_PUBLIC = n.isPackaged ? process.env.DIST : i.join(l, "../public");
var u = null, d = null, f = null, p = process.env.VITE_DEV_SERVER_URL;
function m(e) {
	return new Promise((t, n) => {
		d = s.createServer((t, n) => {
			let r = t.url || "/", a = r.indexOf("?");
			a !== -1 && (r = r.substring(0, a));
			let o = r.indexOf("#");
			o !== -1 && (r = r.substring(0, o));
			let s = decodeURIComponent(r);
			(s === "/" || !s.includes(".")) && (s = "/index.html");
			let l = i.join(e, s);
			c.readFile(l, (t, r) => {
				if (t) {
					let t = i.join(e, "index.html");
					c.readFile(t, (e, t) => {
						e ? (n.writeHead(404, { "Content-Type": "text/plain" }), n.end("Not Found")) : (n.writeHead(200, { "Content-Type": "text/html" }), n.end(t));
					});
					return;
				}
				let a = i.extname(l).toLowerCase(), o = "text/html";
				a === ".js" || a === ".mjs" ? o = "application/javascript" : a === ".css" ? o = "text/css" : a === ".json" ? o = "application/json" : a === ".png" ? o = "image/png" : a === ".jpg" || a === ".jpeg" ? o = "image/jpeg" : a === ".svg" ? o = "image/svg+xml" : a === ".ico" && (o = "image/x-icon"), n.writeHead(200, { "Content-Type": o }), n.end(r);
			});
		}), d.listen(0, "127.0.0.1", () => {
			let e = d?.address();
			e && typeof e == "object" ? t(e.port) : n(/* @__PURE__ */ Error("Failed to resolve server address"));
		});
	});
}
function h() {
	let e = [];
	process.platform === "darwin" && e.push({
		label: n.name,
		submenu: [
			{ role: "about" },
			{ type: "separator" },
			{ role: "services" },
			{ type: "separator" },
			{ role: "hide" },
			{ role: "hideOthers" },
			{ role: "unhide" },
			{ type: "separator" },
			{ role: "quit" }
		]
	}), e.push({
		label: "File",
		submenu: [process.platform === "darwin" ? { role: "close" } : { role: "quit" }]
	}), e.push({
		label: "Edit",
		submenu: [
			{ role: "undo" },
			{ role: "redo" },
			{ type: "separator" },
			{ role: "cut" },
			{ role: "copy" },
			{ role: "paste" },
			{ role: "selectAll" }
		]
	}), e.push({
		label: "View",
		submenu: [
			{ role: "reload" },
			{ role: "forceReload" },
			{ role: "toggleDevTools" },
			{ type: "separator" },
			{ role: "resetZoom" },
			{ role: "zoomIn" },
			{ role: "zoomOut" },
			{ type: "separator" },
			{ role: "togglefullscreen" }
		]
	}), e.push({
		label: "Window",
		submenu: [
			{ role: "minimize" },
			{ role: "zoom" },
			...process.platform === "darwin" ? [
				{ type: "separator" },
				{ role: "front" },
				{ type: "separator" },
				{ role: "window" }
			] : [{ role: "close" }]
		]
	}), e.push({
		role: "help",
		submenu: [{
			label: "ESD Documentation",
			click: async () => {
				await r.openExternal("https://eigenspace.com");
			}
		}]
	});
	let i = t.buildFromTemplate(e);
	t.setApplicationMenu(i);
}
async function g() {
	if (!p && !f) try {
		f = await m(process.env.DIST || "");
	} catch (e) {
		console.error("Failed to start production local HTTP server:", e);
	}
	u = new e({
		width: 1200,
		height: 800,
		minWidth: 900,
		minHeight: 600,
		title: "ESD",
		icon: i.join(l, "icons/esd.svg"),
		webPreferences: {
			preload: i.join(l, "preload.mjs"),
			nodeIntegration: !1,
			contextIsolation: !0
		}
	}), u.webContents.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", p ? (u.loadURL(p), u.webContents.openDevTools({ mode: "detach" })) : f ? u.loadURL(`http://localhost:${f}/`) : u.loadFile(i.join(process.env.DIST || "", "index.html")), u.on("closed", () => {
		u = null;
	});
}
n.on("window-all-closed", () => {
	d && d.close(), process.platform !== "darwin" && n.quit();
}), n.on("activate", () => {
	e.getAllWindows().length === 0 && g();
}), n.whenReady().then(() => {
	h(), process.platform === "darwin" && n.dock && n.dock.setIcon(i.join(l, "logo-2.png")), g();
});
//#endregion
export {};
