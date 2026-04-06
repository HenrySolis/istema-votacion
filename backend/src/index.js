import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.js';
import adminEncuestasRoutes from './routes/admin/encuestas.js';
import adminCandidatosRoutes from './routes/admin/candidatos.js';
import adminResultadosRoutes from './routes/admin/resultados.js';
import publicEncuestasRoutes from './routes/public/encuestas.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Orígenes permitidos: se puede ampliar con FRONTEND_URL o CORS_ORIGIN en el entorno
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'https://istema-votacion.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []),
]);

// Seguridad
app.use(helmet());
// Necesario para leer la IP real cuando hay proxy (nginx, Vercel, etc.)
app.set('trust proxy', 1);
app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (curl, Postman, SSR, etc.)
    if (!origin || ALLOWED_ORIGINS.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Archivos estáticos (imágenes de candidatos)
// Se sobreescribe Cross-Origin-Resource-Policy a "cross-origin" para que el frontend
// en Vercel pueda cargar las imágenes servidas desde este backend en Render.
// Helmet lo establece como "same-origin" por defecto, lo que causa ERR_BLOCKED_BY_RESPONSE.
app.use('/uploads', (_req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '..', 'uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminEncuestasRoutes);
app.use('/api/admin', adminCandidatosRoutes);
app.use('/api/admin', adminResultadosRoutes);
app.use('/api/public', publicEncuestasRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Manejo de rutas no encontradas
app.use((_req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    ok: false,
    message: err.message || 'Error interno del servidor'
  });
});

// En desarrollo local levanta el servidor; en Vercel se usa como serverless
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

export default app;
