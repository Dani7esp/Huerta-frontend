import { useState } from 'react';
import AgricultoresSection from './components/AgricultoresSection';
import CultivosSection from './components/CultivosSection';
import './App.css';

export default function App() {
  const [actualizarCultivos, setActualizarCultivos] = useState(0);

  return (
    <main className="contenedor">
      <header>
        <h1>Huerta Comunitaria</h1>
        <p>Intercambio de semillas y cosechas entre vecinos</p>
      </header>

      <AgricultoresSection
        alActualizar={() => setActualizarCultivos((prev) => prev + 1)}
      />
      <CultivosSection refrescarTrigger={actualizarCultivos} />
    </main>
  );
}