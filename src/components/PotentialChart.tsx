import factoryImport from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";
import type { PotentialPoint } from "../types";

const createPlotlyComponent =
  (factoryImport as unknown as { default?: (plotly: typeof Plotly) => any }).default ??
  (factoryImport as unknown as (plotly: typeof Plotly) => any);

const Plot = createPlotlyComponent(Plotly);

type Props = {
  points: PotentialPoint[];
};

export function PotentialChart({ points }: Props) {
  if (!points.length) {
    return <p>Пока нет данных для отображения.</p>;
  }

  return (
    <Plot
      data={[
        {
          x: points.map((p) => p.r),
          y: points.map((p) => p.vN),
          type: "scatter",
          mode: "lines",
          name: "V_N(R)",
          line: { color: "#1f77b4", width: 2 },
        },
        {
          x: points.map((p) => p.r),
          y: points.map((p) => p.vC),
          type: "scatter",
          mode: "lines",
          name: "V_C(R)",
          line: { color: "#ff7f0e", width: 2, dash: "dot" },
        },
        {
          x: points.map((p) => p.r),
          y: points.map((p) => p.v),
          type: "scatter",
          mode: "lines",
          name: "V(R)",
          line: { color: "#2ca02c", width: 3 },
        },
        {
          x: points.map((p) => p.r),
          y: points.map((p) => p.w),
          type: "scatter",
          mode: "lines",
          name: "W(R)",
          line: { color: "#d62728", width: 2 },
        },
      ]}
      layout={{
        title: { text: "Ядро-ядерный потенциал" },
        xaxis: { title: { text: "R (fm)" } },
        yaxis: { title: { text: "Potential (MeV)" } },
        autosize: true,
        width: 950,
        height: 540,
        legend: {
          orientation: "h",
          y: 1.12,
          x: 0,
        },
        margin: {
          l: 70,
          r: 30,
          t: 70,
          b: 60,
        },
      }}
      config={{
        responsive: true,
        displaylogo: false,
      }}
      style={{ width: "100%" }}
    />
  );
}