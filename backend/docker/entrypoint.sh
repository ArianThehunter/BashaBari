#!/bin/sh
set -e

# Cache configuration, routes and events at boot. Deliberately not committed to
# the image: the caches embed environment values, which differ per deploy.
if [ "${APP_ENV}" = "production" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan event:cache
fi

# Migrations are run by the platform's pre-deploy hook (see render.yaml) so that
# they execute once per release rather than once per container start. Set
# RUN_MIGRATIONS=true only for single-instance environments without such a hook.
if [ "${RUN_MIGRATIONS}" = "true" ]; then
    php artisan migrate --force
fi

exec "$@"
