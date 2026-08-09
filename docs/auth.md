# Bariwala Hub — Authentication

## Strategy: Laravel Sanctum (SPA Cookie-Based)

### Why Sanctum over JWT?

| Factor | Sanctum SPA | JWT |
|--------|-------------|-----|
| Token storage | Secure httpOnly cookie (managed by browser) | Developer must store token (localStorage/memory) |
| CSRF protection | Automatic | Manual |
| Session revocation | Instant (destroy session) | Requires blocklist or wait for expiry |
| Complexity | Low | Higher |
| Mobile app support | Separate token mode available | Native |
| Third-party API consumers | Not designed for this | Designed for this |

**Verdict:** We have a single SPA on the same domain. No mobile app in MVP. No third-party API consumers. Sanctum SPA mode is simpler and more secure for this use case.

## Authentication Flow

```
┌──────────────┐                         ┌──────────────────┐
│   Frontend   │                         │  Laravel API     │
│  (Next.js)   │                         │  (Sanctum)       │
└──────┬───────┘                         └────────┬─────────┘
       │                                          │
       │  1. GET /sanctum/csrf-cookie              │
       │ ────────────────────────────────────────► │
       │  ◄─── Set-Cookie: XSRF-TOKEN             │
       │                                          │
       │  2. POST /api/login                       │
       │     {email, password}                     │
       │     X-XSRF-TOKEN: <token>                │
       │ ────────────────────────────────────────► │
       │     Validate credentials                  │
       │     Create session                        │
       │  ◄─── Set-Cookie: session (httpOnly)      │
       │  ◄─── 200 { user }                       │
       │                                          │
       │  3. GET /api/v1/properties                │
       │     Cookie: session (auto)                │
       │     X-XSRF-TOKEN: <token>                │
       │ ────────────────────────────────────────► │
       │     Verify session + CSRF                 │
       │  ◄─── 200 { data }                       │
       │                                          │
       │  4. POST /api/logout                      │
       │ ────────────────────────────────────────► │
       │     Destroy session                       │
       │  ◄─── 204                                │
```

## Endpoints

| Method | URL | Purpose |
|--------|-----|---------|
| GET | `/sanctum/csrf-cookie` | Initialize CSRF token |
| POST | `/api/register` | User registration |
| POST | `/api/login` | User login |
| POST | `/api/logout` | User logout |
| POST | `/api/forgot-password` | Request password reset |
| POST | `/api/reset-password` | Reset password with token |
| POST | `/api/email/verification-notification` | Resend verification email |
| GET | `/api/verify-email/{id}/{hash}` | Verify email |
| GET | `/api/user` | Get authenticated user |

## Configuration

### Laravel (backend)

```php
// config/sanctum.php
'stateful' => explode(',', env(
    'SANCTUM_STATEFUL_DOMAINS',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000'
)),

// config/cors.php
'supports_credentials' => true,
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],

// config/session.php
'driver' => 'redis',
'domain' => env('SESSION_DOMAIN', 'localhost'),
'same_site' => 'lax',
'secure' => env('SESSION_SECURE_COOKIE', false), // true in production
```

### Frontend (Next.js)

```typescript
// lib/api.ts — Axios instance configured for Sanctum
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // CRITICAL: sends cookies
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// CSRF interceptor: read XSRF-TOKEN cookie, attach as header
api.interceptors.request.use((config) => {
  const token = getCookie('XSRF-TOKEN');
  if (token) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
  }
  return config;
});
```

## Security Measures

- **Password hashing:** bcrypt (Laravel default), minimum 8 characters.
- **Rate limiting:** 5 attempts per minute on login, 3 per minute on password reset.
- **Email verification:** Required before full access.
- **Session lifetime:** Configurable (default: 120 minutes, with remember-me option).
- **Cookie flags:** httpOnly, Secure (production), SameSite=Lax.
- **CSRF:** Double-submit cookie pattern (Sanctum default).

## Future Considerations

- **Social login:** Can be added via Laravel Socialite (Google, Facebook).
- **2FA:** Can be added via TOTP (Google Authenticator).
- **Mobile app auth:** Sanctum API tokens for native mobile apps.
