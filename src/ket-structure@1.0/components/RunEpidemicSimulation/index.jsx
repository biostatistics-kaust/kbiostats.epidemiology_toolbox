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
import { checkDiscontinuities, OccupancyDatesFragment } from "./discontinuities.jsx";
import { simulateParameters, getSimulationCurves, SimulationCurvePlots, SimulationSICurvePlot } from "./simulation.jsx";
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

const SimulationInfoFragment = ({simulations}) => {
  const curves = simulations.percentileCurves;
  if (curves.length == 0) {
    return <div></div>;
  }
  //const argmax = (v, {key}) => v.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
  const argmax = (v, {key}) => v.map((x, i) => [x, i]).reduce((r, a) => (key(a[0]) > key(r[0]) ? a : r))[1];
  const indices = {
    "S": 1,
    "E": 2,
    "I": 3,
    "R": 4,
    "lowci": 0,
    "highci": 2,
    "median": 1,
    "time": 0,
  };
  const float2date = (v) => moment(simulations.dates.minStartDate).add(v * 24 * 3600, "seconds").format("MMMM Do YYYY")
  const indexInfectionPeak = index => argmax(curves, {
    key: (v) => v[indices.I][index]
  });
  const getMinMax = (a, b,) => [Math.min(a, b), Math.max(a, b)]
  const medianInfectionPeak = curves[indexInfectionPeak(indices.median)][indices.time];
  let highInfectionPeak = curves[indexInfectionPeak(indices.lowci)][indices.time];
  let lowInfectionPeak = curves[indexInfectionPeak(indices.highci)][indices.time];
  {
    const [_low, _high] = getMinMax(lowInfectionPeak, highInfectionPeak);
    lowInfectionPeak = _low;
    highInfectionPeak = _high;
  }
  const adjustedTimeIntegrationFactor = (curves[curves.length - 1][0] - curves[0][0]) / curves.length;
  const countInfectionNumbers = (index) => jStat.sum(curves.map((x, i) => x[indices.I][index])) * adjustedTimeIntegrationFactor;
  //
  const medianTotalInfection = countInfectionNumbers(indices.median)
  const highTotalInfection = countInfectionNumbers(indices.highci)
  const lowTotalInfection = countInfectionNumbers(indices.lowci)
  //
  const medianInfectionRatePeak = curves[indexInfectionPeak(indices.median)][indices.I][indices.median];
  let highInfectionRatePeak = curves[indexInfectionPeak(indices.lowci)][indices.I][indices.lowci];
  let lowInfectionRatePeak = curves[indexInfectionPeak(indices.highci)][indices.I][indices.highci];
  {
    const [_low, _high] = getMinMax(highInfectionRatePeak, lowInfectionRatePeak);
    lowInfectionRatePeak = _low;
    highInfectionRatePeak = _high;
  }
  //
  return (
    <table className="bp3-html-table bp3-html-table-condensed bp3-html-table-striped bp3-interactive bp3-small">
      <thead>
        <tr>
          <th></th>
          <th className="value">
          </th>
          <th className="confidence-interval">
            95% confidence interval
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Infection peak</td>
          <td className="value">
            <div>
              { math.round(medianInfectionPeak, 2) } days after the outbreak.
            </div>
            <div>
              (
              { float2date(medianInfectionPeak) })
            </div>
          </td>
          <td className="confidence-interval">
            <div>(
              <span className="low">{ math.round(lowInfectionPeak, 2) },</span>
              <span className="hight">{ math.round(highInfectionPeak, 2) }</span> )
            </div>
            <div>(
              <span className="low">{ float2date(lowInfectionPeak) },</span>
              <span className="hight">{ float2date(highInfectionPeak) }</span> )
            </div>
          </td>
        </tr>
        <tr>
          <td>Infection peak</td>
          <td className="value">
            <div>
              { math.round(medianInfectionRatePeak, 2) } infected
            </div>
          </td>
          <td className="confidence-interval">
            (
            <span className="low">{ math.round(lowInfectionRatePeak, 2) },</span>
            <span className="hight">{ math.round(highInfectionRatePeak, 2) }</span> )
          </td>
        </tr>
        <tr>
          <td>Cumulative infected people</td>
          <td className="value">
            <div>
              { math.round(medianTotalInfection, 2) }
            </div>
          </td>
          <td className="confidence-interval">
            (
            <span className="low">{ math.round(lowTotalInfection, 2) },</span>
            <span className="hight">{ math.round(highTotalInfection, 2) }</span> )
          </td>
        </tr>
      </tbody>
    </table>
  );
}
/*

CHECK

  return (
    <table className="bp3-html-table bp3-html-table-condensed bp3-html-table-striped bp3-interactive bp3-small">
      <thead>
        <tr>
          <th></th>
          <th className="value">
          </th>
          <th className="confidence-interval">
            95% confidence interval
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Infection peak</td>
          <td className="value">
            <div>
              { math.round(medianInfectionPeak, 2) } days after the outbreak.
            </div>
            <div>
              (
              { float2date(medianInfectionPeak) })
            </div>
          </td>
          <td className="confidence-interval">
            <div>(
              <span className="low">{ math.round(lowInfectionPeak, 2) },</span>
              <span className="hight">{ math.round(highInfectionPeak, 2) }</span> )
            </div>
            <div>(
              <span className="low">{ float2date(lowInfectionPeak) },</span>
              <span className="hight">{ float2date(highInfectionPeak) }</span> )
            </div>
          </td>
        </tr>
        <tr>
          <td>Infection peak rate</td>
          <td className="value">
            <div>
              { math.round(medianInfectionRatePeak, 2) } infected/day
            </div>
          </td>
          <td className="confidence-interval">
            (
            <span className="low">{ math.round(lowInfectionRatePeak, 2) },</span>
            <span className="hight">{ math.round(highInfectionRatePeak, 2) }</span> )
          </td>
        </tr>
        <tr>
          <td>Infected people</td>
          <td className="value">
            <div>
              { math.round(medianTotalInfection, 2) }
            </div>
          </td>
          <td className="confidence-interval">
            (
            <span className="low">{ math.round(lowTotalInfection, 2) },</span>
            <span className="hight">{ math.round(highTotalInfection, 2) }</span> )
          </td>
        </tr>
      </tbody>
    </table>
  );
*/

