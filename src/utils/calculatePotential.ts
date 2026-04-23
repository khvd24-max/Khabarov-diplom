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

function cbrtA(a: number): number {
  return Math.cbrt(a);
}

export function calculatePotential(params: CalculationParams): {
  points: PotentialPoint[];
  mode: string;
} {
  const grid = buildGrid(params);

  const ap13 = cbrtA(params.projectileA);
  const at13 = cbrtA(params.targetA);

  const realRadius = params.rv * (ap13 + at13);
  const imagRadius = params.rw * (ap13 + at13);

  const coulombRadius = 1.25 * (ap13 + at13);

  const massFactor =
    (params.projectileA * params.targetA) /
    (params.projectileA + params.targetA);

  const asymmetry =
    Math.abs(params.targetA - params.projectileA) /
    (params.targetA + params.projectileA);

  const energyFactor = 1 / (1 + params.energyMeV / 200);

  const effectiveV0 =
    params.v0 * (1 + 0.15 * asymmetry) * energyFactor * (1 + 0.02 * massFactor);

  const effectiveW0 =
    params.w0 * (1 + params.energyMeV / 100) * (1 + 0.01 * massFactor);

  const zProd = params.projectileZ * params.targetZ;
  const e2 = 1.44;

  try {
    const gpu = new window.GPU({ mode: "webgl" });

    const kernelV = gpu
      .createKernel(function (
        this: GPUKernelContext,
        rMin: number,
        dR: number,
        radius: number,
        diffuseness: number,
        depth: number,
        zProd: number,
        coulombRadius: number,
        e2: number
      ) {
        const r = rMin + this.thread.x * dR;
        const nuclear = -depth / (1 + Math.exp((r - radius) / diffuseness));

        let coulomb = 0;
        if (r > 1e-6) {
          if (r < coulombRadius) {
            coulomb =
              (zProd * e2 * (3 - (r * r) / (coulombRadius * coulombRadius))) /
              (2 * coulombRadius);
          } else {
            coulomb = (zProd * e2) / r;
          }
        }

        return nuclear + coulomb;
      })
      .setOutput([grid.length]);

    const kernelW = gpu
      .createKernel(function (
        this: GPUKernelContext,
        rMin: number,
        dR: number,
        radius: number,
        diffuseness: number,
        depth: number
      ) {
        const r = rMin + this.thread.x * dR;
        return -depth / (1 + Math.exp((r - radius) / diffuseness));
      })
      .setOutput([grid.length]);

    const vArr = kernelV(
      params.rMin,
      params.dR,
      realRadius,
      params.av,
      effectiveV0,
      zProd,
      coulombRadius,
      e2
    ) as number[];

    const wArr = kernelW(
      params.rMin,
      params.dR,
      imagRadius,
      params.aw,
      effectiveW0
    ) as number[];

    const points = grid.map((r, i) => ({
      r,
      v: Number(vArr[i]),
      w: Number(wArr[i]),
    }));

    gpu.destroy();

    return { points, mode: "GPU/WebGL" };
  } catch {
    const points = grid.map((r) => {
      const nuclearV =
        -effectiveV0 / (1 + Math.exp((r - realRadius) / params.av));

      let coulomb = 0;
      if (r > 1e-6) {
        if (r < coulombRadius) {
          coulomb =
            (zProd * e2 * (3 - (r * r) / (coulombRadius * coulombRadius))) /
            (2 * coulombRadius);
        } else {
          coulomb = (zProd * e2) / r;
        }
      }

      const imag =
        -effectiveW0 / (1 + Math.exp((r - imagRadius) / params.aw));

      return {
        r,
        v: nuclearV + coulomb,
        w: imag,
      };
    });

    return { points, mode: "CPU fallback" };
  }
}