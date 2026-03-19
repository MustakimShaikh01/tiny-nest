# 🚀 Deploying TinyNest to Render

This marketplace is configured for high-performance deployment on Render using **Persistent Disks** to ensure your data and images are never lost.

## 1. Prerequisites
- A GitHub repository with your code.
- A [Render.com](https://render.com) account.

## 2. Automatic Deployment (Blueprints)
1. In your Render Dashboard, click **New +** and select **Blueprint**.
2. Connect your GitHub repository.
3. Render will automatically detect the `render.yaml` file.
4. Click **Apply**.
5. Render will create:
   - Your Web Service.
   - Two 1GB Persistent Disks (one for the Database, one for Uploads).

## 3. Manual Deployment (Alternative)
If you prefer not to use Blueprints, follow these steps:

### A. Create a Web Service
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### B. Add Environment Variables
Add these in the **Environment** tab:
- `NODE_ENV`: `production`
- `NEXT_PUBLIC_BASE_URL`: Your actual URL (e.g., `https://tiny-nest.onrender.com`)

### C. Add Persistent Disks
Add these in the **Disks** tab:
1. **Name**: `tinynest-uploads`
   - **Mount Path**: `/opt/render/project/src/public/uploads`
   - **Size**: 1GB (default)
2. **Name**: `tinynest-db`
   - **Mount Path**: `/opt/render/project/src/storage/db`
   - **Size**: 1GB (default)

## 4. Important Notes
- **Cold Starts**: On the Free plan, Render spins down the server after inactivity. Initial loads may take ~50 seconds.
- **Image Persistence**: Thanks to the `tinynest-uploads` disk, your property images persist even after code updates or server restarts.
- **Data Persistence**: Your `db.json` is safely stored in the `tinynest-db` disk.

---
**Build Success Tips:**
- Ensure you have pushed all your local changes to GitHub.
- If the build fails on linting, you can use `BUILD_IGNORE_ESLINT: true` in your environment variables, although your code is currently clean.
