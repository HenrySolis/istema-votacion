import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { pool } from '../../db.js';

const router = Router();

// GET /api/public/encuestas — listado público con candidatos y resultados
router.get('/encuestas', async (_req, res) => {
  try {
    const encuestasResult = await pool.query(
      `SELECT id, titulo, descripcion, slug, estado, fecha_inicio, fecha_fin
       FROM encuestas
       WHERE estado IN ('activa', 'cerrada')
       ORDER BY creado_en DESC`
    );

    const encuestas = await Promise.all(
      encuestasResult.rows.map(async (enc) => {
        const candidatosResult = await pool.query(
          `SELECT c.id, c.nombre, c.descripcion, c.foto_url,
                  COUNT(v.id)::INT AS votos
           FROM candidatos c
           LEFT JOIN votos v ON v.candidato_id = c.id AND v.encuesta_id = $1
           WHERE c.encuesta_id = $1 AND c.activo = TRUE
           GROUP BY c.id
           ORDER BY c.orden_visual ASC, c.id ASC`,
          [enc.id]
        );
        const totalVotos = candidatosResult.rows.reduce((s, c) => s + c.votos, 0);
        return { ...enc, candidatos: candidatosResult.rows, total_votos: totalVotos };
      })
    );

    res.json({ ok: true, encuestas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
});

// Rate limit: máximo 10 votos por IP en 15 minutos
const votarLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: 'Demasiadas solicitudes. Intenta más tarde.' }
});

