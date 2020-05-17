import React, { useState, useEffect, useRef } from 'react';
import { render, findDOMNode } from 'react-dom';
import classNames from "classnames";
import Dygraph from 'dygraphs';
import { checkDiscontinuities, checkDatesInfo, interventionIndicesPerDay } from "./discontinuities.jsx";
import { jStat } from "jstat";
import * as math from "mathjs";

const sampleSimData = [
  {
    "id": 1,
    "name": "Default dynamics",
    "startDate": "April 29th 2020",
    "endDate": "May 31st 2020",
    "infectionModel": {
      "type": "SIR",
      "parameters": {
        "b": {
          "distribution": "uniform",
          "min": 0.01615,
          "max": 0.021849999999999998,
          "mean": 0.019
        },
        "d": {
          "distribution": "uniform",
          "min": 0.0068,
          "max": 0.0092,
          "mean": 0.008
        },
        "nu": {
          "distribution": "uniform",
          "min": 0.68,
          "max": 0.9199999999999999,
          "mean": 0.8
        },
        "rho": {
          "distribution": "uniform",
          "min": 0.425,
          "max": 0.575,
          "mean": 0.5
        },
        "alpha": {
          "distribution": "uniform",
          "min": 0.06071428571428571,
          "max": 0.08214285714285713,
          "mean": 0.07142857142857142
        },
        "beta": {
          "distribution": "uniform",
          "min": 0.2125,
          "max": 0.2875,
          "mean": 0.25
        },
        "sigma": {
          "distribution": "uniform",
          "min": 0.2833333333333333,
          "max": 0.3833333333333333,
          "mean": 0.3333333333333333
        },
        "gamma": {
          "distribution": "uniform",
          "min": 0.12142857142857141,
          "max": 0.16428571428571426,
          "mean": 0.14285714285714285
        },
        "S0": {
          "distribution": "uniform",
          "min": 0.2125,
          "max": 0.2875,
          "mean": 0.25
        },
        "I0": {
          "distribution": "uniform",
          "min": 0.2125,
          "max": 0.2875,
          "mean": 0.25
        },
        "E0": {
          "distribution": "uniform",
          "min": 0.2125,
          "max": 0.2875,
          "mean": 0.25
        },
        "R0": {
          "distribution": "uniform",
          "min": 0.2125,
          "max": 0.2875,
          "mean": 0.25
        },
        "N0": {
          "distribution": "uniform",
          "min": 0.85,
          "max": 1.15,
          "mean": 1
        }
      }
    }
  },
  {
    "id": 2,
    "name": "SIR",
    "startDate": "June 1st 2020",
    "endDate": "September 22nd 2020",
    "infectionModel": {
      "type": "SIR",
      "parameters": {
        "b": {
          "distribution": "uniform",
          "min": 0.016149999999999998,
          "max": 0.021849999999999998,
          "mean": 0.019
        },
        "d": {
          "distribution": "uniform",
          "min": 0.0068,
          "max": 0.0092,
          "mean": 0.008
        },
        "nu": {
          "distribution": "uniform",
          "min": 0.68,
          "max": 0.9199999999999999,
          "mean": 0.8
        },
        "rho": {
          "distribution": "uniform",
          "min": 0.425,
          "max": 0.575,
          "mean": 0.5
        },
        "alpha": {
          "distribution": "uniform",
          "min": 0,
          "max": 0,
          "mean": 0
        },
        "beta": {
          "distribution": "uniform",
          "min": 10,
          "max": 100,
          "mean": 55
        },
        "sigma": {
          "distribution": "uniform",
          "min": 0.2833333333333333,
          "max": 0.3833333333333333,
          "mean": 0.3333333333333333
        },
        "gamma": {
          "distribution": "uniform",
          "min": 0.12142857142857141,
          "max": 0.16428571428571426,
          "mean": 0.14285714285714285
        },
        "S0": {
          "distribution": "uniform",
          "min": 0.2125,
          "max": 0.2875,
          "mean": 0.25
        },
        "I0": {
          "distribution": "uniform",
          "min": 0.2125,
          "max": 0.2875,
          "mean": 0.25
        },
        "E0": {
          "distribution": "uniform",
          "min": 0.2125,
          "max": 0.2875,
          "mean": 0.25
        },
        "R0": {
          "distribution": "uniform",
          "min": 0.2125,
          "max": 0.2875,
          "mean": 0.25
        },
        "N0": {
          "distribution": "uniform",
          "min": 0.85,
          "max": 1.15,
          "mean": 1
        }
      }
    }
  },
  {
    "id": 3,
    "name": "New intervention",
    "startDate": "September 23rd 2020",
    "endDate": "June 3rd 2021",
    "infectionModel": {
      "type": "SIR",
      "parameters": {
        "b": {
          "distribution": "uniform",
          "min": 0.016149999999999998,
          "max": 0.021849999999999998,
          "mean": 0.019
        },
        "d": {
          "distribution": "uniform",
          "min": 0.0068,
          "max": 0.0092,
          "mean": 0.008
        },
        "nu": {
          "distribution": "uniform",
          "min": 0.68,
          "max": 0.9199999999999999,
          "mean": 0.8
        },
        "rho": {
          "distribution": "uniform",
          "min": 0.425,
          "max": 0.575,
          "mean": 0.5
        },
        "alpha": {
          "distribution": "uniform",
          "min": 0.06071428571428571,
          "max": 0.08214285714285713,
          "mean": 0.07142857142857142
        },
        "beta": {
          "distribution": "uniform",
          "min": 50,
          "max": 100,
          "mean": 75
        },
        "sigma": {
          "distribution": "uniform",
          "min": 0.2833333333333333,
          "max": 0.3833333333333333,
          "mean": 0.3333333333333333
        },
        "gamma": {
          "distribution": "uniform",
          "min": 0.12142857142857141,
          "max": 0.16428571428571426,
          "mean": 0.14285714285714285
        },
        "S0": {
          "distribution": "uniform",
          "min": 0.2125,
          "max": 0.2875,
          "mean": 0.25
        },
        "I0": {
          "distribution": "uniform",
          "min": 0.2125,
          "max": 0.2875,
          "mean": 0.25
        },
        "E0": {
          "distribution": "uniform",
          "min": 0.2125,
          "max": 0.2875,
          "mean": 0.25
        },
        "R0": {
          "distribution": "uniform",
          "min": 0.2125,
          "max": 0.2875,
          "mean": 0.25
        },
        "Nfactor": {
          "distribution": "uniform",
          "min": 0.85,
          "max": 1.15,
          "mean": 1
        }
      }
    }
  }
];


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


