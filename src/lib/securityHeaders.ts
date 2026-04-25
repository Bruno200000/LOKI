/**
 * Configuration des headers de sécurité HTTP pour l'application
 */

export const securityHeaders = {
  // Protection contre les injections XSS
  'X-XSS-Protection': '1; mode=block',

  // Empêche le clickjacking
  'X-Frame-Options': 'DENY',

  // Empêche la détection du type de contenu
  'X-Content-Type-Options': 'nosniff',

  // Politique de référent sécurisée
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Protection CSRF
  'X-CSRF-Token': 'required',

  // Permissions Policy - désactiver les fonctionnalités sensibles
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'bluetooth=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'ambient-light-sensor=()'
  ].join(', '),

  // Content Security Policy (CSP) - protection contre les injections XSS
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.wave.com",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),

  // HSTS - Force HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Cache control pour les ressources sensibles
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

/**
 * Configuration des cookies sécurisés
 */
export const secureCookieConfig = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 heures
};

/**
 * Configuration CORS sécurisée
 */
export const corsConfig = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-domain.com', // Remplacer par le domaine réel
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Requested-With',
  ],
};