// GET /api/public/encuestas/:slug
router.get('/encuestas/:slug', async (req, res) => {
  const slug = req.params.slug;

  try {
    const encuestaResult = await pool.query(
      `SELECT id, titulo, descripcion, slug, estado, fecha_inicio, fecha_fin
       FROM encuestas
       WHERE slug = $1`,
      [slug]
    );

    const encuesta = encuestaResult.rows[0];
    if (!encuesta) return res.status(404).json({ ok: false, message: 'Encuesta no encontrada' });

    // puede_votar = true si el admin marcó la encuesta como 'activa'.
    // Las fechas son opcionales/informativas; el estado es la fuente de verdad.
    const puedeVotar = encuesta.estado === 'activa';

    // Verificar si ya votó mediante token en header
    const tokenVotante = req.headers['x-voter-token'] || null;
    const ipVotante = req.ip || null;
    let yaVoto = false;

    // Verificar por token
    if (!yaVoto && tokenVotante && typeof tokenVotante === 'string' && tokenVotante.length <= 255) {
      const voto = await pool.query(
        'SELECT id FROM votos WHERE encuesta_id = $1 AND token_votante = $2',
        [encuesta.id, tokenVotante]
      );
      yaVoto = voto.rows.length > 0;
    }

    // Verificar por IP (protege contra incógnito)
    if (!yaVoto && ipVotante) {
      const votoPorIp = await pool.query(
        'SELECT id FROM votos WHERE encuesta_id = $1 AND ip = $2',
        [encuesta.id, ipVotante]
      );
      yaVoto = votoPorIp.rows.length > 0;
    }

    const candidatosResult = await pool.query(
      `SELECT c.id, c.nombre, c.descripcion, c.foto_url,
              COUNT(v.id)::INT AS votos
       FROM candidatos c
       LEFT JOIN votos v ON v.candidato_id = c.id AND v.encuesta_id = $1
       WHERE c.encuesta_id = $1 AND c.activo = TRUE
       GROUP BY c.id
       ORDER BY c.orden_visual ASC, c.id ASC`,
      [encuesta.id]
    );
    const totalVotos = candidatosResult.rows.reduce((s, c) => s + c.votos, 0);

    res.json({
      ok: true,
      id: encuesta.id,
      titulo: encuesta.titulo,
      descripcion: encuesta.descripcion,
      slug: encuesta.slug,
      estado: encuesta.estado,
      fecha_inicio: encuesta.fecha_inicio,
      fecha_fin: encuesta.fecha_fin,
      puede_votar: puedeVotar,
      ya_voto: yaVoto,
      total_votos: totalVotos,
      candidatos: candidatosResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
});

// POST /api/public/encuestas/:slug/votar
router.post('/encuestas/:slug/votar', votarLimiter, async (req, res) => {
  const slug = req.params.slug;

  const schema = z.object({
    candidato_id: z.number().int().positive(),
    token_votante: z.string().min(10).max(255)
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: 'Datos inválidos', errors: parsed.error.flatten() });
  }

  const { candidato_id, token_votante } = parsed.data;
  const ip = req.ip;
  const userAgent = (req.headers['user-agent'] || '').slice(0, 500);

  try {
    const encuestaResult = await pool.query(
      'SELECT id, estado, fecha_inicio, fecha_fin FROM encuestas WHERE slug = $1',
      [slug]
    );

    const encuesta = encuestaResult.rows[0];
    if (!encuesta) return res.status(404).json({ ok: false, message: 'Encuesta no encontrada' });

    if (encuesta.estado !== 'activa') {
      return res.status(403).json({ ok: false, message: 'Esta encuesta no está activa' });
    }

    // Bloquear por IP — previene votos desde incógnito / nueva sesión
    const votoPorIp = await pool.query(
      'SELECT id FROM votos WHERE encuesta_id = $1 AND ip = $2',
      [encuesta.id, ip]
    );
    if (votoPorIp.rows.length > 0) {
      return res.status(409).json({ ok: false, message: 'Ya se registró un voto desde esta dirección de red. Solo se permite un voto por dispositivo.' });
    }

    // Validar que el candidato pertenece a la encuesta
    const candidatoResult = await pool.query(
      'SELECT id FROM candidatos WHERE id = $1 AND encuesta_id = $2 AND activo = TRUE',
      [candidato_id, encuesta.id]
    );
    if (!candidatoResult.rows[0]) {
      return res.status(400).json({ ok: false, message: 'Candidato inválido' });
    }

    // Registrar sesión de votante
    await pool.query(
      `INSERT INTO votantes_sesion (encuesta_id, token_votante, ip, user_agent)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (encuesta_id, token_votante) DO NOTHING`,
      [encuesta.id, token_votante, ip, userAgent]
    );

    // Registrar voto — la restricción UNIQUE (encuesta_id, token_votante) impide doble voto
    await pool.query(
      `INSERT INTO votos (encuesta_id, candidato_id, token_votante, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [encuesta.id, candidato_id, token_votante, ip, userAgent]
    );

    // Devolver resultados actualizados para mostrarlos al votante
    const resultadosResult = await pool.query(
      `SELECT c.id, c.nombre, c.descripcion, c.foto_url,
              COUNT(v.id)::INT AS votos
       FROM candidatos c
       LEFT JOIN votos v ON v.candidato_id = c.id AND v.encuesta_id = $1
       WHERE c.encuesta_id = $1 AND c.activo = TRUE
       GROUP BY c.id
       ORDER BY c.orden_visual ASC, c.id ASC`,
      [encuesta.id]
    );
    const totalVotos = resultadosResult.rows.reduce((s, c) => s + c.votos, 0);

    res.json({
      ok: true,
      message: 'Tu voto fue registrado correctamente',
      resultados: resultadosResult.rows,
      total_votos: totalVotos,
      candidato_id_votado: candidato_id,
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ ok: false, message: 'Ya registraste un voto en esta encuesta' });
    }
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
});

// GET /api/public/encuestas/:slug/estado
router.get('/encuestas/:slug/estado', async (req, res) => {
  const slug = req.params.slug;

  try {
    const result = await pool.query(
      'SELECT estado, fecha_inicio, fecha_fin FROM encuestas WHERE slug = $1',
      [slug]
    );

    const encuesta = result.rows[0];
    if (!encuesta) return res.status(404).json({ ok: false, message: 'Encuesta no encontrada' });

    const now = new Date();
    const activa =
      encuesta.estado === 'activa' &&
      (!encuesta.fecha_inicio || new Date(encuesta.fecha_inicio) <= now) &&
      (!encuesta.fecha_fin || new Date(encuesta.fecha_fin) >= now);

    res.json({ ok: true, estado: encuesta.estado, activa });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
});

export default router;
