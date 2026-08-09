# ---- Production Dockerfile for Laravel 11 Backend on Render ----
FROM php:8.4-cli-alpine

# Install system dependencies & PostgreSQL C client libraries
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    sqlite-dev \
    postgresql-dev \
    postgresql-client \
    libzip-dev \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install pgsql pdo pdo_pgsql pdo_sqlite pdo_mysql mbstring zip bcmath

# Install Composer globally
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy application source
COPY . .

# Install PHP dependencies with platform fallback
RUN composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-reqs

# Create SQLite database fallback if needed & set permissions
RUN touch /app/database/database.sqlite && chmod -R 777 /app/storage /app/bootstrap/cache /app/database

# Expose port
EXPOSE 8000

# Start command
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
