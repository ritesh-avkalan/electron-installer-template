# ESD Desktop (EigenSpace Design)

ESD Desktop is an Electron-based desktop application written in React and TypeScript. It features a GitHub Desktop-styled login flow with smooth celestial/cosmic animations, Firebase integration, and a comprehensive Projects Dashboard mimicking the layout of `esd-frontend`.

---

## Technical Features

1. **GitHub Desktop-styled Welcome Layout**: A split-screen layout where the left half handles user authentication and guest-bypassing, while the right half renders an interactive CSS keyframe-animated cosmic galaxy with revolving orbits, planets, and twinkling stars.
2. **Robust Authentication**: Supports Firebase Google Sign-In (with customized browser User-Agent parameters to bypass Google's Electron restriction) and standard email credentials registration/login.
3. **Projects Workspace**: Displays projects in responsive Grid or list-based Table layouts, with advanced search queries, tag filters, sorting (Name A-Z, Z-A, Upload Dates), a new project creation overlay dialog, and a sliding details sidebar carrying team details and a 3D rotating preview card.
4. **Dynamic Themes**: Dynamic dark and light modes styled with Vanilla CSS variables and a local theme persistence system.
5. **Connectivity Fallbacks**: Proactively attempts queries to the Eigenspace database server (`http://localhost:8000/files/`), falling back to local cached storage and pre-populated high-fidelity mock templates when offline.

---

## How to Install & Run

### 1. Install Dependencies
Run the install command inside the `package-try` folder to set up packages:
```bash
npm install
```

### 2. Start the App (Development Mode)
Launch the development environment:
```bash
npm run dev
```
*This command fires up the Vite dev server and automatically launches the Electron app window on your screen with hot-reloading (HMR) enabled.*

---

## How to Create Installers (Packaging)

We use `electron-builder` to package the app and bundle installers for multiple platforms.

### 1. Build Verification
Before packaging, you can run a production-ready typescript compilation and asset bundle check:
```bash
npm run build
```

### 2. Generate Installers
Build the installer packages for your target platforms:
```bash
npm run dist
```
*This runs the production build check first, compiles the Electron main/preload scripts, bundles the React assets, and runs `electron-builder`.*

### Platform-specific Outputs
The generated files will be written to the `./release/` directory:
* **macOS**: Generates a `.dmg` disk image and app package (built under the `release/` folder).
* **Windows**: Generates a setup `.exe` installer (via NSIS compiler).
* **Linux**: Generates a portable `.AppImage` package.

You can customize the metadata, icons, and platform targets inside the `"build"` block in [package.json](file:///Users/eigenplus/Github/avkalan-labs/eigenspace/package-try/package.json).
