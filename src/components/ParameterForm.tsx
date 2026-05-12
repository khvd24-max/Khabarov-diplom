import type { ChangeEvent } from "react";
import type { CalculationParams, DensityModel, NNModel } from "../types";

type Props = {
  params: CalculationParams;
  onChange: (next: CalculationParams) => void;
  onRun: () => void;
  isRunning: boolean;
};

export function ParameterForm({
  params,
  onChange,
  onRun,
  isRunning,
}: Props) {
  const setField = <K extends keyof CalculationParams>(
    key: K,
    value: CalculationParams[K]
  ) => {
    onChange({ ...params, [key]: value });
  };

  const handlePresetLoad = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const nextParams: CalculationParams = parsed.params ?? parsed;
        onChange(nextParams);
      } catch {
        alert("Не удалось загрузить пресет: некорректный JSON.");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  };

  const numberField = (
    key: keyof CalculationParams,
    label: string,
    step = "any",
    min?: number
  ) => (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        className="field__input"
        type="number"
        step={step}
        min={min}
        value={params[key] as number}
        onChange={(e) => setField(key as never, Number(e.target.value) as never)}
      />
    </label>
  );

  return (
    <aside className="panel panel--sticky">
      <div className="panel__head">
        <div>
          <h2 className="panel__title">Параметры расчёта</h2>
        </div>

        <button
          type="button"
          className="button button--primary button--full"
          onClick={onRun}
          disabled={isRunning}
        >
          {isRunning ? "Идёт расчёт..." : "Рассчитать"}
        </button>
      </div>

      <div className="panel__section">
        <label className="file-button">
          <input type="file" accept=".json" onChange={handlePresetLoad} />
          <span>Загрузить пресет JSON</span>
        </label>
      </div>

      <section className="panel__section">
        <h3 className="section-title">Ядра и энергия</h3>
        <div className="form-grid">
          {numberField("projectileZ", "Снаряд Z", "1", 0)}
          {numberField("projectileA", "Снаряд A", "1", 1)}
          {numberField("targetZ", "Мишень Z", "1", 0)}
          {numberField("targetA", "Мишень A", "1", 1)}
          {numberField("energyMeV", "Энергия (MeV)", "0.1", 0)}
        </div>
      </section>

      <section className="panel__section">
        <h3 className="section-title">Радиальная сетка</h3>
        <div className="form-grid">
          {numberField("rMin", "R min", "0.01", 0)}
          {numberField("rMax", "R max", "0.01", 0.01)}
          {numberField("dR", "dR", "0.01", 0.01)}
        </div>
      </section>

      <section className="panel__section">
        <h3 className="section-title">Плотность снаряда</h3>
        <div className="form-grid">
          <label className="field">
            <span className="field__label">Модель</span>
            <select
              className="field__input"
              value={params.projectileDensityModel}
              onChange={(e) =>
                setField(
                  "projectileDensityModel",
                  e.target.value as DensityModel
                )
              }
            >
              <option value="2pF">2pF</option>
              <option value="gaussian">Gaussian</option>
            </select>
          </label>

          {numberField("r0Proj", "r0 снаряда", "0.01", 0.01)}
          {numberField("aProj", "a снаряда", "0.01", 0.01)}
        </div>
      </section>

      <section className="panel__section">
        <h3 className="section-title">Плотность мишени</h3>
        <div className="form-grid">
          <label className="field">
            <span className="field__label">Модель</span>
            <select
              className="field__input"
              value={params.targetDensityModel}
              onChange={(e) =>
                setField("targetDensityModel", e.target.value as DensityModel)
              }
            >
              <option value="2pF">2pF</option>
              <option value="gaussian">Gaussian</option>
            </select>
          </label>

          {numberField("r0Targ", "r0 мишени", "0.01", 0.01)}
          {numberField("aTarg", "a мишени", "0.01", 0.01)}
        </div>
      </section>

      <section className="panel__section">
        <h3 className="section-title">NN-взаимодействие</h3>
        <div className="form-grid">
          <label className="field">
            <span className="field__label">Модель NN</span>
            <select
              className="field__input"
              value={params.nnModel}
              onChange={(e) => setField("nnModel", e.target.value as NNModel)}
            >
              <option value="M3Y-Reid">M3Y-Reid</option>
              <option value="M3Y-Paris">M3Y-Paris</option>
            </select>
          </label>

          {numberField("nReal", "Nreal", "0.01", 0)}

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={params.useDensityDependence}
              onChange={(e) =>
                setField("useDensityDependence", e.target.checked)
              }
            />
            <span>Учитывать density dependence</span>
          </label>
        </div>
      </section>

      <section className="panel__section">
        <h3 className="section-title">Мнимая часть и кулон</h3>
        <div className="form-grid">
          {numberField("w0", "W0", "0.1")}
          {numberField("rw", "rW", "0.01", 0.01)}
          {numberField("aw", "aW", "0.01", 0.01)}
          {numberField("rc", "rC", "0.01", 0.01)}
        </div>
      </section>
    </aside>
  );
}