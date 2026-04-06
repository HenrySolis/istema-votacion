import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollService } from '../../services/pollService.js';

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function BottomGradient() {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
}

const INPUT_SHADOW = '0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)';

function Field({ children, className = '' }) {
  return <div className={`flex w-full flex-col space-y-1.5 ${className}`}>{children}</div>;
}

function FieldLabel({ children, htmlFor }) {
  return <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">{children}</label>;
}

function FieldInput({ className = '', ...props }) {
  return (
    <input
      className={`h-10 w-full rounded-xl border-none bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-indigo-400/40 ${className}`}
      style={{ boxShadow: INPUT_SHADOW }}
      {...props}
    />
  );
}

function FieldSelect({ children, ...props }) {
  return (
    <select
      className="h-10 w-full rounded-xl border-none bg-gray-50 px-3 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-indigo-400/40"
      style={{ boxShadow: INPUT_SHADOW }}
      {...props}
    >
      {children}
    </select>
  );
}

const DURATION_OPTS = [
  { label: '— Sin l&#xed;mite de tiempo —', value: '' },
  { label: '5 minutos',  value: 5 },
  { label: '10 minutos', value: 10 },
  { label: '15 minutos', value: 15 },
  { label: '20 minutos', value: 20 },
  { label: '30 minutos', value: 30 },
  { label: '45 minutos', value: 45 },
  { label: '1 hora',     value: 60 },
  { label: '1.5 horas',  value: 90 },
  { label: '2 horas',    value: 120 },
  { label: '3 horas',    value: 180 },
  { label: '6 horas',    value: 360 },
  { label: '12 horas',   value: 720 },
  { label: '1 d&#xed;a',       value: 1440 },
  { label: '3 d&#xed;as',      value: 4320 },
  { label: '7 d&#xed;as',      value: 10080 },
];

