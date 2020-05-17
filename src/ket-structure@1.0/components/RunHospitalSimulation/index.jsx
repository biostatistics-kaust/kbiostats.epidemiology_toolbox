import React, { Fragment, useState, useContext, useEffect } from 'react';
import { createPortal } from "react-dom";
import { Route, useHistory, Link, withRouter } from "react-router-dom";
import classNames from "classnames";
import SplitPane from 'react-split-pane/lib/SplitPane.js';
import Resizer from 'react-split-pane/lib/Resizer.js';
import Pane from 'react-split-pane/lib/Pane.js';
import TeX from '@matejmazur/react-katex';
import 'katex/dist/katex.min.css'; // It does not work from less file
import { Pre, Collapse, Tooltip, AnchorButton, Button, Intent, Spinner, Menu, MenuDivider, MenuItem, Popover, Position, Dialog, H1, H2, H3, H5, Classes } from "@blueprintjs/core";
import { GlobalContext, emptyInterventionState } from '../../context/GlobalState';
import { simulateCapacity, HospitalSimulationCurvePlots } from "./simulation.jsx";
import { HospitalCapacityParametersDialog } from "./parameters.jsx";
import { jStat } from "jstat";
import * as math from "mathjs";
import "./index.less";

const CollapsibleDataLog = ({model}) => {
  const [isOpen, setOpen] = useState(false);
  const handleClick = () => setOpen(!isOpen)
  return (
    <React.Fragment>
      <Button className="button-log-details" onClick={ handleClick }>
        { isOpen ? "Hide" : "Show" } model details
      </Button>
      <Collapse className="log-details" isOpen={ isOpen }>
        <Pre>{ JSON.stringify(model, null, 2) }</Pre>
      </Collapse>
    </React.Fragment>
  );
}

console.log(jStat)
window.jStat = jStat

//const checkDiscontinuitiesFragment = (interventions) => {  
//}

const SimulationInfoFragment = ({simulations, capacity}) => {
  if (!capacity) return <div></div>;
  console.log(capacity);
  const curves = capacity.percentileCurves;
  if (curves.length == 0) {
    return <div></div>;
  }
  //const argmax = (v, {key}) => v.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
  const argmax = (v, {key}) => v.map((x, i) => [x, i]).reduce((r, a) => (key(a[0]) > key(r[0]) ? a : r))[1];
  const indices = {
    "beds": 1,
    "icus": 2,
    "ventilators": 3,
    "deaths": 4,
    "lowci": 0,
    "highci": 2,
    "median": 1,
    "time": 0,
  };
  const float2date = (v) => moment(simulations.dates.minStartDate).add(v * 24 * 3600, "seconds").format("MMMM Do YYYY")
  const indexBedPeak = index => argmax(curves, {
    key: (v) => v[indices.beds][index]
  });
  const getMinMax = (a, b,) => [Math.min(a, b), Math.max(a, b)]
  const indexMedianBedPeak = indexBedPeak(indices.median);
  console.log(indexMedianBedPeak)
  const adjustedTimeIntegrationFactor = (curves[curves.length - 1][0] - curves[0][0]) / curves.length;
  //
  const medianBedPeak = curves[indexMedianBedPeak][indices.time];
  const [lowBedPeak, highBedPeak] = getMinMax(curves[indexBedPeak(indices.highci)][indices.time], curves[indexBedPeak(indices.lowci)][indices.time]);
  //
  const cumulativeQuantity = (series, index) => math.round(jStat.sum(curves.map((x, i) => x[series][index])) * adjustedTimeIntegrationFactor, 2)
  //
  const capacityAtPeak = (series, index) => math.round(curves[indexMedianBedPeak][series][index], 2)

  const cumulativeQuantityWidget = (series, label) => (
    <tr key={ `cumulative-quantity-${series}` }>
      <td>
        { label }
      </td>
      <td className="value">
        <div>
          { cumulativeQuantity(series, indices.median) }
        </div>
      </td>
      <td className="confidence-interval">
        <div>(
          <span className="low">{ cumulativeQuantity(series, indices.lowci) },</span>
          <span className="hight">{ cumulativeQuantity(series, indices.highci) }</span> )
        </div>
      </td>
    </tr>
  )
  const capacityAtPeakWidget = (series, label) => (
    <tr key={ `peak-capacity-${series}` }>
      <td>
        { label }
      </td>
      <td className="value">
        <div>
          { capacityAtPeak(series, indices.median) }
        </div>
      </td>
      <td className="confidence-interval">
        <div>(
          <span className="low">{ capacityAtPeak(series, indices.lowci) },</span>
          <span className="hight">{ capacityAtPeak(series, indices.highci) }</span> )
        </div>
      </td>
    </tr>
  )
  //
  return (
    <table className="bp3-html-table bp3-html-table-condensed bp3-html-table-striped bp3-interactive bp3-small">
      <thead>
        <tr>
          <th></th>
          <th className="value">
          </th>
          <th className="confidence-interval">
            95% prediction interval
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Peak hospital use</td>
          <td className="value">
            <div>
              { math.round(medianBedPeak, 2) } days after the outbreak.
            </div>
            <div>
              (
              { float2date(medianBedPeak) })
            </div>
          </td>
          <td className="confidence-interval">
            <div>(
              <span className="low">{ math.round(lowBedPeak, 2) },</span>
              <span className="hight">{ math.round(highBedPeak, 2) }</span> )
            </div>
            <div>(
              <span className="low">{ float2date(lowBedPeak) },</span>
              <span className="hight">{ float2date(highBedPeak) }</span> )
            </div>
          </td>
        </tr>
        { capacityAtPeakWidget(indices.beds, "Beds' use at peak") }
        { capacityAtPeakWidget(indices.ventilators, "Ventilators' use at peak") }
        { capacityAtPeakWidget(indices.icus, "ICUs' use at peak") }
        { cumulativeQuantityWidget(indices.deaths, "Cumulative deaths") }
        { cumulativeQuantityWidget(indices.beds, "Cumulative beds") }
        { cumulativeQuantityWidget(indices.icus, "Cumulative ICUs") }
        { cumulativeQuantityWidget(indices.ventilators, "Cumulative ventilators") }
      </tbody>
    </table>
  );
}
/*
cumulativeDeaths
peakHospitalUse
bedsUsedAtPeak
icuBedsUsedAtPeak
ventilatorsUsedAtPeak
excessBedDemand
excessIcuDemand
cumulativeBedDays
cumulativeIcuDays
cumulativeVentilatorDays
*/


