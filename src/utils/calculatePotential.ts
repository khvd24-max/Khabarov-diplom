import type { CalculationParams, PotentialPoint } from "../types";

type GPUKernelContext = {
  thread: {
    x: number;
    y: number;
    z: number;
  };
};

function buildGrid(params: CalculationParams): number[] {
  const n = Math.floor((params.rMax - params.rMin) / params.dR) + 1;
  return Array.from({ length: n }, (_, i) => params.rMin + i * params.dR);
}

export function calculatePotential(params: CalculationParams): {
  points: PotentialPoint[];
  mode: string;
} {
  const grid = buildGrid(params);

  try {
    const gpu = new window.GPU({ mode: "webgl" });

    const kernelV = gpu
      .createKernel(function (
        this: GPUKernelContext,
        rMin: number,
        dR: number,
        rv: number,
        av: number,
        v0: number
      ) {
        const r = rMin + this.thread.x * dR;
        return -v0 / (1 + Math.exp((r - rv) / av));
      })
      .setOutput([grid.length]);

    const kernelW = gpu
      .createKernel(function (
        this: GPUKernelContext,
        rMin: number,
        dR: number,
        rw: number,
        aw: number,
        w0: number
      ) {
        const r = rMin + this.thread.x * dR;
        return -w0 / (1 + Math.exp((r - rw) / aw));
      })
      .setOutput([grid.length]);

    const vArr = kernelV(
      params.rMin,
      params.dR,
      params.rv,
      params.av,
      params.v0
    ) as number[];

    const wArr = kernelW(
      params.rMin,
      params.dR,
      params.rw,
      params.aw,
      params.w0
    ) as number[];

    const points = grid.map((r, i) => ({
      r,
      v: Number(vArr[i]),
      w: Number(wArr[i]),
    }));

    gpu.destroy();

    return { points, mode: "GPU/WebGL" };
  } catch {
    const points = grid.map((r) => ({
      r,
      v: -params.v0 / (1 + Math.exp((r - params.rv) / params.av)),
      w: -params.w0 / (1 + Math.exp((r - params.rw) / params.aw)),
    }));

    return { points, mode: "CPU fallback" };
  }
}