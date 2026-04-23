export type CalculationParams = {
  projectileZ: number;
  projectileA: number;
  targetZ: number;
  targetA: number;
  energyMeV: number;
  rMin: number;
  rMax: number;
  dR: number;
  v0: number;
  rv: number;
  av: number;
  w0: number;
  rw: number;
  aw: number;
};

export type PotentialPoint = {
  r: number;
  v: number;
  w: number;
};

export type PresetFile = {
  name: string;
  params: CalculationParams;
};