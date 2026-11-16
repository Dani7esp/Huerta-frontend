import { useState, useEffect } from 'react';

const API_URL = 'http://127.0.0.1:8000/api/agricultores/';

export default function AgricultoresSection({ alActualizar }) {
  const [agricultores, setAgricultores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [nombre, setNombre] = useState('');
  const [barrio, setBarrio] = useState('');
  const [telefono, setTelefono] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  const cargarAgricultores = async () => {
    try {
      setCargando(true);
      setError(null);
      const respuesta = await fetch(API_URL);
      if (!respuesta.ok) throw new Error('Error al obtener los agricultores');
      const datos = await respuesta.json();
      setAgricultores(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAgricultores();
  }, []);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    const metodo = editandoId ? 'PATCH' : 'POST';
    const url = editandoId ? `${API_URL}${editandoId}/` : API_URL;

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, barrio, telefono }),
      });
      if (!respuesta.ok) throw new Error('No se pudo guardar el agricultor');

      limpiarFormulario();
      await cargarAgricultores();
      if (alActualizar) alActualizar();
    } catch (err) {
      alert(err.message);
    }
  };

  const eliminarAgricultor = async (id) => {
    if (!confirm('¿Eliminar este agricultor y todos sus cultivos?')) return;
    try {
      const respuesta = await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
      if (!respuesta.ok) throw new Error('No se pudo eliminar');
      await cargarAgricultores();
      if (alActualizar) alActualizar();
    } catch (err) {
      alert(err.message);
    }
  };

  const iniciarEdicion = (ag) => {
    setEditandoId(ag.id);
    setNombre(ag.nombre);
    setBarrio(ag.barrio);
    setTelefono(ag.telefono);
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setNombre('');
    setBarrio('');
    setTelefono('');
  };

  return (
    <section className="card">
      <h2>Vecinos Agricultores</h2>

      <form onSubmit={manejarEnvio} className="formulario">
        <input
          type="text"
          placeholder="Nombre del vecino"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Barrio / Vereda"
          value={barrio}
          onChange={(e) => setBarrio(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
        />
        <button type="submit">
          {editandoId ? 'Actualizar' : 'Registrar Agricultor'}
        </button>
        {editandoId && (
          <button type="button" onClick={limpiarFormulario} className="btn-sec">
            Cancelar
          </button>
        )}
      </form>

      {cargando && <p>Cargando agricultores...</p>}
      {error && <p className="error">Error: {error}</p>}

      {!cargando && !error && (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Barrio</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {agricultores.map((ag) => (
              <tr key={ag.id}>
                <td>{ag.nombre}</td>
                <td>{ag.barrio}</td>
                <td>{ag.telefono}</td>
                <td>
                  <button onClick={() => iniciarEdicion(ag)}>Editar</button>
                  <button onClick={() => eliminarAgricultor(ag.id)} className="btn-del">
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