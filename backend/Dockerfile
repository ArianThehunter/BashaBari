# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# BashaBari API — production image
#
# Serves through nginx + PHP-FPM under supervisord. The previous image ran
# `php artisan serve`, which is the single-threaded built-in development server
# and handles one request at a time.
# ---------------------------------------------------------------------------

# ---- Stage 1: composer dependencies -------------------------------------
FROM composer:2 AS vendor

WORKDIR /app

# Install against the lockfile alone first so the layer caches across code changes.
COPY composer.json composer.lock ./

RUN composer install \
        --no-dev \
        --no-scripts \
        --no-autoloader \
        --prefer-dist \
        --no-interaction \
        --no-progress

COPY . .

RUN composer dump-autoload --no-dev --optimize --classmap-authoritative


# ---- Stage 2: runtime ----------------------------------------------------
FROM php:8.4-fpm-alpine AS runtime

RUN apk add --no-cache \
        nginx \
        supervisor \
        postgresql-client \
        libpq \
        icu-libs \
        oniguruma \
        libzip \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        postgresql-dev \
        icu-dev \
        oniguruma-dev \
        libzip-dev \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_pgsql \
        pgsql \
        bcmath \
        intl \
        opcache \
        zip \
    && apk del .build-deps

# Production PHP settings. validate_timestamps=0 is safe because the code is
# baked into the image and never changes at runtime.
RUN { \
        echo 'opcache.enable=1'; \
        echo 'opcache.enable_cli=0'; \
        echo 'opcache.memory_consumption=192'; \
        echo 'opcache.interned_strings_buffer=16'; \
        echo 'opcache.max_accelerated_files=20000'; \
        echo 'opcache.validate_timestamps=0'; \
        echo 'memory_limit=256M'; \
        echo 'upload_max_filesize=20M'; \
        echo 'post_max_size=25M'; \
        echo 'expose_php=Off'; \
        echo 'display_errors=Off'; \
        echo 'log_errors=On'; \
        echo 'error_log=/dev/stderr'; \
    } > /usr/local/etc/php/conf.d/zz-production.ini

WORKDIR /var/www/html

COPY --from=vendor --chown=www-data:www-data /app /var/www/html

COPY docker/nginx/site.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

# Only these two trees need to be writable — not the whole application, and
# never world-writable.
RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && mkdir -p /var/lib/nginx/tmp /var/log/nginx /run/nginx \
    && chown -R www-data:www-data /var/lib/nginx /var/log/nginx /run/nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD php -r "exit(@file_get_contents('http://127.0.0.1:8080/api/health') ? 0 : 1);"

ENTRYPOINT ["entrypoint"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
