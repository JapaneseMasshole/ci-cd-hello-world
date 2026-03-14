# ci-cd-hello-world

Address Book BFF with CI/CD - React frontend, FastAPI backend, SQLite, deployed via GitHub Actions to ConoHa VPS.

## Architecture

- **Frontend**: React (Vite) + TypeScript, served by nginx
- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Auth**: JWT (register, login)
- **Deploy**: Docker Compose, GitHub Actions → GHCR → VPS

## Local development

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for frontend dev without Docker)

### Run with Docker

```bash
docker compose up --build
```

- App: http://localhost
- API: http://localhost/api

### Run backend only (for frontend dev)

```bash
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
cd frontend && npm install && npm run dev
```

Frontend dev server proxies `/api` to `localhost:8000`.

## VPS setup (ConoHa)

### Initial setup

```bash
ssh -i ~/.ssh/key-2026-03-12-22-03.pem root@133.88.117.56
```

Update system and install Docker:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install docker.io docker-compose -y
```

**ConoHa security group**: In the ConoHa control panel, add the "IPv4v6-Web" rule to your server's security group so HTTP (port 80) and HTTPS (port 443) traffic can reach the VPS. Without this, the site will be unreachable even if Docker is running.

### First-time deploy (manual)

1. Create app directory:

   ```bash
   sudo mkdir -p /opt/addressbook
   ```

2. Copy `docker-compose.deploy.yml` to `/opt/addressbook/`.

3. Set environment variables and run:

   ```bash
   cd /opt/addressbook
   export BACKEND_IMAGE=ghcr.io/japanesemasshole/ci-cd-hello-world/backend:latest
   export FRONTEND_IMAGE=ghcr.io/japanesemasshole/ci-cd-hello-world/frontend:latest
   export JWT_SECRET=your-secure-random-secret

   # If using private GHCR packages, login first:
   echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u JapaneseMasshole --password-stdin

   docker-compose -f docker-compose.deploy.yml pull
   docker-compose -f docker-compose.deploy.yml up -d
   ```

4. App: http://133.88.117.56

## GitHub Actions CI/CD

### Required secrets
#### Important
In GitHub repo **Settings → Secrets and variables → Actions**:

| Secret       | Description                                      |
| ------------ | ------------------------------------------------ |
| `VPS_HOST`   | VPS IP (e.g. `133.88.117.56`)                    |
| `VPS_USER`   | SSH user (`root` or `jimmy`)                     |
| `VPS_SSH_KEY`| Contents of your `.pem` SSH private key         |
| `JWT_SECRET` | Secret for JWT signing (use a strong random value) |
| `GHCR_TOKEN` | GitHub PAT with `read:packages` (for private packages) |

### Workflow

- **Trigger**: Push to `main` or `master`
- **Build**: Builds backend and frontend images, pushes to GHCR
- **Deploy**: SSHs to VPS, pulls images, runs `docker compose up -d`

### GHCR packages

- Images: `ghcr.io/<owner>/<repo>/backend:latest`, `ghcr.io/<owner>/<repo>/frontend:latest`
- For **private** repos: create a PAT with `read:packages`, add as `GHCR_TOKEN`
- For **public** repos: packages may be public; if not, add `GHCR_TOKEN` as above

## Rollback (when a new release goes wrong in Production)

If a deployment to the VPS causes issues, use one of these approaches:

### Option 1: Git revert + redeploy (recommended)

Revert the bad commit and let CI/CD redeploy the previous version:

```bash
# Find the commit to revert (e.g. the last one)
git log --oneline -5

# Revert the problematic commit
git revert <commit-hash> --no-edit
git push origin main
```

GitHub Actions will build and deploy the reverted code automatically.

### Option 2: Manual rollback on VPS

If you need an immediate rollback before reverting in git:

1. SSH into the VPS:

   ```bash
   ssh -i ~/.ssh/key-2026-03-12-22-03.pem root@133.88.117.56
   ```

2. Stop the current containers:

   ```bash
   cd /opt/addressbook
   docker compose -f docker-compose.deploy.yml down
   ```

3. Deploy a known-good image tag (if you use version tags, e.g. `main-abc1234`):

   ```bash
   export BACKEND_IMAGE=ghcr.io/japanesemasshole/ci-cd-hello-world/backend:<previous-tag>
   export FRONTEND_IMAGE=ghcr.io/japanesemasshole/ci-cd-hello-world/frontend:<previous-tag>
   export JWT_SECRET="your-secret"
   docker compose -f docker-compose.deploy.yml pull
   docker compose -f docker-compose.deploy.yml up -d
   ```

   **Note**: With the current `latest`-only setup, you must use Option 1 (git revert) unless you have previously tagged images. To enable tag-based rollback, add version tags (e.g. git SHA) to your workflow.

## SSH access

```bash
ssh -i ~/.ssh/key-2026-03-12-22-03.pem root@133.88.117.56
```

or

```bash
ssh -i ~/.ssh/key-2026-03-12-22-03.pem jimmy@133.88.117.56
```
