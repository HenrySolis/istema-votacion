import { Router } from 'express';
import { pool } from '../../db.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/admin/encuestas/:id/resultados
router.get('/encuestas/:id/resultados', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ ok: false, message: 'ID inválido' });

  try {
    const encuesta = await pool.query(
      'SELECT id, titulo, slug, estado FROM encuestas WHERE id = $1 AND creada_por = $2',
      [id, req.admin.id]
    );
    if (!encuesta.rows[0]) return res.status(404).json({ ok: false, message: 'Encuesta no encontrada' });

    const resultados = await pool.query(
      `SELECT c.id, c.nombre, c.foto_url, COUNT(v.id)::INT AS votos
       FROM candidatos c
       LEFT JOIN votos v ON v.candidato_id = c.id AND v.encuesta_id = $1
       WHERE c.encuesta_id = $1
       GROUP BY c.id
       ORDER BY votos DESC, c.orden_visual ASC`,
      [id]
    );

    const totalVotos = resultados.rows.reduce((acc, r) => acc + r.votos, 0);

    res.json({
      ok: true,
      encuesta: encuesta.rows[0],
      total_votos: totalVotos,
      resultados: resultados.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
});

// GET /api/admin/encuestas/:id/resumen
router.get('/encuestas/:id/resumen', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ ok: false, message: 'ID inválido' });

  try {
    const encuesta = await pool.query(
      'SELECT * FROM encuestas WHERE id = $1 AND creada_por = $2',
      [id, req.admin.id]
    );
    if (!encuesta.rows[0]) return res.status(404).json({ ok: false, message: 'Encuesta no encontrada' });

    const [votosResult, candidatosResult] = await Promise.all([
      pool.query('SELECT COUNT(*)::INT AS total FROM votos WHERE encuesta_id = $1', [id]),
      pool.query('SELECT COUNT(*)::INT AS total FROM candidatos WHERE encuesta_id = $1 AND activo = TRUE', [id])
    ]);

    res.json({
      ok: true,
      encuesta: encuesta.rows[0],
      total_votos: votosResult.rows[0].total,
      total_candidatos: candidatosResult.rows[0].total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
});

export default router;
