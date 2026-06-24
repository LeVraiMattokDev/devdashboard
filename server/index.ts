import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import projectsRouter from './routes/projects.js';
import tasksRouter from './routes/tasks.js';
import miscRouter from './routes/misc.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT ?? '3001', 10);

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: isProd }));

// CORS — dev only (in prod, same origin)
if (!isProd) {
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
}

// Rate limiting on login
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use(express.json({ limit: '2mb' }));

// API routes
app.use('/api/auth',     authRouter);
app.use('/api/users',    usersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks',    tasksRouter);
app.use('/api',          miscRouter);

// Serve built frontend in production
if (isProd) {
  const distPath = join(__dirname, '../../dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(join(distPath, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`\n🟢 REBORNMC Dashboard`);
  console.log(`   Mode   : ${isProd ? 'production' : 'développement'}`);
  console.log(`   Serveur: http://localhost:${PORT}`);
  if (!isProd) console.log(`   Frontend: http://localhost:5173 (Vite)\n`);
});
