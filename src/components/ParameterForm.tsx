import type { CalculationParams } from "../types";

type Props = {
  params: CalculationParams;
  onChange: (params: CalculationParams) => void;
  onRun: () => void;
  onExportPreset: () => void;
  onExportResult: () => void;
  hasResult: boolean;
};

export function ParameterForm({
  params,
  onChange,
  onRun,
  onExportPreset,
  onExportResult,
  hasResult,
}: Props) {
  const setField = (key: keyof CalculationParams, value: number) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
      <h2>Параметры расчёта</h2>

      <label>Снаряд Z <input type="number" value={params.projectileZ} onChange={(e) => setField("projectileZ", +e.target.value)} /></label>
      <label>Снаряд A <input type="number" value={params.projectileA} onChange={(e) => setField("projectileA", +e.target.value)} /></label>
      <label>Мишень Z <input type="number" value={params.targetZ} onChange={(e) => setField("targetZ", +e.target.value)} /></label>
      <label>Мишень A <input type="number" value={params.targetA} onChange={(e) => setField("targetA", +e.target.value)} /></label>

      <label>R_min <input type="number" step="0.1" value={params.rMin} onChange={(e) => setField("rMin", +e.target.value)} /></label>
      <label>R_max <input type="number" step="0.1" value={params.rMax} onChange={(e) => setField("rMax", +e.target.value)} /></label>
      <label>dR <input type="number" step="0.01" value={params.dR} onChange={(e) => setField("dR", +e.target.value)} /></label>

      <label>V0 <input type="number" step="0.1" value={params.v0} onChange={(e) => setField("v0", +e.target.value)} /></label>
      <label>Rv <input type="number" step="0.1" value={params.rv} onChange={(e) => setField("rv", +e.target.value)} /></label>
      <label>av <input type="number" step="0.01" value={params.av} onChange={(e) => setField("av", +e.target.value)} /></label>

      <label>W0 <input type="number" step="0.1" value={params.w0} onChange={(e) => setField("w0", +e.target.value)} /></label>
      <label>Rw <input type="number" step="0.1" value={params.rw} onChange={(e) => setField("rw", +e.target.value)} /></label>
      <label>aw <input type="number" step="0.01" value={params.aw} onChange={(e) => setField("aw", +e.target.value)} /></label>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={onRun}>Рассчитать</button>
        <button onClick={onExportPreset}>Скачать пресет</button>
        <button onClick={onExportResult} disabled={!hasResult}>Скачать результат</button>
      </div>
    </div>
  );
}