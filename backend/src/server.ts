import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';

// @ts-ignore
import authRoutes from './routes/auth.routes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    sistema: 'TiendaControl Colombia',
    zonaHoraria: 'America/Bogota',
    moneda: 'COP'
  });
});

// 2. MONTA LAS RUTAS AQUÍ PARA QUE EXPRESS LAS RECONOZCA
app.use('/api/auth', authRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[TiendaControl Backend] Servidor ejecutándose en el puerto ${PORT}`);
  });
}

export default app;