function durLabel(val) {
  if (!val) return null;
  const min = Number(val);
  if (min < 60) return `${min} minuto${min !== 1 ? 's' : ''}`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h} hora${h !== 1 ? 's' : ''}`;
}

export default function PollCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titulo:      '',
    descripcion: '',
    slug:        '',
    estado:      'borrador',
    fecha_inicio: '',
    duracion:    '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  function handleTituloChange(e) {
    const titulo = e.target.value;
    setForm(f => ({ ...f, titulo, slug: slugify(titulo) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fechaInicio = form.fecha_inicio ? new Date(form.fecha_inicio) : null;
      let fechaFin = null;
      if (fechaInicio && form.duracion) {
        fechaFin = new Date(fechaInicio.getTime() + Number(form.duracion) * 60 * 1000);
      }
      const payload = {
        titulo:      form.titulo,
        descripcion: form.descripcion,
        slug:        form.slug,
        estado:      form.estado,
        fecha_inicio: fechaInicio ? fechaInicio.toISOString() : null,
        fecha_fin:    fechaFin    ? fechaFin.toISOString()    : null,
      };
      const data = await pollService.create(payload);
      navigate(`/admin/encuestas/${data.encuesta.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la encuesta');
    } finally {
      setLoading(false);
    }
  }

  const endPreview = form.fecha_inicio && form.duracion
    ? new Date(new Date(form.fecha_inicio).getTime() + Number(form.duracion) * 60000)
    : null;

  return (
    <div className="max-w-2xl animate-fade-in">

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva encuesta</h1>
          <p className="text-gray-400 text-sm mt-1">Completa los datos para crear una votaci&#xf3;n</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/encuestas')}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          &#x2190; Volver
        </button>
      </div>

      {/* Tarjeta principal */}
      <div className="w-full rounded-2xl bg-white p-8" style={{ boxShadow: INPUT_SHADOW }}>
        <h2 className="text-base font-bold text-gray-900">Detalles de la votaci&#xf3;n</h2>
        <p className="mt-1 mb-7 text-sm text-gray-400">
          Define el t&#xed;tulo, duraci&#xf3;n y estado inicial
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* T&#xed;tulo */}
          <Field>
            <FieldLabel htmlFor="titulo">T&#xed;tulo *</FieldLabel>
            <FieldInput
              id="titulo"
              value={form.titulo}
              onChange={handleTituloChange}
              required
              maxLength={200}
              placeholder="Ej: Elecci&#xf3;n de representantes 2026"
            />
          </Field>

          {/* Descripci&#xf3;n */}
          <Field>
            <FieldLabel htmlFor="descripcion">Descripci&#xf3;n</FieldLabel>
            <textarea
              id="descripcion"
              rows={3}
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Descripci&#xf3;n opcional de la encuesta (m&#xe1;x. 500 caracteres)"
              className="w-full rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-y outline-none transition focus:ring-2 focus:ring-indigo-400/40"
              style={{ boxShadow: INPUT_SHADOW }}
            />
          </Field>

          {/* Slug */}
          <Field>
            <FieldLabel htmlFor="slug">Slug (URL &#xfa;nica) *</FieldLabel>
            <FieldInput
              id="slug"
              value={form.slug}
              onChange={e => setForm({ ...form, slug: e.target.value })}
              required
              maxLength={150}
              pattern="[a-z0-9-]+"
              title="Solo letras min&#xfa;sculas, n&#xfa;meros y guiones"
              placeholder="eleccion-representantes-2026"
            />
            <p className="text-xs font-mono text-indigo-500 mt-0.5">
              /votar/{form.slug || 'tu-slug'}
            </p>
          </Field>

          {/* Estado */}
          <Field>
            <FieldLabel htmlFor="estado">Estado inicial</FieldLabel>
            <FieldSelect
              id="estado"
              value={form.estado}
              onChange={e => setForm({ ...form, estado: e.target.value })}
            >
              <option value="borrador">&#x1F4DD; Borrador</option>
              <option value="activa">&#x1F7E2; Activa</option>
              <option value="cerrada">&#x1F512; Cerrada</option>
            </FieldSelect>
          </Field>

          {/* Separador */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* Fecha inicio + Duraci&#xf3;n */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="fecha_inicio">Fecha de inicio</FieldLabel>
              <FieldInput
                id="fecha_inicio"
                type="datetime-local"
                value={form.fecha_inicio}
                onChange={e => setForm({ ...form, fecha_inicio: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="duracion">Duraci&#xf3;n</FieldLabel>
              <FieldSelect
                id="duracion"
                value={form.duracion}
                onChange={e => setForm({ ...form, duracion: e.target.value })}
              >
                {DURATION_OPTS.map(o => (
                  <option key={o.value} value={o.value} dangerouslySetInnerHTML={{ __html: o.label }} />
                ))}
              </FieldSelect>
            </Field>
          </div>

          {/* Preview de cierre + cron&#xf3;metro visual */}
          {endPreview && (
            <div
              className="flex items-start gap-3 rounded-2xl px-4 py-4 text-sm"
              style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)' }}
            >
              <span className="text-xl">&#x23F1;&#xFE0F;</span>
              <div>
                <p className="font-semibold text-indigo-700">
                  Duraci&#xf3;n: {durLabel(form.duracion)}
                </p>
                <p className="text-gray-500 mt-0.5">
                  Cierra el{' '}
                  <strong className="text-gray-700">
                    {endPreview.toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}
                  </strong>
                </p>
                <p className="text-xs text-indigo-400 mt-1">
                  Un cron&#xf3;metro aparecer&#xe1; en la p&#xe1;gina de votaci&#xf3;n
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Bot&#xf3;n submit estilo Aceternity */}
          <button
            type="submit"
            disabled={loading}
            className="group/btn relative block h-11 w-full rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 font-semibold text-white text-sm transition-all hover:shadow-lg hover:from-indigo-500 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ boxShadow: '0px 1px 0px 0px rgba(255,255,255,0.25) inset, 0px -1px 0px 0px rgba(255,255,255,0.2) inset' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Creando encuesta...
              </span>
            ) : (
              'Crear encuesta &#x2192;'
            )}
            <BottomGradient />
          </button>

          <p className="text-center text-sm text-gray-400">
            &#xBF;Cambiaste de opini&#xf3;n?{' '}
            <button
              type="button"
              onClick={() => navigate('/admin/encuestas')}
              className="text-indigo-600 hover:underline font-medium"
            >
              Cancelar y volver
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}