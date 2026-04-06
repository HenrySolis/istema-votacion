import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pollService } from '../../services/pollService.js';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import QRCodeBox from '../../components/QRCodeBox.jsx';

/* --- Convierte texto a slug seguro para URL --- */
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function PollEditPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [encuesta, setEncuesta]         = useState(null);
  const [candidatos, setCandidatos]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState(null);
  const [form, setForm]                 = useState(null);
  const [newCandidato, setNewCandidato] = useState({ nombre: '', descripcion: '', foto: null });
  const [addingCandidato, setAddingCandidato] = useState(false);
  const [candidatoError, setCandidatoError]   = useState(null);

  useEffect(() => { load(); }, [id]);

  /* --- Carga datos de la encuesta y sus candidatos --- */
  async function load() {
    try {
      const data = await pollService.getById(id);
      setEncuesta(data.encuesta);
      setCandidatos(data.candidatos || []);
      const e = data.encuesta;
      setForm({
        titulo:       e.titulo,
        descripcion:  e.descripcion || '',
        slug:         e.slug,
        estado:       e.estado,
        fecha_inicio: e.fecha_inicio ? e.fecha_inicio.slice(0, 16) : '',
        fecha_fin:    e.fecha_fin    ? e.fecha_fin.slice(0, 16)    : '',
      });
    } catch {
      setError('No se pudo cargar la encuesta');
    } finally {
      setLoading(false);
    }
  }

  /* --- Guarda los cambios del formulario --- */
  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        fecha_inicio: form.fecha_inicio ? new Date(form.fecha_inicio).toISOString() : null,
        fecha_fin:    form.fecha_fin    ? new Date(form.fecha_fin).toISOString()    : null,
      };
      const data = await pollService.update(id, payload);
      setEncuesta(data.encuesta);
      alert('Cambios guardados correctamente');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  /* --- Cambia el estado de la encuesta rápidamente --- */
  async function handleChangeEstado(estado) {
    try {
      const data = await pollService.updateEstado(id, estado);
      setEncuesta(data.encuesta);
      setForm((f) => ({ ...f, estado }));
    } catch (err) {
      alert(err.response?.data?.message || 'Error al cambiar estado');
    }
  }

  /* --- Elimina un candidato --- */
  async function handleDeleteCandidato(cid) {
    if (!window.confirm('¿Eliminar este candidato?')) return;
    try {
      await pollService.deleteCandidato(cid);
      setCandidatos((prev) => prev.filter((c) => c.id !== cid));
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar candidato');
    }
  }

  /* --- Agrega un nuevo candidato con foto opcional --- */
  async function handleAddCandidato(e) {
    e.preventDefault();
    setAddingCandidato(true);
    setCandidatoError(null);
    try {
      const fd = new FormData();
      fd.append('nombre', newCandidato.nombre);
      if (newCandidato.descripcion) fd.append('descripcion', newCandidato.descripcion);
      if (newCandidato.foto) fd.append('foto', newCandidato.foto);
      const data = await pollService.createCandidato(id, fd);
      setCandidatos((prev) => [...prev, data.candidato]);
      setNewCandidato({ nombre: '', descripcion: '', foto: null });
      const fileInput = document.getElementById('candidato-foto-input');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setCandidatoError(err.response?.data?.message || 'Error al agregar candidato');
    } finally {
      setAddingCandidato(false);
    }
  }

  /* --- Estados de carga / error --- */
  if (loading) return (
    <div className="flex items-center justify-center h-64"><div className="spinner" /></div>
  );
  if (!form) return (
    <div className="max-w-2xl"><p className="error-text">{error || 'Error al cargar'}</p></div>
  );

  const publicUrl = `${window.location.origin}/votar/${encuesta.slug}`;

  return (
    <div className="max-w-5xl animate-fade-in">

      {/* ENCABEZADO */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar encuesta</h1>
          <p className="text-gray-400 text-sm mt-1">{encuesta.titulo}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin/encuestas')} className="btn btn-ghost text-sm">
            ← Volver
          </button>
          <button
            onClick={() => navigate(`/admin/encuestas/${id}/resultados`)}
            className="btn btn-secondary text-sm"
          >
            📊 Ver resultados
          </button>
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Columna principal (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Datos de la encuesta */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 text-base mb-5">Datos de la encuesta</h2>
            <form onSubmit={handleSave} className="form">
              <Input
                label="Título *"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                required maxLength={200}
              />
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-input resize-y"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={3}
                />
              </div>
              <Input
                label="Slug *"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                required maxLength={150} pattern="[a-z0-9-]+"
              />
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  className="form-input"
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                >
                  <option value="borrador">📝 Borrador</option>
                  <option value="activa">🟢 Activa</option>
                  <option value="cerrada">🔒 Cerrada</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Fecha de inicio" type="datetime-local"
                  value={form.fecha_inicio}
                  onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                />
                <Input
                  label="Fecha de cierre" type="datetime-local"
                  value={form.fecha_fin}
                  onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                />
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-actions">
                <Button type="submit" variant="primary" loading={saving}>
                  Guardar cambios
                </Button>
              </div>
            </form>

            {/* Cambio de estado rápido */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-3">Cambiar estado rápido:</p>
              <div className="flex gap-2 flex-wrap">
                <Button variant="ghost" onClick={() => handleChangeEstado('borrador')}>
                  📝 Borrador
                </Button>
                <Button variant="primary" onClick={() => handleChangeEstado('activa')}>
                  ✔ Activar
                </Button>
                <Button variant="secondary" onClick={() => handleChangeEstado('cerrada')}>
                  🔒 Cerrar
                </Button>
              </div>
            </div>
          </div>

          {/* Gestión de candidatos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 text-base mb-5">
              Candidatos
              <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
                {candidatos.length}
              </span>
            </h2>

            {/* Lista de candidatos existentes */}
            {candidatos.length === 0 ? (
              <p className="text-sm text-gray-400 mb-6">No hay candidatos aún. Agrega al menos dos.</p>
            ) : (
              <div className="flex flex-col gap-3 mb-6">
                {candidatos.map((c) => (
                  <div key={c.id}
                       className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    {/* Foto o inicial */}
                    {c.foto_url ? (
                      <img src={c.foto_url} alt={c.nombre}
                           className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center
                                      justify-center font-bold flex-shrink-0">
                        {c.nombre.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{c.nombre}</p>
                      {c.descripcion && (
                        <p className="text-xs text-gray-400 truncate">{c.descripcion}</p>
                      )}
                    </div>
                    <Button variant="danger" onClick={() => handleDeleteCandidato(c.id)}>
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para agregar candidato */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-medium text-gray-700 text-sm mb-4">Agregar candidato</h3>
              <form onSubmit={handleAddCandidato} className="form">
                <Input
                  label="Nombre *"
                  value={newCandidato.nombre}
                  onChange={(e) => setNewCandidato({ ...newCandidato, nombre: e.target.value })}
                  required maxLength={150}
                  placeholder="Nombre completo del candidato"
                />
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-input resize-y"
                    value={newCandidato.descripcion}
                    onChange={(e) => setNewCandidato({ ...newCandidato, descripcion: e.target.value })}
                    rows={2}
                    placeholder="Propuesta o descripción breve"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Foto (JPG, PNG, WEBP — máx. 5 MB)</label>
                  <input
                    id="candidato-foto-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="form-input"
                    onChange={(e) => setNewCandidato({ ...newCandidato, foto: e.target.files[0] || null })}
                  />
                </div>
                {candidatoError && <div className="alert alert-error">{candidatoError}</div>}
                <Button type="submit" loading={addingCandidato}>
                  Agregar candidato
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Columna lateral (1/3) */}
        <div className="lg:sticky lg:top-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 text-base mb-5">Link público y QR</h2>
            <QRCodeBox url={publicUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}
