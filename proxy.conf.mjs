// Proxy de `ng serve` (landing y admin): reenvía /api al backend para que el
// navegador no dependa de CORS en desarrollo.
//
// Por defecto apunta a Railway. Para usar otro backend (p. ej. un túnel de
// ngrok mientras Railway no está disponible):
//
//   API_TARGET=https://xxxx.ngrok-free.app npx ng serve public-site
const target = process.env.API_TARGET ?? 'https://itinerantes-backend-production.up.railway.app';

export default {
  '/api': {
    target,
    secure: true,
    changeOrigin: true,
    // ngrok gratuito muestra una página de aviso a los navegadores sin esta cabecera.
    headers: { 'ngrok-skip-browser-warning': '1' },
  },
};
