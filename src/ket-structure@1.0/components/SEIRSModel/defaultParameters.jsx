
const structureDefaultParameters = (params) => Object.fromEntries((Object.entries(params).map(([k, v]) => [k, {
  distribution: "uniform",
  min: v * 0.55,
  max: v * 1.45,
  mean: v
}])));

export const SEIRSModelDefaultParameters = () => structureDefaultParameters({
  b: 1.9 / 100,
  d: 0.8 / 100,
  nu: 0.8,
  rho: 1 / 2,
  alpha: 1 / 14,
  beta: 1 / 4,
  sigma: 1 / 3,
  gamma: 1 / 7,
  S0: 90,
  I0: 0,
  E0: 10,
  R0: 10,
  Nfactor: 1,
});
