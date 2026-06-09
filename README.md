# Victor Tejada — Portfolio

Full-stack engineering portfolio built with **Go**, **React**, **TypeScript**, and **TanStack Start**.

## Architecture

```
portfolio-backend/     # Go REST API (Gorilla Mux + GORM + PostgreSQL)
portfolio-frontend/    # React SPA (TanStack Start + Tailwind CSS + shadcn/ui)
```

## Quick Start

### Backend
```bash
cd portfolio-backend
cp .env.example .env    # Configure DATABASE_URL, CLOUDINARY_URL, SMTP_*
go run main.go
```

### Frontend
```bash
cd portfolio-frontend
npm install
npm run dev            # Dev server with HMR at localhost:5173 (proxies /api to :8080)
npm run build          # Production build
npm test               # Run test suite
npm run lint           # ESLint
```

## Features

- **Server-side rendering** with TanStack Start for optimal SEO and LCP
- **Dual-language** (EN/ES) with persistent user preference
- **Interactive terminal** showcasing CLI-style portfolio navigation
- **3D skill tree** with N-ary hierarchy and proficiency visualization
- **Orbital skill wheel** with spring-animated nodes
- **Particle background** with tsParticles
- **GSAP scroll-triggered** section reveals
- **Dark/light/system** theme with shadcn/ui design system
- **Admin panel** for CRUD management of projects, posts, skills, authors
- **Contact form** with Zod validation and email notifications
- **Image upload** to Cloudinary with multipart form support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, TanStack Start, TanStack Query |
| Styling | Tailwind CSS v4, Framer Motion, GSAP |
| Backend | Go 1.23, Gorilla Mux, GORM |
| Database | PostgreSQL (Neon.tech) |
| Storage | Cloudinary |
| Email | SMTP (Gmail) |
| CI | GitHub Actions |

---

# Docker Compose + NGINX Proxy Manager + MongoDB Migration Plan

## Architecture

```
                         Internet
                            |
                     ┌──────┴──────┐
                     │   Domain    │
                     │ (port 80/443)│
                     └──────┬──────┘
                            │
                  ┌─────────┴─────────┐
                  │  NGINX Proxy Mgr  │  ← Manages SSL, reverse proxy
                  │   (jc21/nginx-)   │
                  └─────────┬─────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
        ┌─────┴─────┐ ┌────┴────┐ ┌──────┴─────┐
        │  Frontend │ │ Backend │ │  MongoDB   │
        │  (React)  │ │  (Go)   │ │            │
        │ :5173→:80 │ │ :8080   │ │ :27017     │
        └───────────┘ └─────────┘ └────────────┘
```

---

## Phase 1: Server Prep & Docker Setup

```bash
# Provision a VPS (min 2GB RAM, 2 CPU) — DigitalOcean, Hetzner, Linode, etc.
# Install Docker & Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Git & clone repo
git clone https://github.com/devpoint/New_Portfolio.git /opt/portfolio
cd /opt/portfolio

# Point your DNS:
#   victortejada.dev   → <SERVER_IP>
#   api.victortejada.dev → <SERVER_IP>
```

---

## Phase 2: MongoDB Migration (Backend Data Layer Rework)

Replace GORM/PostgreSQL with the MongoDB Go driver.

| PostgreSQL (Current) | MongoDB (Target) |
|---|---|
| `gorm.io/driver/postgres` | `go.mongodb.org/mongo-driver` |
| AutoMigrate | Manual collections + indexes |
| SQL JOINs | Embedded docs / references |
| `db.Where().Find()` | `collection.Find()` + BSON filters |

### Schema Mapping

| PostgreSQL Table | MongoDB Collection | Change |
|---|---|---|
| `authors` | `authors` | Keep flat |
| `posts` | `posts` | Embed `author` sub-doc, remove join |
| `projects` | `projects` | Embed `technologies` array, remove `project_skills` |
| `skills` | `skills` | `parentId` references, build tree in Go |
| `badges` | `badges` | Simple collection |
| `translations` | `translations` | `{ lang, key, value }` |

### Files to Rewrite

| File | Change |
|---|---|
| `internal/database/db.go` | MongoDB client init instead of GORM |
| `internal/models/*.go` | `bson` struct tags |
| `internal/handlers/*.go` | `database.DB.Find()` → MongoDB `collection.Find()` |
| `go.mod` | Remove GORM, add `go.mongodb.org/mongo-driver` |

### Example: Handler Rewrite

