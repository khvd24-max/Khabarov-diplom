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
          y: points.map((p) => p.v),
          type: "scatter",
          mode: "lines",
          name: "V(R)",
        },
        {
          x: points.map((p) => p.r),
          y: points.map((p) => p.w),
          type: "scatter",
          mode: "lines",
          name: "W(R)",
        },
      ]}
      layout={{
        autosize: true,
        title: { text: "Графики V(R) и W(R)" },
        xaxis: { title: { text: "R (fm)" } },
        yaxis: { title: { text: "Potential (MeV)" } },
      }}
      style={{ width: "100%", height: "500px" }}
      useResizeHandler={true}
    />
  );
}