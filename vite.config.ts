import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; media-src 'self' https: https://*.supabase.co https://www.youtube.com https://*.googlevideo.com; frame-src 'self' https://www.youtube.com https://youtube.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.wave.com https://www.youtube.com https://youtube.com https://s.ytimg.com https://www.gstatic.com; object-src 'none'; base-uri 'self'; form-action 'self';",
    },

    // Configuration HTTPS en développement (optionnel)
    // https: true, // Décommentez si vous voulez HTTPS en développement

    // Limiter l'accès aux fichiers sensibles
    fs: {
      strict: true,
    },
  },

  // Configuration de build pour la production
  build: {
    // Sécuriser les assets
    assetsDir: 'assets',
    sourcemap: false, // Désactiver les sourcemaps en production pour la sécurité

    // Optimisations de sécurité
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer les console.log en production
        drop_debugger: true,
      },
    },

    // Sécuriser les chunks
    rollupOptions: {
      output: {
        // Obscurcir les noms de fichiers pour la sécurité
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },

  // Configuration des define pour les variables d'environnement
  define: {
    // S'assurer que les variables sensibles ne sont pas exposées
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js'],
    exclude: ['lucide-react'],
  },
});