```go
// Before (GORM)
database.DB.Find(&skills)

// After (MongoDB)
cur, _ := collection.Find(ctx, bson.D{{}})
cur.All(ctx, &skills)
```

---

## Phase 3: Dockerize the Backend

**`portfolio-backend/Dockerfile`**:

```dockerfile
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
```

---

## Phase 4: Dockerize the Frontend

**`portfolio-frontend/Dockerfile`**:

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 5173
CMD ["node", "dist/server/server.js"]
```

---

## Phase 5: Docker Compose

**`docker-compose.yml`**:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: portfolio-mongo
    restart: unless-stopped
    volumes:
      - mongo_data:/data/db
      - mongo_config:/data/configdb
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASS}
      MONGO_INITDB_DATABASE: portfolio-db
    networks:
      - internal
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh --quiet
      interval: 30s
      retries: 3

  backend:
    build: ./portfolio-backend
    container_name: portfolio-backend
    restart: unless-stopped
    depends_on:
      mongodb:
        condition: service_healthy
    environment:
      PORT: "8080"
      DATABASE_URL: "mongodb://${MONGO_USER}:${MONGO_PASS}@mongodb:27017/portfolio-db?authSource=admin"
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
    networks:
      - internal
    expose:
      - "8080"

  frontend:
    build: ./portfolio-frontend
    container_name: portfolio-frontend
    restart: unless-stopped
    depends_on:
      - backend
    environment:
      VITE_API_URL: "http://backend:8080"
    networks:
      - internal
    expose:
      - "5173"

  nginx-proxy-manager:
    image: jc21/nginx-proxy-manager:latest
    container_name: nginx-pm
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "81:81"
    volumes:
      - npm_data:/data
      - npm_ssl:/etc/letsencrypt
    depends_on:
      - frontend
      - backend
    networks:
      - internal

networks:
  internal:
    driver: bridge

volumes:
  mongo_data:
  mongo_config:
  npm_data:
  npm_ssl:
```

---

## Phase 6: Environment Variables

**`.env.production`**:

```
MONGO_USER=portfolio_admin
MONGO_PASS=<generate-strong-password>
CLOUDINARY_CLOUD_NAME=devmisterypoint
CLOUDINARY_API_KEY=294266133221878
CLOUDINARY_API_SECRET=<your-secret>
SMTP_USER=info@victortejada.dev
SMTP_PASS=<smtp-password>
DOMAIN=victortejada.dev
```

---

## Phase 7: NGINX Proxy Manager Configuration

1. Open `http://<SERVER_IP>:81`
2. Default login: `admin@example.com` / `changeme` (change immediately)
3. Add Proxy Host:

   | Field | Frontend | API (optional) |
   |-------|----------|----------------|
   | Domain | `victortejada.dev` | `api.victortejada.dev` |
   | Scheme | `http` | `http` |
   | Forward IP | `frontend` | `backend` |
   | Port | `5173` | `8080` |
   | SSL | Let's Encrypt | Let's Encrypt |

4. (Optional) Lock `/Admin` behind Basic Auth or IP allowlist via Access Lists

---

## Phase 8: Deploy

```bash
# Build & start everything
docker compose up -d --build

# Verify
docker compose ps
docker compose logs backend
docker compose logs frontend

# Open NPM dashboard at http://<IP>:81
# Configure proxy hosts + SSL

# On subsequent updates:
git pull
docker compose up -d --build --no-deps backend frontend
```

---

## Phase 9: CI/CD (GitHub Actions)

**`.github/workflows/deploy.yml`**:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/portfolio
            git pull
            docker compose up -d --build --no-deps backend frontend
```

---

## Key Considerations

| Concern | Solution |
|---|---|
| **MongoDB auth** | Root user with database-scoped user, store in `.env` |
| **SSL renewal** | NGINX Proxy Manager handles auto-renewal via Let's Encrypt |
| **Backups** | Add `mongodump` cron job or `docker exec` to backup `mongo_data` volume |
| **Rolling updates** | `--no-deps` flag prevents restarting DB/NPM on code changes |
| **Secrets** | Never commit `.env`. Add to `.gitignore`. Use GH Secrets for CI |
| **Monitoring** | NPM dashboard shows proxy status; `docker compose logs -f` for real-time |

---

## Estimated Effort

| Phase | Time |
|---|---|
| MongoDB migration (rewrite handlers) | 3–5 days |
| Docker setup (Dockerfiles + compose) | Half day |
| NGINX Proxy Manager config | 1–2 hours |
| CI/CD + testing | 1 day |
