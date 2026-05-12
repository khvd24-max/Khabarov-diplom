import { useMemo } from "react";
import factoryImport from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";
import type { PotentialPoint } from "../types";

const createPlotlyComponent =
  (
    factoryImport as unknown as {
      default?: (plotly: typeof Plotly) => React.ComponentType<any>;
    }
  ).default ??
  (factoryImport as unknown as (
    plotly: typeof Plotly
  ) => React.ComponentType<any>);

const Plot = createPlotlyComponent(Plotly);

type Props = {
  points: PotentialPoint[];
};

export function PotentialChart({ points }: Props) {
  const data = useMemo(() => {
    const x = points.map((p) => p.r);

    return [
      {
        x,
        y: points.map((p) => p.vD),
        type: "scatter",
        mode: "lines",
        name: "V_D(R)",
        line: { width: 2, color: "#0f766e" },
      },
      {
        x,
        y: points.map((p) => p.vEX),
        type: "scatter",
        mode: "lines",
        name: "V_EX(R)",
        line: { width: 2, color: "#c2410c" },
      },
      {
        x,
        y: points.map((p) => p.vN),
        type: "scatter",
        mode: "lines",
        name: "V_N(R)",
        line: { width: 2.5, color: "#1d4ed8" },
      },
      {
        x,
        y: points.map((p) => p.vC),
        type: "scatter",
        mode: "lines",
        name: "V_C(R)",
        line: { width: 2, color: "#7c3aed" },
      },
      {
        x,
        y: points.map((p) => p.v),
        type: "scatter",
        mode: "lines",
        name: "V(R)=V_N+V_C",
        line: { width: 3, color: "#111827" },
      },
      {
        x,
        y: points.map((p) => p.w),
        type: "scatter",
        mode: "lines",
        name: "W(R)",
        line: { width: 2, color: "#dc2626", dash: "dash" },
      },
    ];
  }, [points]);

  const layout = useMemo(
    () => ({
      autosize: true,
      height: 500,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "#ffffff",
      margin: { l: 56, r: 24, t: 24, b: 48 },
      legend: {
        orientation: "h",
        y: 1.14,
        x: 0,
      },
      xaxis: {
        title: "R (fm)",
        gridcolor: "#e5e7eb",
        zerolinecolor: "#d1d5db",
      },
      yaxis: {
        title: "Potential (MeV)",
        gridcolor: "#e5e7eb",
        zerolinecolor: "#d1d5db",
      },
    }),
    []
  );

  if (!points.length) {
    return (
      <div className="chart-empty">
        Пока нет данных для отображения. Запустите расчёт.
      </div>
    );
  }

  return (
    <div className="chart-shell">
      <Plot
        data={data}
        layout={layout}
        config={{
          responsive: true,
          displaylogo: false,
          modeBarButtonsToRemove: ["lasso2d", "select2d"],
        }}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler
      />
    </div>
  );
}