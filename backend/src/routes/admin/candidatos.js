import { Router } from 'express';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../../db.js';
import { requireAuth } from '../../middleware/auth.js';
import { uploadCandidato } from '../../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
router.use(requireAuth);

// POST /api/admin/encuestas/:id/candidatos
router.post('/encuestas/:id/candidatos', (req, res) => {
  const encuestaId = parseInt(req.params.id, 10);
  if (isNaN(encuestaId)) return res.status(400).json({ ok: false, message: 'ID inválido' });

  uploadCandidato(req, res, async (err) => {
    if (err) return res.status(400).json({ ok: false, message: err.message });

    const schema = z.object({
      nombre: z.string().min(1).max(150),
      descripcion: z.string().optional().nullable(),
      orden_visual: z.coerce.number().int().min(0).optional()
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ ok: false, message: 'Datos inválidos', errors: parsed.error.flatten() });
    }

    const { nombre, descripcion, orden_visual } = parsed.data;
    const foto_url = req.file ? `/uploads/candidatos/${req.file.filename}` : null;

    try {
      // Verificar que la encuesta pertenece al admin
      const encuesta = await pool.query(
        'SELECT id FROM encuestas WHERE id = $1 AND creada_por = $2',
        [encuestaId, req.admin.id]
      );
      if (!encuesta.rows[0]) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(404).json({ ok: false, message: 'Encuesta no encontrada' });
      }

      const result = await pool.query(
        `INSERT INTO candidatos (encuesta_id, nombre, descripcion, foto_url, orden_visual)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [encuestaId, nombre, descripcion || null, foto_url, orden_visual ?? 0]
      );

      res.status(201).json({ ok: true, candidato: result.rows[0] });
    } catch (dbErr) {
      if (req.file) fs.unlink(req.file.path, () => {});
      console.error(dbErr);
      res.status(500).json({ ok: false, message: 'Error del servidor' });
    }
  });
});

// PUT /api/admin/candidatos/:id
router.put('/candidatos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ ok: false, message: 'ID inválido' });

  uploadCandidato(req, res, async (err) => {
    if (err) return res.status(400).json({ ok: false, message: err.message });

    const schema = z.object({
      nombre: z.string().min(1).max(150),
      descripcion: z.string().optional().nullable(),
      orden_visual: z.coerce.number().int().min(0).optional(),
      activo: z.string().optional()
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ ok: false, message: 'Datos inválidos', errors: parsed.error.flatten() });
    }

    const { nombre, descripcion, orden_visual, activo } = parsed.data;

    try {
      const existing = await pool.query(
        `SELECT c.id, c.foto_url FROM candidatos c
         JOIN encuestas e ON e.id = c.encuesta_id
         WHERE c.id = $1 AND e.creada_por = $2`,
        [id, req.admin.id]
      );
      if (!existing.rows[0]) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(404).json({ ok: false, message: 'Candidato no encontrado' });
      }

      const foto_url = req.file
        ? `/uploads/candidatos/${req.file.filename}`
        : existing.rows[0].foto_url;

      const activoBool = activo === 'false' ? false : true;

      const result = await pool.query(
        `UPDATE candidatos
         SET nombre = $1, descripcion = $2, foto_url = $3, orden_visual = $4, activo = $5, actualizado_en = NOW()
         WHERE id = $6
         RETURNING *`,
        [nombre, descripcion || null, foto_url, orden_visual ?? 0, activoBool, id]
      );

      // Eliminar foto antigua si fue reemplazada
      if (req.file && existing.rows[0].foto_url) {
        const oldPath = path.join(__dirname, '..', '..', '..', existing.rows[0].foto_url);
        fs.unlink(oldPath, () => {});
      }

      res.json({ ok: true, candidato: result.rows[0] });
    } catch (dbErr) {
      if (req.file) fs.unlink(req.file.path, () => {});
      console.error(dbErr);
      res.status(500).json({ ok: false, message: 'Error del servidor' });
    }
  });
});

// DELETE /api/admin/candidatos/:id
router.delete('/candidatos/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ ok: false, message: 'ID inválido' });

  try {
    const existing = await pool.query(
      `SELECT c.id, c.foto_url FROM candidatos c
       JOIN encuestas e ON e.id = c.encuesta_id
       WHERE c.id = $1 AND e.creada_por = $2`,
      [id, req.admin.id]
    );
    if (!existing.rows[0]) return res.status(404).json({ ok: false, message: 'Candidato no encontrado' });

    await pool.query('DELETE FROM candidatos WHERE id = $1', [id]);

    if (existing.rows[0].foto_url) {
      const filePath = path.join(__dirname, '..', '..', '..', existing.rows[0].foto_url);
      fs.unlink(filePath, () => {});
    }

    res.json({ ok: true, message: 'Candidato eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
});

export default router;
