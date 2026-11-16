import { useState, useEffect } from 'react';

const API_CULTIVOS = 'http://127.0.0.1:8000/api/cultivos/';
const API_AGRICULTORES = 'http://127.0.0.1:8000/api/agricultores/';

export default function CultivosSection({ refrescarTrigger }) {
  const [cultivos, setCultivos] = useState([]);
  const [agricultores, setAgricultores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('cosecha');
  const [cantidad, setCantidad] = useState('');
  const [agricultorId, setAgricultorId] = useState('');

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);
      const [resCultivos, resAgricultores] = await Promise.all([
        fetch(API_CULTIVOS),
        fetch(API_AGRICULTORES),
      ]);

      if (!resCultivos.ok || !resAgricultores.ok) {
        throw new Error('Error al conectar con el servidor de la huerta');
      }

      setCultivos(await resCultivos.json());
      setAgricultores(await resAgricultores.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [refrescarTrigger]);

  const crearCultivo = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch(API_CULTIVOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          tipo,
          cantidad,
          disponible: true,
          agricultor: Number(agricultorId),
        }),
      });
      if (!respuesta.ok) throw new Error('Error al publicar el cultivo');

      setNombre('');
      setCantidad('');
      setAgricultorId('');
      await cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  const alternarDisponibilidad = async (cultivo) => {
    try {
      const respuesta = await fetch(`${API_CULTIVOS}${cultivo.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disponible: !cultivo.disponible }),
      });
      if (!respuesta.ok) throw new Error('No se pudo actualizar el estado');
      await cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  const eliminarCultivo = async (id) => {
    try {
      const respuesta = await fetch(`${API_CULTIVOS}${id}/`, { method: 'DELETE' });
      if (!respuesta.ok) throw new Error('Error al eliminar el cultivo');
      await cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="card">
      <h2>Semillas y Cosechas para Intercambio</h2>

      <form onSubmit={crearCultivo} className="formulario">
        <input
          type="text"
          placeholder="Producto (ej. Tomate Cherry)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="cosecha">Cosecha</option>
          <option value="semilla">Semilla</option>
          <option value="plantula">Plántula</option>
        </select>
        <input
          type="text"
          placeholder="Cantidad (ej. 3 libras)"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
        />
        <select
          value={agricultorId}
          onChange={(e) => setAgricultorId(e.target.value)}
          required
        >
          <option value="">-- Selecciona Agricultor --</option>
          {agricultores.map((ag) => (
            <option key={ag.id} value={ag.id}>
              {ag.nombre} ({ag.barrio})
            </option>
          ))}
        </select>
        <button type="submit">Publicar Intercambio</button>
      </form>

      {cargando && <p>Cargando ofertas de la huerta...</p>}
      {error && <p className="error">Error: {error}</p>}

      {!cargando && !error && (
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Agricultor</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cultivos.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.tipo}</td>
                <td>{c.cantidad}</td>
                <td>{c.agricultor_nombre}</td>
                <td>{c.disponible ? 'Disponible' : 'Intercambiado'}</td>
                <td>
                  <button onClick={() => alternarDisponibilidad(c)}>
                    {c.disponible ? 'Marcar Intercambiado' : 'Reactivar'}
                  </button>
                  <button onClick={() => eliminarCultivo(c.id)} className="btn-del">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}