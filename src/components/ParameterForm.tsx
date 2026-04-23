import type { ChangeEvent } from "react";
import type { CalculationParams, DensityModel, NNModel } from "../types";

type Props = {
  params: CalculationParams;
  onChange: (next: CalculationParams) => void;
  onRun: () => void;
};

export function ParameterForm({ params, onChange, onRun }: Props) {
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
      } catch (error) {
        alert("Не удалось загрузить пресет: некорректный JSON.");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    fontSize: "14px",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "grid",
    gap: 4,
    fontSize: "14px",
  };

  const sectionStyle: React.CSSProperties = {
    display: "grid",
    gap: 10,
    padding: 12,
    border: "1px solid #ddd",
    borderRadius: 8,
  };

  const actionsStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
    padding: 12,
    border: "1px solid #ddd",
    borderRadius: 8,
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 5,
  };

  const buttonStyle: React.CSSProperties = {
    padding: "10px 16px",
    fontSize: "14px",
    cursor: "pointer",
  };

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 460 }}>
      <h2 style={{ margin: 0 }}>Параметры расчёта</h2>

      <div style={actionsStyle}>
        <button type="button" onClick={onRun} style={buttonStyle}>
          Рассчитать
        </button>

        <label
          style={{
            ...buttonStyle,
            display: "inline-flex",
            alignItems: "center",
            border: "1px solid #999",
            borderRadius: 4,
            background: "#f7f7f7",
          }}
        >
          Загрузить пресет JSON
          <input
            type="file"
            accept=".json,application/json"
            onChange={handlePresetLoad}
            style={{ display: "none" }}
          />
        </label>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Ядра</h3>

        <label style={labelStyle}>
          Снаряд Z
          <input
            style={inputStyle}
            type="number"
            value={params.projectileZ}
            onChange={(e) => setField("projectileZ", +e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          Снаряд A
          <input
            style={inputStyle}
            type="number"
            value={params.projectileA}
            onChange={(e) => setField("projectileA", +e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          Мишень Z
          <input
            style={inputStyle}
            type="number"
            value={params.targetZ}
            onChange={(e) => setField("targetZ", +e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          Мишень A
          <input
            style={inputStyle}
            type="number"
            value={params.targetA}
            onChange={(e) => setField("targetA", +e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          Энергия (MeV)
          <input
            style={inputStyle}
            type="number"
            step="0.1"
            value={params.energyMeV}
            onChange={(e) => setField("energyMeV", +e.target.value)}
          />
        </label>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Радиальная сетка</h3>

        <label style={labelStyle}>
          R_min
          <input
            style={inputStyle}
            type="number"
            step="0.1"
            value={params.rMin}
            onChange={(e) => setField("rMin", +e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          R_max
          <input
            style={inputStyle}
            type="number"
            step="0.1"
            value={params.rMax}
            onChange={(e) => setField("rMax", +e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          dR
          <input
            style={inputStyle}
            type="number"
            step="0.01"
            value={params.dR}
            onChange={(e) => setField("dR", +e.target.value)}
          />
        </label>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Плотность снаряда</h3>

        <label style={labelStyle}>
          Модель плотности
          <select
            style={inputStyle}
            value={params.projectileDensityModel}
            onChange={(e) =>
              setField("projectileDensityModel", e.target.value as DensityModel)
            }
          >
            <option value="2pF">2pF</option>
            <option value="gaussian">Gaussian</option>
          </select>
        </label>

        <label style={labelStyle}>
          r0 снаряда
          <input
            style={inputStyle}
            type="number"
            step="0.01"
            value={params.r0Proj}
            onChange={(e) => setField("r0Proj", +e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          a снаряда
          <input
            style={inputStyle}
            type="number"
            step="0.01"
            value={params.aProj}
            onChange={(e) => setField("aProj", +e.target.value)}
          />
        </label>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Плотность мишени</h3>

        <label style={labelStyle}>
          Модель плотности
          <select
            style={inputStyle}
            value={params.targetDensityModel}
            onChange={(e) =>
              setField("targetDensityModel", e.target.value as DensityModel)
            }
          >
            <option value="2pF">2pF</option>
            <option value="gaussian">Gaussian</option>
          </select>
        </label>

        <label style={labelStyle}>
          r0 мишени
          <input
            style={inputStyle}
            type="number"
            step="0.01"
            value={params.r0Targ}
            onChange={(e) => setField("r0Targ", +e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          a мишени
          <input
            style={inputStyle}
            type="number"
            step="0.01"
            value={params.aTarg}
            onChange={(e) => setField("aTarg", +e.target.value)}
          />
        </label>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>NN-взаимодействие</h3>

        <label style={labelStyle}>
          Модель NN interaction
          <select
            style={inputStyle}
            value={params.nnModel}
            onChange={(e) => setField("nnModel", e.target.value as NNModel)}
          >
            <option value="M3Y-Reid">M3Y-Reid</option>
            <option value="M3Y-Paris">M3Y-Paris</option>
          </select>
        </label>

        <label style={labelStyle}>
          N_real
          <input
            style={inputStyle}
            type="number"
            step="0.01"
            value={params.nReal}
            onChange={(e) => setField("nReal", +e.target.value)}
          />
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "14px",
          }}
        >
          <input
            type="checkbox"
            checked={params.useDensityDependence}
            onChange={(e) =>
              setField("useDensityDependence", e.target.checked)
            }
          />
          Учитывать density dependence
        </label>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Мнимая часть и кулоновский вклад</h3>

        <label style={labelStyle}>
          W0
          <input
            style={inputStyle}
            type="number"
            step="0.1"
            value={params.w0}
            onChange={(e) => setField("w0", +e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          rW
          <input
            style={inputStyle}
            type="number"
            step="0.01"
            value={params.rw}
            onChange={(e) => setField("rw", +e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          aW
          <input
            style={inputStyle}
            type="number"
            step="0.01"
            value={params.aw}
            onChange={(e) => setField("aw", +e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          rC
          <input
            style={inputStyle}
            type="number"
            step="0.01"
            value={params.rc}
            onChange={(e) => setField("rc", +e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}