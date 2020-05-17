
const structureDefaultParameters = (params) => Object.fromEntries((Object.entries(params).map(([k, v]) => [k, {
  distribution: "uniform",
  min: v * 0.55,
  max: v * 1.45,
  mean: v
}])));

export const HospitalCapacityDefaultParams = () => structureDefaultParameters({
  pop_size: 7225,
  per_symp: 0.7,
  per_hosp: 0.02989758,
  per_ccu: 0.1,
  u_hosp_nc: 12,
  disp_hosp_nc: 3.9,
  u_hosp_cc: 22,
  disp_hosp_cc: 12,
  adjustedPopulationFactor: 1,
})