export const simulateParameters = (interventions, optionalParams) => {
  const t0 = new Date().getTime()
  let {n_curves = 20} = (optionalParams || {});
  const curves = [...Array(n_curves).keys()].map(e => simulateOneSampleParameters(interventions, optionalParams));
  const t1 = new Date().getTime()
  console.log("T:", t1 - t0)
  return curves;
};
export const simulateOneSampleParameters = (interventions, optionalParams) => {
  const {totalDays, startDates, endDates, minStartDate, maxStartDate, minEndDate, maxEndDate} = checkDatesInfo(interventions);
  const T = Math.min(60 * 30, totalDays);
  let indices = interventionIndicesPerDay(interventions);
  for (var i = indices.length; i < T; i++) {
    indices.append(indices[i - 1]);
  }
  let sampleParams = currentRndParams => Object.fromEntries(Object.entries(currentRndParams).map(([key, params]) => [key, sampleParameter(params)]));
  let paramInterventions = interventions.map((interv) => sampleParams(interv.infectionModel.parameters))
  //console.log(T, paramInterventions)
  let {epsilon_t = 1e-2, epsilon_n = 100} = (optionalParams || {});

  const dt = epsilon_t;
  const deltan = epsilon_n;

  let {S0, I0, E0, R0, Nfactor} = paramInterventions[indices[0]];

  S0 *= Nfactor;
  E0 *= Nfactor;
  I0 *= Nfactor;
  R0 *= Nfactor;
  //const beta = tau * c;
  let N0 = S0 + I0 + E0 + R0;
  let dS,
    dE,
    dI,
    dR,
    dN;
  let S = S0,
    E = E0,
    I = I0,
    R = R0,
    N = N0;

  let output = {
    S: [S0],
    E: [E0],
    I: [I0],
    R: [R0],
    N: [N0]
  };

  for (let t = 1; t < Number.parseInt(T / epsilon_t); t++) {
    let tx = Number.parseInt(t * epsilon_t);
    let currentParams = paramInterventions[indices[tx]];
    //let params = Object.fromEntries(Object.entries(currentRndParams).map(([key, params]) => [key, sampleParameter(params)]));
    //let {b, d, nu, rho, alpha, beta, sigma, gamma, S0, I0, E0, R0, N0} = currentParams;
    let {b, d, nu, rho, alpha, beta, sigma, gamma} = currentParams;
    /*S0 /= N0;
    E0 /= N0;
    I0 /= N0;
    R0 /= N0;*/
    b = b / 365; // Adjusted by year
    d = d / 365; // Adjusted by year
    dS = b * (1 - nu) * N - beta * S * I / N - d * S + alpha * R - rho * S;
    dE = beta * S * I / N - sigma * E - d * E;
    dI = sigma * E - gamma * I - d * I;
    dR = b * nu * N + gamma * I - d * R - alpha * R + rho * S;
    dN = (b - d) * N;
    S += dS * dt;
    E += dE * dt;
    I += dI * dt;
    R += dR * dt;
    N += dN * dt;
    if (t % epsilon_n == 0) {
      output.S.push(S);
      output.E.push(E);
      output.I.push(I);
      output.R.push(R);
      output.N.push(N);
    }
  }
  return output
}

