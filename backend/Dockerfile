# ---- Production Dockerfile for Laravel 11 Backend ----
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
    && docker-php-ext-install pgsql pdo pdo_pgsql pdo_sqlite pdo_mysql mbstring zip bcmath opcache

# Configure production OPcache & memory settings
RUN { \
    echo 'opcache.enable=1'; \
    echo 'opcache.enable_cli=1'; \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.max_accelerated_files=10000'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.revalidate_freq=0'; \
    echo 'memory_limit=256M'; \
    echo 'upload_max_filesize=20M'; \
    echo 'post_max_size=25M'; \
} > /usr/local/etc/php/conf.d/docker-php-ext-production.ini

# Install Composer globally
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy application source
COPY . .

# Install PHP dependencies with platform fallback & optimize autoloader
RUN composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-reqs

# Create SQLite database fallback if needed & set permissions
RUN touch /app/database/database.sqlite && chmod -R 777 /app/storage /app/bootstrap/cache /app/database

# Expose port
EXPOSE 8000

# Start command
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
