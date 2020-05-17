import React, { useState, useEffect, useRef } from 'react';
import { render, findDOMNode } from 'react-dom';
import classNames from "classnames";
import { Overlay, Classes, Code, H3, H4, H5, Icon, Label, Slider, Tooltip, ContextMenuTarget, AnchorButton, Button, Intent, Spinner, Menu, MenuDivider, MenuItem, Popover, Position, Dialog, Input } from "@blueprintjs/core";
import SplitPane from 'react-split-pane/lib/SplitPane.js';
import Resizer from 'react-split-pane/lib/Resizer.js';
import Pane from 'react-split-pane/lib/Pane.js';
import TeX from '@matejmazur/react-katex';
import 'katex/dist/katex.min.css';
import { InversableInputModelParameter } from "../SEIRSModel/parameterInput.jsx";
import './index.less';


const structureDefaultParameters = (params) => Object.fromEntries((Object.entries(params).map(([k, v]) => [k, {
  distribution: "uniform",
  min: v * 0.55,
  max: v * 1.45,
  mean: v
}])))

// export const UniformParameterInput = React.memo(({name, symbol, parameterName, units, model, updateModel, forceUpdate=false, inverse=false} = {}) => {
const RBinomHospitalCapacityModelParameters = ({model, onParamUpdate}) => {
  onParamUpdate = onParamUpdate ? onParamUpdate : (() => null);
  let modelParams = model;
  const updateModel = (m) => {
    onParamUpdate(m);
  }
  if (Object.keys(model).length == 0) {
    updateModel(defaultModel);
  }
  return (
    <div>
      <H4>Hospitalization information</H4>
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="u_hosp_nc" defaultValue={ 12 } symbol={ "\\mu_N" }
        label="Mean normal hospitalization time" units="days" description="Average length of hospitalization for those in a normal care room." />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="disp_hosp_nc" defaultValue={ 12 } symbol={ "\\mu_N" }
        label="Dispersion normal hospitalization time" units="" description="Dispersion parameter for the Negative Binomial distribution of the use of a normal care room."
      />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="u_hosp_cc" defaultValue={ 12 } symbol={ "\\mu_N" }
        label="Mean ICU hospitalization time" units="days" description="Average length of hospitalization for those in an ICU." />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="disp_hosp_cc" defaultValue={ 12 } symbol={ "\\mu_N" }
        label="Dispersion ICU hospitalization time" units="" description="Dispersion parameter for the Negative Binomial distribution of the use of an ICU." />
      <H4>Risk information</H4>
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="per_symp" defaultValue={ 12 } symbol={ "\\mu_N" }
        label="per_symp" units="days" description="Probability of developing symptoms among the infected." />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="per_hosp" defaultValue={ 12 } symbol={ "\\mu_N" }
        label="per_hosp" units="days" description="Probability of been hospitalized among the symptomatic." />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="per_ccu" defaultValue={ 12 } symbol={ "\\mu_N" }
        label="per_ccu" units="days" description="Probability of being conducted to a ICU among the hospitalized." />
    </div>
  )
/*
<H4>Model adjustments</H4>
<InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="pop_size" defaultValue={ 10000 } symbol={ "N" }
  label="Population size" units="" description="Population size." />

<InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="adjustedPopulationFactor" defaultValue={ 10000 }
      symbol={ "N_F" } label="Adjusted population factor" units="" description="Adjusted factor over the curves simulated from the SIER epidemiologic model."
    />
*/
}

import { HospitalCapacityDefaultParams } from "./defaultParameters.jsx";

export const HospitalCapacityParametersDialog = (({onUpdate}) => {
  onUpdate = onUpdate ? onUpdate : (() => {
  });
  let defaultModel = HospitalCapacityDefaultParams();
  const [isOpen, setOpen] = useState(true);
  const [simulationParams, setSimulationParams] = useState(defaultModel);
  /////const setSimulationParams = onUpdate
  //const [defSimulationParams, setDefSimulationParams] = useState(defaultModel);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  }
  const updateSimulation = (params) => {
    setSimulationParams(params);
  }
  const onSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    onUpdate(simulationParams);
  }
  return (
    <React.Fragment>
      <Button onClick={ handleOpen }>Modify parameters</Button>
      <Dialog className="param-capacity-dialog" icon="info-sign" onClose={ handleClose } title="Hospital capacity model" isOpen={ isOpen } canOutsideClickClose={ false }>
        <form onSubmit={ onSubmit }>
          <div className={ Classes.DIALOG_BODY }>
            <RBinomHospitalCapacityModelParameters model={ simulationParams } onParamUpdate={ updateSimulation } />
          </div>
          <div className={ Classes.DIALOG_FOOTER }>
            <div className={ Classes.DIALOG_FOOTER_ACTIONS }>
              <Button onClick={ handleClose }>Close</Button>
              <button type="submit" className="bp3-button bp3-intent-primary">
                Simulate
              </button>
            </div>
          </div>
        </form>
      </Dialog>
    </React.Fragment>
  )
});

/*

export const SEIRSModelDialog = ({ data }) => {
  const [isOpen, setOpen] = useState(true);
  const [dataSimulation, setDataSimulation] = useState([]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const updateSimulation = (params) => {
    console.log("TRIGGERED", params)
    setDataSimulation(optimPlotSIERSim(50e2, params, { epsilon_n: 100, epsilon_t: 1e-2 }));
  }
  if (dataSimulation.length == 0) updateSimulation({});

  return (
    <React.Fragment>
      <Button onClick={handleOpen}>Show dialog</Button>
      <Dialog
        className="param-dialog"
        icon="info-sign"
        onClose={handleClose}
        title="SEIRS Model"
        isOpen={isOpen}
        canOutsideClickClose={false}
      >
        <div className={Classes.DIALOG_BODY}>
          <SplitPane split="vertical" className="sim-pane-window">
            <Pane initialSize="50%" minSize="350px" className="param-pane">
              <div>
                <SimpleHospitalCapacityModelParameters
                  onParamUpdate={updateSimulation}
                />

              </div>
            </Pane>
            <Pane initialSize="50%" minSize="250px" className="preview-pane">
              <div>
                <H3>Model projection</H3>
                <div className="plot">
                  <SingleSimLine
                    data={dataSimulation}
                    enablePoints={false}
                  />
                </div>
                <div class="bp3-callout bp3-intent-warning">
                  <h4 class="bp3-heading">Note</h4>
                This simulated projection only relates to the choosen
                parameters and not to the whole simulation.
              </div>

              </div>
            </Pane>
          </SplitPane>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Tooltip content="This button is hooked up to close the dialog.">
              <Button onClick={handleClose}>Close</Button>
            </Tooltip>
            <AnchorButton
              intent={Intent.PRIMARY}
              onClick={handleClose}
              href="#"
            > Apply </AnchorButton>
          </div>
        </div>
      </Dialog>
    </React.Fragment>
  )
};
*/