export const getSimulationCurves = ({interventions}) => {
  const epsilon_n = 3;
  const epsilon_t = 1e-2;
  /*{
    const curves = simulateOneSampleParameters(interventions, {
      n_curves: 500,
      epsilon_n: 10,
      epsilon_t: epsilon_t
    })
    console.log("S10->", curves.S.length)
  }
  {
    const curves = simulateOneSampleParameters(interventions, {
      n_curves: 500,
      epsilon_n: 50,
      epsilon_t: epsilon_t
    })
    console.log("S50->", curves.S.length)
  }
  {
    const curves = simulateOneSampleParameters(interventions, {
      n_curves: 500,
      epsilon_n: 200,
      epsilon_t: epsilon_t
    })
    console.log("S200->", curves.S.length)
  }*/
  const curves = simulateParameters(interventions, {
    n_curves: 20,
    epsilon_n: epsilon_n,
    epsilon_t: epsilon_t
  })
  console.log("S->", curves[0]["S"].length)
  const curvePercentiles = Object.fromEntries(["S", "E", "I", "R", "N"].map((k) => [k, Object.keys([...Array(curves[0][k].length)]).map(t => jStat.percentile(curves.map(c => c[k][t]), 0.3))]))
  const percentileCurves = [...Array(curves[0]["S"].length).keys()].map(t => [t * epsilon_t * epsilon_n, ...(
  //["S", "E", "I", "R", "N"].map((k) => [
  ["S", "E", "I", "R"].map((k) => [
    jStat.percentile(curves.map(c => c[k][t]), 0.025),
    jStat.percentile(curves.map(c => c[k][t]), 0.5),
    jStat.percentile(curves.map(c => c[k][t]), 0.975),
  ])
  )
  ]);
  const {totalDays, startDates, endDates, minStartDate, maxStartDate, minEndDate, maxEndDate} = checkDatesInfo(interventions);

  return ({
    dates: {
      totalDays,
      startDates,
      endDates,
      minStartDate,
      maxStartDate,
      minEndDate,
      maxEndDate
    },
    curves,
    percentileCurves
  });
}


