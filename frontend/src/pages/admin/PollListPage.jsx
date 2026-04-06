import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollService } from '../../services/pollService.js';
import { formatDate } from '../../utils/dateUtils.js';

/* --- Etiquetas de estado y sus estilos --- */
const ESTADO_STYLES = {
  activa:   { label: 'Activa',   cls: 'badge badge-activa',   dot: 'bg-green-400'  },
  borrador: { label: 'Borrador', cls: 'badge badge-borrador', dot: 'bg-yellow-400' },
  cerrada:  { label: 'Cerrada',  cls: 'badge badge-cerrada',  dot: 'bg-gray-300'   },
};

export default function PollListPage() {
  const navigate = useNavigate();
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  /* --- Carga inicial de encuestas --- */
  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await pollService.getAll();
      setEncuestas(data.encuestas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /* --- Eliminar encuesta con confirmación --- */
  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar esta encuesta? Esta acción no se puede deshacer.')) return;
    try {
      await pollService.delete(id);
      setEncuestas((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  }

  /* --- Filtrado por búsqueda --- */
  const filtered = encuestas.filter((e) =>
    e.titulo.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl animate-fade-in">

      {/* ENCABEZADO */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Encuestas</h1>
          <p className="text-gray-400 text-sm mt-1">{encuestas.length} encuesta{encuestas.length !== 1 ? 's' : ''} en total</p>
        </div>
        <button
          onClick={() => navigate('/admin/encuestas/nueva')}
          className="btn btn-primary"
        >
          + Nueva encuesta
        </button>
      </div>

      {/* Sin encuestas: estado vacío */}
      {encuestas.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Sin encuestas aún</h2>
          <p className="text-gray-400 text-sm mb-6">Crea la primera para empezar a gestionar votaciones.</p>
          <button
            onClick={() => navigate('/admin/encuestas/nueva')}
            className="btn btn-primary"
          >
            Crear la primera encuesta
          </button>
        </div>
      ) : (
        <>
          {/* Buscador */}
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar encuesta..."
              className="form-input max-w-xs"
            />
          </div>

          {/* Tabla de encuestas */}
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Estado</th>
                  <th>Votos</th>
                  <th>Inicio</th>
                  <th>Cierre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const st = ESTADO_STYLES[e.estado] || ESTADO_STYLES.cerrada;
                  return (
                    <tr key={e.id} className="group">
                      {/* Título + punto de estado */}
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />
                          <span className="font-medium text-gray-900 group-hover:text-blue-600 transition">
                            {e.titulo}
                          </span>
                        </div>
                      </td>

                      {/* Badge de estado */}
                      <td>
                        <span className={st.cls}>{st.label}</span>
                      </td>

                      {/* Total de votos */}
                      <td>
                        <span className="font-semibold text-gray-700">
                          {parseInt(e.total_votos) || 0}
                        </span>
                      </td>

                      <td className="text-gray-500 text-sm">{formatDate(e.fecha_inicio)}</td>
                      <td className="text-gray-500 text-sm">{formatDate(e.fecha_fin)}</td>

                      {/* Botones de acción */}
                      <td>
                        <div className="flex gap-1.5 flex-wrap">
                          <button
                            onClick={() => navigate(`/admin/encuestas/${e.id}`)}
                            className="btn btn-secondary text-xs px-3 py-1.5"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => navigate(`/admin/encuestas/${e.id}/resultados`)}
                            className="btn btn-secondary text-xs px-3 py-1.5"
                          >
                            📊 Ver
                          </button>
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="btn btn-danger text-xs px-3 py-1.5"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Sin resultados en búsqueda */}
            {filtered.length === 0 && search && (
              <div className="text-center py-12 text-gray-400 text-sm">
                Sin resultados para &quot;{search}&quot;
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
