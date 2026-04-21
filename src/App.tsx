import { useRef, useState } from "react";
import { ParameterForm } from "./components/ParameterForm";
import { PotentialChart } from "./components/PotentialChart";
import { calculatePotential } from "./utils/calculatePotential";
import { exportPreset, exportResult } from "./utils/fileUtils";
import type { CalculationParams, PotentialPoint, PresetFile } from "./types";

const initialParams: CalculationParams = {
  projectileZ: 2,
  projectileA: 4,
  targetZ: 14,
  targetA: 28,
  rMin: 0,
  rMax: 15,
  dR: 0.1,
  v0: 120,
  rv: 4.5,
  av: 0.65,
  w0: 25,
  rw: 5.2,
  aw: 0.75,
};

export default function App() {
  const [params, setParams] = useState<CalculationParams>(initialParams);
  const [points, setPoints] = useState<PotentialPoint[]>([]);
  const [status, setStatus] = useState("Готово");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const runCalculation = () => {
    try {
      setStatus("Расчёт...");
      const result = calculatePotential(params);
      setPoints(result.points);
      setStatus(`Успешно: ${result.mode}`);
    } catch (error) {
      console.error(error);
      setStatus("Ошибка при расчёте");
    }
  };

  const handleExportPreset = () => {
    const name =
      window.prompt("Введите название пресета", "demo-preset") || "demo-preset";
    exportPreset(name, params);
  };

  const handleExportResult = () => {
    if (!points.length) return;
    exportResult(params, points);
  };

  const handleImportPreset = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as PresetFile;

      if (!parsed.params) {
        throw new Error("Некорректный формат пресета");
      }

      setParams(parsed.params);
      setStatus(`Пресет "${parsed.name}" загружен`);
    } catch (error) {
      console.error(error);
      setStatus("Ошибка загрузки пресета");
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>React MVP: расчёт ядро-ядерного потенциала</h1>
      <p>{status}</p>

      <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => fileInputRef.current?.click()}>
          Загрузить пресет
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleImportPreset(file);
            }
            e.currentTarget.value = "";
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "420px 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <ParameterForm
          params={params}
          onChange={setParams}
          onRun={runCalculation}
          onExportPreset={handleExportPreset}
          onExportResult={handleExportResult}
          hasResult={points.length > 0}
        />

        <PotentialChart points={points} />
      </div>
    </div>
  );
}