export const SimulationCurvePlots = React.memo(
  ({percentileCurves, startDate}) => {
    startDate = startDate ? startDate : moment();
    percentileCurves = percentileCurves ? percentileCurves : [];
    const timePercentileCurves = percentileCurves.map(([t, S, E, I, R]) => [
      //moment(startDate).add(t, "days").toDate(), S, E, I, R
      moment(startDate).add(t * 3600 * 24, "seconds").toDate(), S, E, I, R
    ])
    const plotRef = useRef(null);
    const legendRef = useRef(null);
    let plot = null;
    //
    let fullNameLabel = {
      "S": "Susceptibles",
      "E": "Exposed",
      "I": "Infected",
      "R": "Recovered",
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
    useEffect(() => {
      plot = new Dygraph(
        plotRef.current,
        timePercentileCurves, {
          rollPeriod: 1,
          colors: [
            "#cf8f2a", //S
            "#7a71f6", //E
            "#e8384f", //I
            "#37a862", //R
          ],
          //rollPeriod: 2,
          customBars: true,
          errorBars: true,
          labels: ["t", "S", "E", "I", "R"],
          //
          //labelsDiv: legendRef.current,
          legend: 'always',
          legendFormatter: legendFormatter,
        },
      );
    });
    return (
      <React.Fragment>
        <div ref={ plotRef } className="SEIRS-plot-container"></div>
        <div ref={ legendRef } className="SEIRS-legend-container"></div>
      </React.Fragment>
    )
  })

export const SimulationSICurvePlot = React.memo(
  ({percentileCurves}) => {
    //startDate = startDate ? startDate : moment();
    percentileCurves = percentileCurves ? percentileCurves : [];
    const timePercentileCurves = percentileCurves.map(([t, S, E, I, R]) => [
      S[1], I[1]
    ])
    const plotRef = useRef(null);
    let plot = null;
    let colorLabels = {
      "S": "#cf8f2a",
      "I": "#e8384f",
    }
    let fullNameLabel = {
      "S": "Susceptibles",
      "I": "Infected",
    }
    let legendFormatter = data => `
      <div class="dygraph-legend" style="width:150px;">
        ${
          data.series.map((series, i) =>
            (
            `<div class="series ${series.label}" style="color: ${series.color};">
              <span class="mark" style="background-color: ${data.dygraph.user_attrs_.colors[i]};"></span>
              <span class="label">
                ${math.isNumber(series.y)? series.label: fullNameLabel[series.label]}
              </span>
              <span class="value">
                ${math.isNumber(series.y)? math.round(series.y, 5): ""}
              </span>
            </div>
            `
            )
          ).join("\n")
        }
        <div class="series S" style="color: ${colorLabels["S"]};">
          <span class="mark" style="background-color: ${colorLabels["S"]};"></span>
          <span class="label">
            ${math.isNumber(data.x)? "S": fullNameLabel["S"]}
          </span>
          <span class="value">
            ${math.isNumber(data.x)? math.round(data.x, 5): ""}
          </span>
        </div>
    `;
    useEffect(() => {
      plot = new Dygraph(
        plotRef.current,
        timePercentileCurves, {
          //rollPeriod: 2,
          customBars: !true,
          errorBars: !true,
          labels: ["S", "I"],
          xlabel: 'Susceptibles (S)',
          ylabel: 'Infected (I)',
          colors: [colorLabels['I']],
          legend: 'always',
          legendFormatter: legendFormatter,
        }
      );
    });
    return (
      <div ref={ plotRef } className="SEIRS-plot-container-SI">
      </div>
    )
  })










