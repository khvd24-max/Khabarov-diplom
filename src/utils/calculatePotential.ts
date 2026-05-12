import type {
  CalculationParams,
  CalculationResult,
  CalculationSummary,
  PotentialPoint,
} from "../types";

const E2 = 1.43996448;
const HBARC = 197.3269804;
const AMU_MEV = 931.49410242;
const FOUR_PI = 4 * Math.PI;

type DensityTable = {
  r: number[];
  rho: number[];
  step: number;
};

function safePositive(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildGrid(params: CalculationParams): number[] {
  const rMin = Math.max(0, params.rMin);
  const rMax = Math.max(rMin + 1e-6, params.rMax);
  const dR = safePositive(params.dR, 0.1);
  const n = Math.floor((rMax - rMin) / dR) + 1;

  return Array.from({ length: n }, (_, i) =>
    Number((rMin + i * dR).toFixed(6))
  );
}

function trapz(x: number[], y: number[]) {
  let sum = 0;

  for (let i = 1; i < x.length; i += 1) {
    const dx = x[i] - x[i - 1];
    sum += 0.5 * dx * (y[i] + y[i - 1]);
  }

  return sum;
}

function interpolate(table: DensityTable, x: number) {
  if (x <= table.r[0]) return table.rho[0];
  const last = table.r.length - 1;
  if (x >= table.r[last]) return 0;

  const idx = Math.floor(x / table.step);
  const i0 = clamp(idx, 0, last - 1);
  const x0 = table.r[i0];
  const x1 = table.r[i0 + 1];
  const y0 = table.rho[i0];
  const y1 = table.rho[i0 + 1];

  if (x1 === x0) return y0;
  const t = (x - x0) / (x1 - x0);
  return y0 + (y1 - y0) * t;
}

function rawDensity(
  r: number,
  A: number,
  model: "2pF" | "gaussian",
  r0: number,
  a: number
) {
  const c = safePositive(r0, 1.05) * Math.cbrt(Math.max(1, A));
  const z = Math.max(0.05, a);

  if (model === "gaussian") {
    const sigma = Math.max(0.2, z);
    return Math.exp(-(r * r) / (2 * sigma * sigma));
  }

  return 1 / (1 + Math.exp((r - c) / z));
}

function prepareDensity(
  A: number,
  model: "2pF" | "gaussian",
  r0: number,
  a: number,
  maxR: number,
  step: number
): DensityTable {
  const n = Math.floor(maxR / step) + 1;
  const r = Array.from({ length: n }, (_, i) => i * step);
  const raw = r.map((ri) => rawDensity(ri, A, model, r0, a));
  const measure = raw.map((value, i) => FOUR_PI * r[i] * r[i] * value);
  const norm = trapz(r, measure) || 1;
  const rho = raw.map((value) => value / norm);

  return { r, rho, step };
}

function overlapIntegral(R: number, projectile: DensityTable, target: DensityTable) {
  const r = projectile.r;
  const values = r.map((ri) => {
    const rhoP = interpolate(projectile, ri);
    const rhoT = interpolate(target, Math.abs(R - ri));
    return FOUR_PI * ri * ri * rhoP * rhoT;
  });

  return trapz(r, values);
}

function nnDirectKernel(s: number, model: "M3Y-Reid" | "M3Y-Paris") {
  const x = Math.max(0.1, s);

  if (model === "M3Y-Paris") {
    return (
      11061.625 * Math.exp(-4 * x) / (4 * x) -
      2537.5 * Math.exp(-2.5 * x) / (2.5 * x)
    );
  }

  return (
    7999.0 * Math.exp(-4 * x) / (4 * x) -
    2134.25 * Math.exp(-2.5 * x) / (2.5 * x)
  );
}

function exchangeStrength(
  energyMeV: number,
  model: "M3Y-Reid" | "M3Y-Paris"
) {
  if (model === "M3Y-Paris") {
    return -590 * (1 - 0.002 * energyMeV);
  }

  return -276 * (1 - 0.005 * energyMeV);
}

function densityDependenceFactor(overlap: number, enabled: boolean) {
  if (!enabled) return 1;
  return Math.max(0.3, 1 - 1.8 * overlap);
}

function jHat1(x: number) {
  const ax = Math.abs(x);

  if (ax < 1e-4) {
    return 1 - (x * x) / 10;
  }

  return (3 * (Math.sin(x) - x * Math.cos(x))) / (x * x * x);
}

function coulombPotential(
  R: number,
  Zp: number,
  Zt: number,
  rc: number,
  Ap: number,
  At: number
) {
  const Rc = safePositive(rc, 1.25) * (Math.cbrt(Ap) + Math.cbrt(At));

  if (R < 1e-8) {
    return (3 * Zp * Zt * E2) / (2 * Rc);
  }

  if (R <= Rc) {
    return (Zp * Zt * E2 * (3 - (R * R) / (Rc * Rc))) / (2 * Rc);
  }

  return (Zp * Zt * E2) / R;
}

function imaginaryPotential(R: number, params: CalculationParams) {
  const aW = Math.max(0.05, params.aw);
  const RW =
    params.rw * (Math.cbrt(params.projectileA) + Math.cbrt(params.targetA));

  return -params.w0 / (1 + Math.exp((R - RW) / aW));
}

function localMomentum(
  params: CalculationParams,
  R: number,
  vN: number,
  vC: number
) {
  const mu =
    (AMU_MEV * params.projectileA * params.targetA) /
    (params.projectileA + params.targetA);
  const eCm =
    (params.energyMeV * params.targetA) /
    (params.projectileA + params.targetA);
  const kinetic = Math.max(0, eCm - vN - vC);

  return Math.sqrt((2 * mu * kinetic) / (HBARC * HBARC));
}

function buildSummary(points: PotentialPoint[], elapsedMs: number, maxIterations: number): CalculationSummary {
  const minPoint = points.reduce((best, point) => (point.v < best.v ? point : best), points[0]);
  const barrierPoint = points.reduce((best, point) => (point.v > best.v ? point : best), points[0]);

  return {
    elapsedMs,
    pointsCount: points.length,
    vMin: minPoint.v,
    rAtVMin: minPoint.r,
    vBarrier: barrierPoint.v,
    rAtBarrier: barrierPoint.r,
    maxIterations,
  };
}

export function calculatePotential(params: CalculationParams): CalculationResult {
  const startedAt = performance.now();

  const Rgrid = buildGrid(params);
  const densityStep = Math.min(0.12, Math.max(0.04, params.dR / 2));
  const densityMaxR =
    Math.max(params.rMax + 8, 18) +
    Math.cbrt(params.projectileA) +
    Math.cbrt(params.targetA);

  const projectileDensity = prepareDensity(
    params.projectileA,
    params.projectileDensityModel,
    params.r0Proj,
    params.aProj,
    densityMaxR,
    densityStep
  );

  const targetDensity = prepareDensity(
    params.targetA,
    params.targetDensityModel,
    params.r0Targ,
    params.aTarg,
    densityMaxR,
    densityStep
  );

  const massScale = 4.2 + 0.2 * Math.cbrt(params.projectileA + params.targetA);
  const exStrength = exchangeStrength(params.energyMeV, params.nnModel);
  let globalMaxIterations = 0;

  const points = Rgrid.map((R) => {
    const overlap = overlapIntegral(R, projectileDensity, targetDensity);
    const ddFactor = densityDependenceFactor(overlap, params.useDensityDependence);
    const sKernel = R + 0.6;
    const directKernel = nnDirectKernel(sKernel, params.nnModel);

    const vD = overlap * directKernel * massScale * ddFactor;
    const vC = coulombPotential(
      R,
      params.projectileZ,
      params.targetZ,
      params.rc,
      params.projectileA,
      params.targetA
    );

    let vEX = 0;
    let kLocal = 0;
    let previous = 0;
    let iter = 0;

    for (iter = 1; iter <= 20; iter += 1) {
      const vNTrial = params.nReal * (vD + previous);
      kLocal = localMomentum(params, R, vNTrial, vC);

      const sEff =
        0.8 +
        0.18 * (Math.max(0.05, params.aProj) + Math.max(0.05, params.aTarg)) +
        0.12 * R;

      vEX =
        overlap *
        exStrength *
        ddFactor *
        Math.exp(-R / 4.5) *
        jHat1(kLocal * sEff);

      if (Math.abs(vEX - previous) < 1e-3) {
        break;
      }

      previous = 0.5 * previous + 0.5 * vEX;
    }

    globalMaxIterations = Math.max(globalMaxIterations, iter);

    const vN = params.nReal * (vD + vEX);
    const w = imaginaryPotential(R, params);

    return {
      r: R,
      vD,
      vEX,
      vN,
      vC,
      v: vN + vC,
      w,
      kLocal,
    };
  });

  const elapsedMs = performance.now() - startedAt;

  return {
    points,
    mode: `DFM-inspired ${params.nnModel}${
      params.useDensityDependence ? " + density dependence" : ""
    }`,
    summary: buildSummary(points, elapsedMs, globalMaxIterations),
  };
}