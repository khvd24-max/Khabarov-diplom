import { useState } from "react";
import { ParameterForm } from "./components/ParameterForm";
import { PotentialChart } from "./components/PotentialChart";
import { calculatePotential } from "./utils/calculatePotential";
import type { CalculationParams, PotentialPoint } from "./types";

const initialParams: CalculationParams = {
  projectileZ: 3,
  projectileA: 6,
  targetZ: 20,
  targetA: 48,

  energyMeV: 30,

  rMin: 0,
  rMax: 20,
  dR: 0.2,

  projectileDensityModel: "2pF",
  targetDensityModel: "2pF",

  r0Proj: 1.07,
  aProj: 0.55,

  r0Targ: 1.07,
  aTarg: 0.54,

  nnModel: "M3Y-Reid",
  useDensityDependence: true,

  nReal: 1.0,

  w0: 12,
  rw: 1.2,
  aw: 0.75,

  rc: 1.25,
};

function exportJson(points: PotentialPoint[], params: CalculationParams) {
  const blob = new Blob([JSON.stringify({ params, points }, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "potential.json";
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [params, setParams] = useState<CalculationParams>(initialParams);
  const [points, setPoints] = useState<PotentialPoint[]>([]);
  const [status, setStatus] = useState("Готово");

  const runCalculation = () => {
    setStatus("Расчёт...");
    const result = calculatePotential(params);
    setPoints(result.points);
    setStatus(`Успешно (${result.mode})`);
  };

  return (
    <div style={{ padding: 24, display: "grid", gap: 24 }}>
      <h1>Расчёт ядро-ядерного потенциала</h1>
      <p>{status}</p>

      <div style={{ display: "grid", gridTemplateColumns: "460px 1fr", gap: 24 }}>
        <ParameterForm
          params={params}
          onChange={setParams}
          onRun={runCalculation}
        />

        <div>
          <button onClick={() => exportJson(points, params)} disabled={!points.length}>
            Экспорт JSON
          </button>
          <PotentialChart points={points} />
        </div>
      </div>
    </div>
  );
}