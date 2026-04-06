import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: 'Datos inválidos' });
  }

  const { email, password } = parsed.data;

  try {
    const result = await pool.query(
      'SELECT id, nombre, email, password_hash, activo FROM admins WHERE email = $1',
      [email]
    );

    const admin = result.rows[0];

    if (!admin || !admin.activo) {
      return res.status(401).json({ ok: false, message: 'Credenciales incorrectas' });
    }

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ ok: false, message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, nombre: admin.nombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      ok: true,
      token,
      admin: { id: admin.id, nombre: admin.nombre, email: admin.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, email FROM admins WHERE id = $1 AND activo = TRUE',
      [req.admin.id]
    );

    const admin = result.rows[0];
    if (!admin) return res.status(404).json({ ok: false, message: 'Admin no encontrado' });

    res.json({ ok: true, admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
});

// POST /api/auth/logout
router.post('/logout', requireAuth, (_req, res) => {
  // JWT es stateless; el cliente borra el token localmente
  res.json({ ok: true, message: 'Sesión cerrada' });
});

export default router;
