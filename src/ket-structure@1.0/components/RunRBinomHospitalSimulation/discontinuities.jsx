import React, { Fragment, useState, useContext, useEffect } from 'react';
import { createPortal } from "react-dom";
import { Route, useHistory, Link, withRouter } from "react-router-dom";
import classNames from "classnames";
import SplitPane from 'react-split-pane/lib/SplitPane.js';
import Resizer from 'react-split-pane/lib/Resizer.js';
import Pane from 'react-split-pane/lib/Pane.js';
import TeX from '@matejmazur/react-katex';
import 'katex/dist/katex.min.css'; // It does not work from less file
import { Callout, Pre, Collapse, Tooltip, AnchorButton, Button, Intent, Spinner, Menu, MenuDivider, MenuItem, Popover, Position, Dialog, H1, H2, H3, H5, Classes } from "@blueprintjs/core";
import { jStat } from "jstat";
import "./index.less";

export const checkDatesInfo = (interventions) => {
  const startDates = interventions.map((v) => moment(v.startDate, 'MMMM Do YYYY'));
  const endDates = interventions.map((v) => moment(v.endDate, 'MMMM Do YYYY'));
  const minStartDate = moment.min(...startDates);
  const maxStartDate = moment.max(...startDates);
  const minEndDate = moment.min(...endDates);
  const maxEndDate = moment.max(...endDates);
  //
  const totalDays = moment(maxEndDate).diff(minStartDate, "days");
  return {
    totalDays,
    startDates,
    endDates,
    minStartDate,
    maxStartDate,
    minEndDate,
    maxEndDate
  };
}

/*
Note: if there is some fillings not solved by the model, it is assumed that the first model is valid during
the non specified types
*/
const MODEL_INITIAL_DEFAULT = 0;
const MODEL_LAST_DEFAULT = 1;
let DEFAULT_MODEL_INITIAL_OR_LAST = MODEL_INITIAL_DEFAULT;
export const assumeDefaultModelInSimulationGap = (assumedModel) => {
  if (assumedModel == "initial" || assumedModel == MODEL_INITIAL_DEFAULT) {
    assumedModel = MODEL_INITIAL_DEFAULT;
  } else if (assumedModel == "last" || assumedModel == MODEL_LAST_DEFAULT) {
    assumedModel = MODEL_LAST_DEFAULT;
  } else {
    throw new Error(`assumeDefaultModelInSimulationGap:: Unrecognized value: ${assumedModel}`)
  }
}
export const interventionIndicesPerDay = (interventions) => {
  const {totalDays, maxEndDate, minStartDate, endDates, startDates} = checkDatesInfo(interventions);
  let interventionIndex = [...Array(totalDays + 1).keys()].map(v => 0)
  interventions.forEach((v, k) => {
    const t0 = startDates[k].diff(minStartDate, "days");
    //const t1 = endDates[k].diff(minStartDate, "days");
    //const t1 = totalDays + 1;
    const t1 = DEFAULT_MODEL_INITIAL_OR_LAST == MODEL_INITIAL_DEFAULT ? endDates[k].diff(minStartDate, "days") : (totalDays + 1);
    const duration = endDates[k].diff(startDates[k], "days");
    for (let t = t0; t <= t1; t++) {
      interventionIndex[t] = k;
    }
  });
  return interventionIndex;
}

export const checkDiscontinuities = (interventions) => {
  const {totalDays, maxEndDate, minStartDate, endDates, startDates} = checkDatesInfo(interventions);
  let matrixDays = jStat.zeros(totalDays + 1, interventions.length);
  interventions.forEach((v, k) => {
    //
    const t0 = moment(startDates[k]).diff(minStartDate, "days");
    const t1 = moment(endDates[k]).diff(minStartDate, "days");
    const duration = moment(endDates[k]).diff(startDates[k], "days");
    for (let t = t0; t <= t1; t++) {
      matrixDays[t][k] = 1;
    }
  });
  const occupancy = jStat(matrixDays).sumrow();
  /*console.log(
    occupancy.map((v, i) => [v, i])
  )
  console.log(
    occupancy.map((v, i) => [v, i]).map(([v, i]) => [v, i, moment(minStartDate).add(i, "days").format('MMMM Do YYYY')])
  )*/
  const occupancyDates = occupancy.map((v, i) => [v, i]).filter(([v, i]) => v != 1).map(([v, i]) => [v, moment(minStartDate).add(i, "days").format('MMMM Do YYYY')]);
  return occupancyDates;
}

export const OccupancyDatesFragment = ({occupancyDates}) => {
  const [isOpen, setOpen] = useState(true);
  const handleClick = () => setOpen(!isOpen)
  return (<div className="occupancy-dates">
            <Button className="button-log-details" onClick={ handleClick }>
              { isOpen ? "Hide" : "Show" } model warnings
            </Button>
            <Collapse className="log-details" isOpen={ isOpen }>
              <Callout intent={ Intent.WARNING } title={ "Model specification error" }>
                <div> Some date intervals have not been covered by exactly one epidemic model:</div>
                <br/>
                { occupancyDates.map(([nmodels, date], i) => <div key={ `occupancy-${i}-${date}` }>
                                                               { date }: covered by <span> </span>
                                                               { nmodels } models.
                                                             </div>) }
              </Callout>
            </Collapse>
          </div>
  );
}
