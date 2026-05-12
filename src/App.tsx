import { useMemo, useState } from "react";
import "./App.css";
import { ParameterForm } from "./components/ParameterForm";
import { PotentialChart } from "./components/PotentialChart";
import { buildDwuck4Input, exportDwuck4Input } from "./utils/dwuck4";
import { exportPreset, exportResult } from "./utils/fileUtils";
import { calculatePotential } from "./utils/calculatePotential";
import type { CalculationParams, CalculationResult } from "./types";

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

function formatNumber(value: number, digits = 3) {
  return Number.isFinite(value) ? value.toFixed(digits) : "—";
}

export default function App() {
  const [params, setParams] = useState<CalculationParams>(initialParams);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [status, setStatus] = useState("Готово к расчёту");
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setStatus("Расчёт...");

    requestAnimationFrame(() => {
      try {
        const nextResult = calculatePotential(params);
        setResult(nextResult);
        setStatus(
          `Успешно: ${nextResult.mode}, ${nextResult.summary.elapsedMs.toFixed(
            1
          )} мс`
        );
      } catch (error) {
        console.error(error);
        setStatus("Ошибка расчёта");
      } finally {
        setIsRunning(false);
      }
    });
  };

  const dwuckPreview = useMemo(() => {
    if (!result) return "";
    return buildDwuck4Input(params, result.summary);
  }, [params, result]);

  const summary = result?.summary;

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Научное веб-приложение</p>
          <h1>Расчёт ядро-ядерного потенциала</h1>
        </div>

        <div className="status-badge">{status}</div>
      </header>

      <main className="app-layout">
        <ParameterForm
          params={params}
          onChange={setParams}
          onRun={handleRun}
          isRunning={isRunning}
        />

        <section className="content-column">
          <div className="toolbar">
            <button
              className="button"
              onClick={() => result && exportResult(params, result)}
              disabled={!result}
            >
              Экспорт результата JSON
            </button>

            <button
              className="button"
              onClick={() => exportPreset("preset", params)}
            >
              Экспорт пресета
            </button>

            <button
              className="button button--accent"
              onClick={() => result && exportDwuck4Input(params, result.summary)}
              disabled={!result}
            >
              Экспорт DWUCK4
            </button>
          </div>

          <section className="metrics-grid">
            <article className="metric-card">
              <span className="metric-card__label">Время расчёта</span>
              <strong className="metric-card__value">
                {summary ? `${formatNumber(summary.elapsedMs, 1)} мс` : "—"}
              </strong>
            </article>

            <article className="metric-card">
              <span className="metric-card__label">Точек по R</span>
              <strong className="metric-card__value">
                {summary?.pointsCount ?? "—"}
              </strong>
            </article>

            <article className="metric-card">
              <span className="metric-card__label">Минимум V(R)</span>
              <strong className="metric-card__value">
                {summary
                  ? `${formatNumber(summary.vMin)} MeV @ ${formatNumber(
                      summary.rAtVMin
                    )} fm`
                  : "—"}
              </strong>
            </article>

            <article className="metric-card">
              <span className="metric-card__label">Барьер V(R)</span>
              <strong className="metric-card__value">
                {summary
                  ? `${formatNumber(summary.vBarrier)} MeV @ ${formatNumber(
                      summary.rAtBarrier
                    )} fm`
                  : "—"}
              </strong>
            </article>

            <article className="metric-card">
              <span className="metric-card__label">Макс. итераций VEX</span>
              <strong className="metric-card__value">
                {summary?.maxIterations ?? "—"}
              </strong>
            </article>

            <article className="metric-card">
              <span className="metric-card__label">Режим</span>
              <strong className="metric-card__value">
                {result?.mode ?? "—"}
              </strong>
            </article>
          </section>

          <section className="panel">
            <div className="panel__head">
              <div>
                <h2 className="panel__title">График потенциала</h2>
                <p className="panel__subtitle">
                  Отдельно показаны V_D, V_EX, V_N, V_C, V и W.
                </p>
              </div>
            </div>

            <PotentialChart points={result?.points ?? []} />
          </section>

          <section className="panel">
            <div className="panel__head">
              <div>
                <h2 className="panel__title">Предпросмотр DWUCK4 input</h2>
                <p className="panel__subtitle">
                  Генерируется по текущим параметрам и summary расчёта.
                </p>
              </div>
            </div>

            <textarea
              className="dwuck-preview"
              readOnly
              value={
                dwuckPreview || "После расчёта здесь появится текст dwuck4.inp"
              }
            />
          </section>
        </section>
      </main>
    </div>
  );
}