export const RunEpidemicSimulation = () => {
  let history = useHistory();
  const {interventions, simulations, setSimulations} = useContext(GlobalContext);

  const occupancyDates = checkDiscontinuities(interventions);

  const handleClose = () => {
    history.goBack();
  }

  useEffect(() => {
    setSimulations(getSimulationCurves({
      interventions
    }));
    console.log("[Simulation curves updated]")
  }, [])

  const isOpen = true;
  let content = null;

  content = (
    <SplitPane split="vertical" className="three-pane-window splitter-container">
      <Pane initialSize="45%" minSize="350px" className="left-pane model-edit-intervention">
        <div>
          <H3>Time trajectory of the outbreak</H3>
          <SimulationCurvePlots percentileCurves={ simulations.percentileCurves } startDate={ simulations.dates.minStartDate } />
        </div>
      </Pane>
      <Pane initialSize="55%" minSize="30%" className="content-pane">
        <div>
          <H3>Projections</H3>
          <SimulationInfoFragment simulations={ simulations } />
          { occupancyDates.length == 0 ? "" : <OccupancyDatesFragment occupancyDates={ occupancyDates } /> }
          <SplitPane split="vertical" className="w-full SEIRS-additional-data">
            <Pane initialSize="55%" minSize="350px" className="left-pane model-edit-intervention">
              <div>
                <H3>S-I plane</H3>
                <SimulationSICurvePlot percentileCurves={ simulations.percentileCurves } />
              </div>
            </Pane>
            <Pane initialSize="45%" minSize="30%" className="content-pane">
              <div>
                <H3>Simulation config</H3>
                <CollapsibleDataLog model={ interventions } />
              </div>
            </Pane>
          </SplitPane>
        </div>
      </Pane>
    </SplitPane>
  );
  return (
    <div className="default-container run-epidemic-simulation">
      { content }
    </div>
  )
  return (
    <React.Fragment>
      <Dialog className="param-dialog" icon="info-sign" onClose={ handleClose } title="Intervention and epidemic model" isOpen={ isOpen } canOutsideClickClose={ false }>
        <div className={ Classes.DIALOG_BODY }>
          { content }
          <SimulationCurvePlots interventions={ interventions } />
        </div>
      </Dialog>
    </React.Fragment>
  );
}


