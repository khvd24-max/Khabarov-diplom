import type { CalculationParams, PotentialPoint } from "../types";

const E2 = 1.44;

function buildGrid(params: CalculationParams): number[] {
  const n = Math.floor((params.rMax - params.rMin) / params.dR) + 1;
  return Array.from({ length: n }, (_, i) => params.rMin + i * params.dR);
}

function effectiveRadius(r0: number, A: number): number {
  return r0 * Math.cbrt(A);
}

function effectiveDiffuseness(a: number): number {
  return Math.max(a, 0.05);
}

function densityModelFactor(model: "2pF" | "gaussian"): number {
  return model === "gaussian" ? 0.92 : 1.0;
}

function nnStrength(model: "M3Y-Reid" | "M3Y-Paris"): number {
  return model === "M3Y-Paris" ? 52 : 58;
}

function densityDependenceFactor(useDensityDependence: boolean): number {
  return useDensityDependence ? 0.88 : 1.0;
}

function energyFactor(energyMeV: number): number {
  return 1 + 0.0015 * energyMeV;
}

function realNuclearPotential(R: number, params: CalculationParams): number {
  const Rp = effectiveRadius(params.r0Proj, params.projectileA);
  const Rt = effectiveRadius(params.r0Targ, params.targetA);

  const aP = effectiveDiffuseness(params.aProj);
  const aT = effectiveDiffuseness(params.aTarg);

  const Rn = Rp + Rt;
  const aN = 0.5 * (aP + aT);

  const baseV0 =
    nnStrength(params.nnModel) *
    densityModelFactor(params.projectileDensityModel) *
    densityModelFactor(params.targetDensityModel) *
    densityDependenceFactor(params.useDensityDependence) *
    energyFactor(params.energyMeV);

  const ws = 1 / (1 + Math.exp((R - Rn) / aN));

  return -params.nReal * baseV0 * ws;
}

function coulombPotential(
  R: number,
  Zp: number,
  Zt: number,
  rc: number,
  Ap: number,
  At: number
): number {
  const Rc = rc * (Math.cbrt(Ap) + Math.cbrt(At));

  if (R < 1e-8) {
    return (3 * Zp * Zt * E2) / (2 * Rc);
  }

  if (R < Rc) {
    return (Zp * Zt * E2 * (3 - (R * R) / (Rc * Rc))) / (2 * Rc);
  }

  return (Zp * Zt * E2) / R;
}

function woodsSaxonImag(R: number, params: CalculationParams): number {
  const aW = Math.max(params.aw, 0.05);
  const RW =
    params.rw * (Math.cbrt(params.projectileA) + Math.cbrt(params.targetA));

  return -params.w0 / (1 + Math.exp((R - RW) / aW));
}

export function calculatePotential(params: CalculationParams): {
  points: PotentialPoint[];
  mode: string;
} {
  const Rgrid = buildGrid(params);

  const points = Rgrid.map((R) => {
    const vN = realNuclearPotential(R, params);
    const vC = coulombPotential(
      R,
      params.projectileZ,
      params.targetZ,
      params.rc,
      params.projectileA,
      params.targetA
    );
    const w = woodsSaxonImag(R, params);

    return {
      r: R,
      vN,
      vC,
      v: vN + vC,
      w,
    };
  });

  return {
    points,
    mode: "Calc",
  };
}