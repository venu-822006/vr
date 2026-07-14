# VR Vegetables

A modern, responsive, and full-featured e-commerce platform built for a local vegetable delivery business.

## Architecture & Stack

The application is split into a **Frontend** (Next.js) and a **Backend** (Node.js/Express with BullMQ). It is optimized to be hosted on a **100% Zero-Cost Stack**:

- **Frontend:** [Vercel](https://vercel.com) (Next.js / React)
- **Backend (API & Worker):** [Render](https://render.com) (Node.js Web Service & Background Worker)
- **Database:** [Supabase](https://supabase.com) (PostgreSQL)
- **Cache/Queues:** [Upstash](https://upstash.com) (Serverless Redis)
- **Image Storage:** [Cloudflare R2](https://dash.cloudflare.com) (S3-Compatible Object Storage)

---

## Local Development

If you want to run the application locally with Docker, you can use the provided `docker-compose.yml` to spin up local instances of PostgreSQL, Redis, and MinIO (S3 clone).

### 1. Prerequisites
- [Docker & Docker Compose](https://www.docker.com/)
- [Node.js v20+](https://nodejs.org/)

### 2. Environment Setup
Copy the example environment files and fill them in:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

### 3. Start Local Services
Start the local database, cache, and object storage:
```bash
docker-compose up -d db redis minio minio-init
```
*(Wait a few seconds for MinIO to initialize the bucket).*

### 4. Start the Application
Install dependencies and run the development servers:

**Backend:**
```bash
cd backend
npm install
npm run start
```
*(The backend runs on `http://localhost:5000`)*

**Frontend:**
```bash
npm install
npm run dev
```
*(The frontend runs on `http://localhost:5173`)*

---

## Deployment

To deploy the application to the internet for free, see the `render.yaml` configuration and follow these steps:

1. Create a GitHub repository and push this code.
2. Provision a free PostgreSQL database on **Supabase** and a free Redis database on **Upstash**.
3. Create a free R2 bucket on **Cloudflare** for image uploads.
4. **Deploy Backend:** Go to **Render**, create a new Blueprint deployment, and connect your repository. Fill in the required environment variables when prompted.
5. **Deploy Frontend:** Go to **Vercel**, connect your repository, and add the `API_URL` environment variable pointing to your Render backend URL.
