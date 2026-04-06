import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../../db.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const encuestaSchema = z.object({
  titulo: z.string().min(1).max(200),
  descripcion: z.string().optional().nullable(),
  slug: z.string().min(1).max(150).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  estado: z.enum(['borrador', 'activa', 'cerrada']).optional(),
  fecha_inicio: z.string().datetime().optional().nullable(),
  fecha_fin: z.string().datetime().optional().nullable()
});

// GET /api/admin/encuestas
router.get('/encuestas', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.titulo, e.slug, e.estado, e.fecha_inicio, e.fecha_fin, e.creado_en,
              COUNT(DISTINCT v.id)::INT AS total_votos
       FROM encuestas e
       LEFT JOIN votos v ON v.encuesta_id = e.id
       WHERE e.creada_por = $1
       GROUP BY e.id
       ORDER BY e.creado_en DESC`,
      [req.admin.id]
    );
    res.json({ ok: true, encuestas: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
});

// POST /api/admin/encuestas
router.post('/encuestas', async (req, res) => {
  const parsed = encuestaSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: 'Datos inválidos', errors: parsed.error.flatten() });
  }

  const { titulo, descripcion, slug, estado, fecha_inicio, fecha_fin } = parsed.data;

  try {
    const result = await pool.query(
      `INSERT INTO encuestas (titulo, descripcion, slug, estado, fecha_inicio, fecha_fin, creada_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [titulo, descripcion || null, slug, estado || 'borrador', fecha_inicio || null, fecha_fin || null, req.admin.id]
    );
    res.status(201).json({ ok: true, encuesta: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ ok: false, message: 'El slug ya está en uso' });
    }
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
});

// GET /api/admin/encuestas/:id
router.get('/encuestas/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ ok: false, message: 'ID inválido' });

  try {
    const encuestaResult = await pool.query(
      'SELECT * FROM encuestas WHERE id = $1 AND creada_por = $2',
      [id, req.admin.id]
    );

    if (!encuestaResult.rows[0]) {
      return res.status(404).json({ ok: false, message: 'Encuesta no encontrada' });
    }

    const candidatosResult = await pool.query(
      'SELECT * FROM candidatos WHERE encuesta_id = $1 ORDER BY orden_visual ASC, id ASC',
      [id]
    );

    res.json({ ok: true, encuesta: encuestaResult.rows[0], candidatos: candidatosResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
});

// PUT /api/admin/encuestas/:id
router.put('/encuestas/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ ok: false, message: 'ID inválido' });

  const parsed = encuestaSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: 'Datos inválidos', errors: parsed.error.flatten() });
  }

  const { titulo, descripcion, slug, estado, fecha_inicio, fecha_fin } = parsed.data;

  try {
    const own = await pool.query(
      'SELECT id FROM encuestas WHERE id = $1 AND creada_por = $2',
      [id, req.admin.id]
    );
    if (!own.rows[0]) return res.status(404).json({ ok: false, message: 'Encuesta no encontrada' });

    const result = await pool.query(
      `UPDATE encuestas
       SET titulo = $1, descripcion = $2, slug = $3, estado = $4,
           fecha_inicio = $5, fecha_fin = $6, actualizado_en = NOW()
       WHERE id = $7 AND creada_por = $8
       RETURNING *`,
      [titulo, descripcion || null, slug, estado || 'borrador', fecha_inicio || null, fecha_fin || null, id, req.admin.id]
    );

    res.json({ ok: true, encuesta: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ ok: false, message: 'El slug ya está en uso' });
    }
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
});

// DELETE /api/admin/encuestas/:id
router.delete('/encuestas/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ ok: false, message: 'ID inválido' });

  try {
    const result = await pool.query(
      'DELETE FROM encuestas WHERE id = $1 AND creada_por = $2 RETURNING id',
      [id, req.admin.id]
    );

    if (!result.rows[0]) return res.status(404).json({ ok: false, message: 'Encuesta no encontrada' });

    res.json({ ok: true, message: 'Encuesta eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
});

// PATCH /api/admin/encuestas/:id/estado
router.patch('/encuestas/:id/estado', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ ok: false, message: 'ID inválido' });

  const schema = z.object({ estado: z.enum(['borrador', 'activa', 'cerrada']) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: 'Estado inválido' });
  }

  try {
    const result = await pool.query(
      'UPDATE encuestas SET estado = $1, actualizado_en = NOW() WHERE id = $2 AND creada_por = $3 RETURNING *',
      [parsed.data.estado, id, req.admin.id]
    );

    if (!result.rows[0]) return res.status(404).json({ ok: false, message: 'Encuesta no encontrada' });

    res.json({ ok: true, encuesta: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
});

export default router;
