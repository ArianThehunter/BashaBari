# Bariwala Hub — Local Development Setup (Windows Native)

This guide covers setting up the development environment natively on Windows.

## Prerequisites

### 1. Node.js (Already Installed ✅)

You have Node.js v22 and npm v10.

### 2. Git (Already Installed ✅)

You have Git v2.55.

### 3. PHP 8.3+

**Option A — Install via Windows PHP Binary (Recommended)**

1. Download the **VS16 x64 Thread Safe** ZIP from [windows.php.net/download](https://windows.php.net/download/).
2. Extract to `C:\php` (or your preferred location).
3. Add `C:\php` to your system `PATH`.
4. Copy `php.ini-development` to `php.ini`.
5. Edit `php.ini` and uncomment (remove the `;`) these extensions:
   ```ini
   extension=curl
   extension=fileinfo
   extension=mbstring
   extension=openssl
   extension=pdo_pgsql
   extension=pgsql
   extension=zip
   extension=gd
   extension=intl
   extension=bcmath
   extension=redis     ; requires pecl redis.dll — see step 6
   extension=sodium
   ```
6. For the Redis extension:
   - Download from [PECL windows downloads](https://pecl.php.net/package/redis) or [GitHub releases](https://github.com/phpredis/phpredis/releases).
   - Place `php_redis.dll` in `C:\php\ext\`.
7. Verify: `php -v` should show PHP 8.3.x.

**Option B — Install via Laragon**

[Laragon](https://laragon.org/) is an all-in-one Windows development environment that bundles PHP, MySQL/PostgreSQL, Redis, and Nginx. It's the simplest option if you want everything pre-configured.

1. Download and install Laragon Full.
2. Laragon includes PHP, Composer, PostgreSQL support, Redis, and more.
3. Add Laragon's bin directories to PATH.

**Option C — Install via Scoop**

```powershell
scoop install php
scoop install composer
```

### 4. Composer

1. Download and run the [Composer-Setup.exe](https://getcomposer.org/download/).
2. It will detect your PHP installation automatically.
3. Verify: `composer --version`

### 5. PostgreSQL 16+

1. Download the installer from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/).
2. Run the EDB installer.
3. During installation:
   - Set a password for the `postgres` superuser (remember this).
   - Default port: `5432`.
   - Include pgAdmin 4 (optional but helpful).
4. Add `C:\Program Files\PostgreSQL\16\bin` to your system `PATH`.
5. Verify: `psql --version`

**Create the development database:**

```powershell
psql -U postgres
```

```sql
CREATE DATABASE bariwala_hub;
CREATE USER bariwala_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE bariwala_hub TO bariwala_user;
ALTER DATABASE bariwala_hub OWNER TO bariwala_user;
\q
```

### 6. Redis 7+

**Option A — Memurai (Recommended for Windows)**

Redis doesn't officially support Windows. [Memurai](https://www.memurai.com/) is a Redis-compatible server for Windows.

1. Download from [memurai.com](https://www.memurai.com/get-memurai).
2. Install (the free Developer Edition is sufficient for development).
3. It runs as a Windows service automatically.
4. Verify: `redis-cli ping` → `PONG`

**Option B — Redis via WSL2**

If you have WSL2 installed:

```bash
sudo apt update
sudo apt install redis-server
sudo service redis-server start
redis-cli ping
```

**Option C — Redis via Docker (just Redis container)**

If you have Docker Desktop:

```powershell
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

---

## Project Setup

### Backend (Laravel)

```powershell
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env` with your local PostgreSQL credentials:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=bariwala_hub
DB_USERNAME=bariwala_user
DB_PASSWORD=your_secure_password

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

Run migrations:

```powershell
php artisan migrate
php artisan db:seed   # when seeders are available
```

Start the development server:

```powershell
php artisan serve
# API available at http://localhost:8000
```

Start the queue worker (separate terminal):

```powershell
php artisan queue:work
```

### Frontend (Next.js)

```powershell
cd frontend
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the development server:

```powershell
npm run dev
# Available at http://localhost:3000
```

### Mail Testing (Mailpit)

For local email testing, use Mailpit:

**Via Docker:**
```powershell
docker run -d --name mailpit -p 8025:8025 -p 1025:1025 axllent/mailpit
```

**Or download the binary** from [github.com/axllent/mailpit/releases](https://github.com/axllent/mailpit/releases).

Configure Laravel `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

Mailpit web UI: `http://localhost:8025`

---

## Verification Checklist

After setup, verify each service:

| Service | Command | Expected |
|---------|---------|----------|
| PHP | `php -v` | 8.3.x |
| Composer | `composer --version` | 2.x |
| PostgreSQL | `psql --version` | 16.x |
| Redis | `redis-cli ping` | PONG |
| Laravel | `php artisan --version` | 11.x |
| Next.js | `cd frontend && npm run build` | Builds successfully |

## Common Issues

### PowerShell Execution Policy

If npm/npx commands fail with "running scripts is disabled":

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### PHP extensions missing

If `composer install` fails with extension errors, edit `php.ini` and uncomment the required extension. Restart any running PHP processes.

### PostgreSQL connection refused

Ensure the PostgreSQL service is running:

```powershell
Get-Service -Name "postgresql*"
# Or start via Services.msc
```
