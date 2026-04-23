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
  vN: number;
  vC: number;
  v: number;
  w: number;
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