export type DensityModel = "2pF" | "gaussian";
export type NNModel = "M3Y-Reid" | "M3Y-Paris";

export type CalculationParams = {
  projectileZ: number;
  projectileA: number;
  targetZ: number;
  targetA: number;

  energyMeV: number;

  rMin: number;
  rMax: number;
  dR: number;

  projectileDensityModel: DensityModel;
  targetDensityModel: DensityModel;

  r0Proj: number;
  aProj: number;

  r0Targ: number;
  aTarg: number;

  nnModel: NNModel;
  useDensityDependence: boolean;

  nReal: number;

  w0: number;
  rw: number;
  aw: number;

  rc: number;
};

export type PotentialPoint = {
  r: number;
  vD: number;
  vEX: number;
  vN: number;
  vC: number;
  v: number;
  w: number;
  kLocal: number;
};

export type CalculationSummary = {
  elapsedMs: number;
  pointsCount: number;
  vMin: number;
  rAtVMin: number;
  vBarrier: number;
  rAtBarrier: number;
  maxIterations: number;
};

export type CalculationResult = {
  points: PotentialPoint[];
  mode: string;
  summary: CalculationSummary;
};

export type Preset = {
  id: number;
  name: string;
  payload: CalculationParams;
};

export type PresetFile = {
  name: string;
  params: CalculationParams;
};