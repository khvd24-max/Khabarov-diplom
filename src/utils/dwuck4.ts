import type { CalculationParams, CalculationSummary } from "../types";
import { downloadText } from "./fileUtils";

function fmt(value: number) {
  return value.toFixed(4).padStart(8, " ");
}

function avg(a: number, b: number) {
  return 0.5 * (a + b);
}

export function buildDwuck4Input(
  params: CalculationParams,
  summary?: CalculationSummary
) {
  const r0R = avg(params.r0Proj, params.r0Targ);
  const aR = avg(params.aProj, params.aTarg);
  const vR = Math.abs(summary?.vMin ?? 50);
  const vI = Math.abs(params.w0);
  const qCode = 0.0;

  const header = "DFM WEB EXPORT FOR DWUCK4".padEnd(60, " ");
  const controlLine = [
    " 37",
    "  0",
    "  0",
    "  0",
    "  0",
    "  0",
    "  0",
    "  0",
    "  0",
    "  0",
    "  0",
    "  0",
    "  0",
    "  0",
    "  0",
    "  0",
  ].join("");

  const lines = [
    `                    ${header}`,
    controlLine,
    `${fmt(37)}${fmt(0)}${fmt(5)}`,
    ` 80  1  0  0`,
    `${fmt(params.dR)}${fmt(params.rMin)}${fmt(params.rMax)}${fmt(0)}${fmt(0)}`,
    `${fmt(params.energyMeV)}${fmt(params.projectileA)}${fmt(
      params.projectileZ
    )}${fmt(params.targetA)}${fmt(params.targetZ)}${fmt(params.rc)}${fmt(
      0
    )}${fmt(0)}${fmt(0)}`,
    `${fmt(-1)}${fmt(vR)}${fmt(r0R)}${fmt(aR)}${fmt(0)}${fmt(vI)}${fmt(
      params.rw
    )}${fmt(params.aw)}${fmt(0)}${fmt(0)}`,
    `${fmt(qCode)}${fmt(params.projectileA)}${fmt(params.projectileZ)}${fmt(
      params.targetA
    )}${fmt(params.targetZ)}${fmt(params.rc)}${fmt(0)}${fmt(0)}${fmt(0)}`,
    `${fmt(0)}${fmt(vR)}${fmt(r0R)}${fmt(aR)}${fmt(0)}${fmt(vI)}${fmt(
      params.rw
    )}${fmt(params.aw)}${fmt(0)}${fmt(0)}`,
    `${fmt(0)}${fmt(params.projectileA)}${fmt(params.projectileZ)}${fmt(
      params.targetA
    )}${fmt(params.targetZ)}${fmt(params.rc)}${fmt(0)}${fmt(0)}${fmt(0)}`,
    `${fmt(0)}${fmt(vR)}${fmt(r0R)}${fmt(aR)}${fmt(0)}${fmt(vI)}${fmt(
      params.rw
    )}${fmt(params.aw)}${fmt(0)}${fmt(0)}`,
  ];

  return lines.join("\n");
}

export function exportDwuck4Input(
  params: CalculationParams,
  summary?: CalculationSummary
) {
  const text = buildDwuck4Input(params, summary);
  downloadText("dwuck4.inp", text);
}