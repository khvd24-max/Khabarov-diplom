import type {
  CalculationParams,
  CalculationResult,
  PresetFile,
} from "../types";

export function downloadText(
  filename: string,
  text: string,
  mimeType = "text/plain;charset=utf-8"
) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJson(filename: string, data: unknown) {
  downloadText(filename, JSON.stringify(data, null, 2), "application/json");
}

export function exportResult(
  params: CalculationParams,
  result: CalculationResult
) {
  downloadJson("potential-result.json", {
    params,
    mode: result.mode,
    summary: result.summary,
    points: result.points,
  });
}

export function exportPreset(name: string, params: CalculationParams) {
  const payload: PresetFile = { name, params };
  downloadJson("preset.json", payload);
}