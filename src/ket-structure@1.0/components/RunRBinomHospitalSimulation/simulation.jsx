import React, { useState, useEffect, useRef } from 'react';
import { render, findDOMNode } from 'react-dom';
import classNames from "classnames";
import Dygraph from 'dygraphs';
//import { checkDiscontinuities, checkDatesInfo, interventionIndicesPerDay } from "./discontinuities.jsx";
import { jStat } from "jstat";
import * as math from "mathjs";
import { hospitalization } from "./kernel.jsx";
window.hospitalization = hospitalization;

const sampleParameter = (parameters) => {
  let distribution = parameters.distribution;
  if (distribution != "uniform")
    throw new Error("Not uniform priors are not supported yet!");
  let min = parameters.min;
  let max = parameters.max;
  //return 0.5 * (min + max);
  // We allowed this case (user's can make errors)
  min = Math.min(min, max);
  max = Math.max(min, max);

  return jStat.uniform.sample(min, max)
}

/*export const simulateSingleCapacity = (curvesI, {adjustedPopulationFactor = 10000, ventilatorToIcuProportion = 0.539, icuToBedProportion = 0.149, bedToInfectedProportion = (0.034 / 0.318), maxBedsAvailable = 100, maxIcusAvailable = 10, maxVentilatorsAvailable = 5, probDeathBedIcuVent = .1, probDeathBedIcuNoVent = .1, probDeathBedNoIcu = .1, probDeathNoBed = .1} = {}) => {
  const estimationDeaths = (curvesCapacity, series, t) => {
    let bedNeeds = curvesCapacity.beds[series][t];
    let icuNeeds = curvesCapacity.icus[series][t];
    let ventilatorNeeds = curvesCapacity.ventilators[series][t];
    if (bedNeeds <= maxBedsAvailable) {
      if (icuNeeds <= maxIcusAvailable) {
        if (ventilatorNeeds <= maxVentilatorsAvailable) {
          return ventilatorNeeds * probDeathBedIcuVent;
        } else {
          return ventilatorNeeds * probDeathBedIcuNoVent;
        }
      } else {
        return bedNeeds * probDeathBedNoIcu;
      }
    } else {
      return bedNeeds * probDeathNoBed;
    }
  }
  let curvesCapacity = {
    beds: curvesI.map((realization, k) => realization.filter((v, it) => it % 5 == 0).map((v, it) => v * adjustedPopulationFactor * bedToInfectedProportion)),
    icus: curvesI.map((realization, k) => realization.filter((v, it) => it % 5 == 0).map((v, it) => v * adjustedPopulationFactor * bedToInfectedProportion * icuToBedProportion)),
    ventilators: curvesI.map((realization, k) => realization.filter((v, it) => it % 5 == 0).map((v, it) => v * adjustedPopulationFactor * bedToInfectedProportion * icuToBedProportion * ventilatorToIcuProportion)),
  }
  curvesCapacity.deaths = curvesI.map((realization, k) => realization.filter((v, it) => it % 5 == 0).map((v, it) => estimationDeaths(curvesCapacity, k, it)));
  //let curvesPercentiles = Object.fromEntries(Object.keys(curvesCapacity).map(k => [k, curvesToPercentiles(curvesCapacity[k])]));
  return curvesCapacity
}
*/
export const simulateCapacity = ({curvesS, totalN, curveSDays, parameters} = {}, optionalParameters = {}) => {
  //TODO: use all series of curvesS
  //curvesS = [...Array(curvesS[0].length).keys()].map(t => jStat.percentile(curvesS.map(c => c[t]), 0.5));
  const {n_curves= 20, epsilon_n= 3, epsilon_t= 1e-2} = optionalParameters;
  const curvesDaySpace = Math.ceil((curvesS[0] || []).length / (curveSDays + 1))
  // sampled to S/days
  console.log("::::    ", curvesS[0].length)
  curvesS = curvesS.map(curve => curve.filter((s, t) => t % curveSDays == 0));
  console.log(":::: >> ", curvesS[0].length)
  const curvesToPercentiles = (curves) => [...Array(curves[0].length).keys()].map(
    t => [t * epsilon_n * epsilon_t,
      jStat.percentile(curves.map(c => c[t]), 0.025),
      jStat.percentile(curves.map(c => c[t]), 0.025),
      jStat.percentile(curves.map(c => c[t]), 0.025),
    ]
  )
  let curvesCapacity = {
    beds: [],
    icus: [],
  ////ventilators: [],
  ////deaths: [],
  };
  for (let i = 0; i < n_curves; i++) {
    let sampledParams = Object.fromEntries(Object.keys(parameters).map(k => [k, sampleParameter(parameters[k])]));
    sampledParams["pop_size"] = totalN;
    sampledParams["min_discharge"] = curvesS[0].length + 15; // 15 days after the max
    let sampledRawCurves = curvesS.map((realization, k) => hospitalization(realization, sampledParams).hospitalization_count);
    //let sampledCurves = curvesS.map((realization, k) => hospitalization(realization, sampledParams).hospitalization_count);
    Object.keys(curvesCapacity).forEach(k => {
      //curvesCapacity[k] = curvesCapacity[k].concat(sampledCurves[k]);
      curvesCapacity[k] = curvesCapacity[k].concat(sampledRawCurves.map((sim, j) => sim[k]));
    })
  }
  //let percentileCurves = Object.fromEntries(Object.keys(curvesCapacity).map(k => [k, curvesToPercentiles(curvesCapacity[k])]));
  ////const exportedSeries = ["beds", "icus", "ventilators", "deaths"];
  const exportedSeries = ["beds", "icus"];
  const percentileCurves = [...Array(curvesCapacity[exportedSeries[0]][0].length).keys()].map(t => [t * epsilon_t * epsilon_n, ...(
  exportedSeries.map((k) => [
    jStat.percentile(curvesCapacity[k].map(c => c[t]), 0.025),
    jStat.percentile(curvesCapacity[k].map(c => c[t]), 0.5),
    jStat.percentile(curvesCapacity[k].map(c => c[t]), 0.975),
  ])
  )
  ]);
  return {
    curvesCapacity,
    percentileCurves
  };
}

