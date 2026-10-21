import { Router } from 'express';
import { login } from '../controllers/auth.controller.js'; // O la ruta correcta hacia tu controlador

const router = Router();

router.post('/login', login);

export default router; // <-- Esto es clave para que server.ts no reciba 'undefined'