/*
const ventilatorToIcuProportion = 0.539
  const icuToBedProportion = 0.149
  //const deathToBedProportion = 0.318
  const bedToInfectedProportion = 0.034 / 0.318 // proportion death / infected * bed / death

  const maxBedsAvailable = 1;
  const maxIcusAvailable = 1;
  const maxVentilatorsAvailable = 1;

  const probDeathBedIcuVent = .1;
  const probDeathBedIcuNoVent = .1;
  const probDeathBedNoIcu = .1;
  const probDeathNoBed = .1;
*/
/*const sampleParameters = {
  ventilatorToIcuProportion: {
    distribution: "uniform",
    min: 0.45,
    max: 0.57,
  },
  icuToBedProportion: {
    distribution: "uniform",
    min: 0.13,
    max: 0.16,
  },
  bedToInfectedProportion: {
    distribution: "uniform",
    min: 0.08,
    max: 0.12,
  },
  maxBedsAvailable: {
    distribution: "uniform",
    min: 10,
    max: 20,
  },
  maxIcusAvailable: {
    distribution: "uniform",
    min: 5,
    max: 7,
  },
  maxVentilatorsAvailable: {
    distribution: "uniform",
    min: 3,
    max: 5,
  },
  probDeathBedIcuVent: {
    distribution: "uniform",
    min: .3,
    max: .5,
  },
  probDeathBedIcuNoVent: {
    distribution: "uniform",
    min: .2,
    max: .5,
  },
  probDeathBedNoIcu: {
    distribution: "uniform",
    min: .1,
    max: .5,
  },
  probDeathNoBed: {
    distribution: "uniform",
    min: .1,
    max: .3,
  },
};
*/
import { CommonHospitalCapacityDefaultParams } from "./defaultParameters.jsx";

const sampleParameters = CommonHospitalCapacityDefaultParams();

export const RunHospitalSimulation = () => {
  let history = useHistory();
  const {interventions, simulations, setSimulations} = useContext(GlobalContext);
  const [capacity, setCapacity] = useState({});
  const [modelParameters, setModelParameters] = useState({
    ...sampleParameters
  });

  const handleClose = () => {
    history.goBack();
  }

  //window.simulations = simulations

  let curvesI = simulations.curves.map(v => v.I);
  //console.log("")
  //console.log(curvesI)
  //console.log(capacity)
  if (curvesI.length == 0) {
    return <div> </div>
  }

  const simulate = (evt, m) => {
    m = m || modelParameters;
    setCapacity(simulateCapacity({
      curvesI: curvesI,
      parameters: m,
    }));
  }
  const onUpdateParameters = (m) => {
    setModelParameters(m);
    //console.log("[PARAMETERS UPDATED!")
    simulate(null, m);
  }

  if (Object.keys(capacity).length == 0) {
    simulate();
    console.log("[Capacity simulation updated X]")
  }
  useEffect(() => {
    simulate();
    console.log("[Capacity simulation updated]")
  }, [])

  const isOpen = true;
  let content = null;

  content = (
    <SplitPane split="vertical" className="three-pane-window splitter-container">
      <Pane initialSize="45%" minSize="350px" className="left-pane model-edit-intervention">
        <div>
          <H3>Time trajectory of hospital capacity</H3>
          <HospitalSimulationCurvePlots percentileCurves={ capacity.percentileCurves } startDate={ simulations.dates.minStartDate } modelParameters={ modelParameters } />
        </div>
      </Pane>
      <Pane initialSize="55%" minSize="30%" className="content-pane">
        <div className="nav-container">
          <HospitalCapacityParametersDialog onUpdate={ onUpdateParameters } />
          <Button intent={ Intent.PRIMARY } onClick={ simulate }>
            Simulate
          </Button>
        </div>
        <div>
          <H3>Projections</H3>
          <SimulationInfoFragment capacity={ capacity } simulations={ simulations } />
        </div>
      </Pane>
    </SplitPane>
  );
  return (
    <div className="default-container run-simple-hospital-simulation">
      { content }
    </div>
  );
}


