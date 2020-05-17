
const structureDefaultParameters = (params) => Object.fromEntries((Object.entries(params).map(([k, v]) => [k, {
  distribution: "uniform",
  min: v * 0.55,
  max: v * 1.45,
  mean: v
}])));


export const CommonHospitalCapacityDefaultParams = () => structureDefaultParameters({
  ventilatorToIcuProportion: 0.539,
  icuToBedProportion: 0.149,
  bedToInfectedProportion: 0.034 / 0.318,
  maxBedsAvailable: 200,
  maxIcusAvailable: 10,
  maxVentilatorsAvailable: 5,
  probDeathBedIcuVent: .1,
  probDeathBedIcuNoVent: .3,
  probDeathBedNoIcu: .4,
  probDeathNoBed: .6,
  adjustedPopulationFactor: 1,
})