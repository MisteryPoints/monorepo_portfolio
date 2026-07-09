# Portfolio Deployment

## Prerequisites

- Docker + Docker Compose on the server
- nginx running as a container or on the host (ports 80/443)
- Shared Docker network: `docker network create nginx_net`
- Domain `api.yourdomain.com` pointed at the server IP

## Setup

```bash
# 1. Copy and fill in production secrets
cp deploy/.env.example deploy/.env
# edit deploy/.env with real credentials

# 2. Create the shared nginx network (one-time)
docker network create nginx_net

# 3. Copy nginx config to your nginx sites dir
#    (adjust paths to match your nginx setup)
cp deploy/nginx/portfolio.conf /etc/nginx/sites-available/api.yourdomain.com
ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 4. Get SSL cert
certbot --nginx -d api.yourdomain.com

# 5. Start the stack
DB_PASSWORD=$(grep -oP '(?<=portfolio_user:)[^@]+' deploy/.env | head -1) \
  docker compose up -d

# 6. Verify
curl https://api.yourdomain.com/api/get-projects
```

## Adding another project to the same server

```bash
# 1. Create a new directory and docker-compose.yml
# 2. Use a different network name (e.g. client1_net)
# 3. Connect it to the shared nginx_net
# 4. Add a new nginx site config with the new domain
# 5. certbot for the new domain
```

## Useful commands

```bash
# View logs
docker compose logs -f portfolio-api

# Rebuild after code changes
docker compose build portfolio-api
docker compose up -d portfolio-api

# Backup database
docker exec portfolio-db pg_dump -U portfolio_user portfolio > backup.sql

# Restore database
cat backup.sql | docker exec -i portfolio-db psql -U portfolio_user portfolio
```