export const HospitalSimulationCurvePlots = React.memo(
  ({percentileCurves, startDate, modelParameters}) => {
    startDate = startDate ? startDate : moment();
    percentileCurves = percentileCurves ? percentileCurves : [];
    //const timePercentileCurves = percentileCurves.map(([t, beds, icus, ventilators, deaths]) => [
    //  moment(startDate).add(t * 3600 * 24, "seconds").toDate(), beds, icus, ventilators, deaths
    const timePercentileCurves = percentileCurves.map(([t, beds, icus], k) => [
      moment(startDate).add(k * 3600 * 24, "seconds").toDate(), beds, icus
    ])
    const plotRef = useRef(null);
    let plot = null;
    //
    let fullNameLabel = {
      "Beds": "Beds",
      "ICUs": "ICUs",
      "Vents.": "Ventilators",
      "Deaths": "Deaths",
    }
    let legendFormatterTimer = null;
    let legendFormatter = data => {
      let ele = `
      <div class="dygraph-legend">
        ${
          data.series.map((series, i) =>
            (
            `<div class="series ${series.label} ${series.isVisible? "series-enabled": "series-disabled"}" style="color: ${series.color};">
              <span class="mark" style="background-color: ${data.dygraph.user_attrs_.colors[i]};"></span>
              <span class="label">
                ${math.isNumber(series.y)? series.label: fullNameLabel[series.label]}
              </span>
              <span class="value">
                ${math.isNumber(series.y)? math.round(series.y, 3): ""}
              </span>
              <span class="interval">
                ${!math.isNumber(series.y)? "":`
                  (
                  ${math.round(data.dygraph.rawData_[data.dygraph.rawData_.findIndex(v=> v[0] == data.x)][i+1][0], 2)
                  },
                  ${math.round(data.dygraph.rawData_[data.dygraph.rawData_.findIndex(v=> v[0] == data.x)][i+1][2], 2)}
                  )
                `}
              </span>
            </div>
            `
            )
          ).join("\n")
        }
        ${!data.x? "": `
        <div class="time">
          <span class="mark">&#x1f4c6;</span>
          <span class="label">
          </span>
          <span class="value">
            ${moment(data.x).format("MMMM Do YYYY")}
          </span>
        </div>
        `}
      </div>
    `;
      if (legendFormatterTimer) {
        clearTimeout(legendFormatterTimer);
      }
      legendFormatterTimer = setTimeout(() => {
        Array.from(plotRef.current.querySelectorAll(".dygraph-legend .series > .mark")).forEach((e, k) => {
          e.addEventListener("click", () => {
            let v = plot.visibility()[k];
            plot.setVisibility(k, !v);
          }, false);
        }, false);
      }, 200);
      return ele;
    }
    //
    const graphColors = [
      "#37a862", //B
      "#cf8f2a", //I
      "#4178bc", //V
      "#e8384f", //D
    ];
    useEffect(() => {
      plot = new Dygraph(
        plotRef.current,
        timePercentileCurves, {
          //rollPeriod: 2,
          colors: graphColors,
          customBars: true,
          errorBars: true,
          /////labels: ["t", "Beds", "ICUs", "Vents.", "Deaths"],
          labels: ["t", "Beds", "ICUs"],
          legend: 'always',
          legendFormatter: legendFormatter,
        /*underlayCallback: function(ctx, area, dygraph) {
          const xmin = timePercentileCurves[0][0];
          const xmax = timePercentileCurves[timePercentileCurves.length - 1][0];
          const drawLimit = ({maxValue, color, }) => {
            const yavg = 0.5 * (maxValue.min + maxValue.max);
            //console.log(color, yavg)
            const xl = dygraph.toDomCoords(xmin, yavg);
            const xr = dygraph.toDomCoords(xmax, yavg);
            ctx.strokeStyle = color;
            ctx.setLineDash([4, 2]);
            ctx.beginPath();
            ctx.moveTo(xl[0], xl[1]);
            ctx.lineTo(xr[0], xr[1]);
            ctx.closePath();
            ctx.stroke();
            ctx.setLineDash([]);
          };
          drawLimit({
            maxValue: modelParameters.maxBedsAvailable,
            color: graphColors[0],
          });
          drawLimit({
            maxValue: modelParameters.maxIcusAvailable,
            color: graphColors[1],
          });
          drawLimit({
            maxValue: modelParameters.maxVentilatorsAvailable,
            color: graphColors[2],
          });
        },*/
        }
      );
    });
    return (
      <div ref={ plotRef } className="simple-hospital-capacity-plot-container">
      </div>
    )
  })











