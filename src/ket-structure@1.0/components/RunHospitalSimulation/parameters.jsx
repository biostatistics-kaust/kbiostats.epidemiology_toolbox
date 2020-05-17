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
export const SimpleHospitalCapacityModelParameters = ({model, onParamUpdate}) => {
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
      <H4>Expected medical needs</H4>
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="bedToInfectedProportion" defaultValue={ (0.034 / 0.318) } symbol={ "\\rho_{B-I}" }
        label="Need-hospitalization rate" units="" description="Average porcentage of infected people that will require to admitted to the hospital. It includes also those who will not get be able to hospitalized if the system collapses."
      />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="icuToBedProportion" defaultValue={ 0.149 } symbol={ "\\rho_{I-B}" }
        label="Need-ICU rate" units="" description="Average porcentage of patients that are using hospital beds and require intensive care units." />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="ventilatorToIcuProportion" defaultValue={ 0.539 } symbol={ "\\rho_{V-I}" }
        label="Need-ventilator rate" units="" description="Average porcentage of patients that are in the intensive care units that require the use of artificial ventilator."
      />
      <H4>Current hospital resources</H4>
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="maxBedsAvailable" defaultValue={ 100 } symbol={ "M_B" }
        label="Available hospital beds" units="" description="Range of available hospital beds." />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="maxIcusAvailable" defaultValue={ 20 } symbol={ "M_I" }
        label="Available ICUs" units="" description="Range of available ICUs." />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="maxVentilatorsAvailable" defaultValue={ 10 } symbol={ "M_V" }
        label="Available ventilators" units="" description="Range of available artificial ventilators." />
      <H4>Current hospital resources</H4>
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="probDeathNoBed" defaultValue={ .6 } symbol={ "p_{\\bar{B}}" }
        label="Death rate without hospitalization" units="" description="Death probability if the patients do not have access to any medical service: hospital beds, ICUs or ventilators (severe conditions)."
      />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="probDeathBedNoIcu" defaultValue={ 0.4 } symbol={ "p_{B\\bar{I}}" }
        label="Death rate only with hospital beds" units="" description="Death probability if the patients have access to hospital beds, but no ICUs nor ventilators (critical conditions)."
      />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="probDeathBedIcuNoVent" defaultValue={ 0.3 } symbol={ "p_{BI\\bar{V}}" }
        label="Death rate only with ICU" units="" description="Death probability if the patients have access to hospital beds, ICUs, but no ventilators (overwhelmed conditions)."
      />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="probDeathBedIcuVent" defaultValue={ 0.1 } symbol={ "p_{BIV}" }
        label="Death rate with ventilator" units="" description="Death probability if the patients have access to hospital beds, ICUs, and ventilators (normal conditions)."
      />
    </div>
  )
}
/*
      <H4>Model adjustment </H4>
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="adjustedPopulationFactor" defaultValue={ 10000 }
        symbol={ "N_F" } label="Adjusted population factor" units="" description="Adjusted factor over the curves simulated from the SIER epidemiologic model."
      />
*/

import { CommonHospitalCapacityDefaultParams } from "./defaultParameters.jsx";

export const HospitalCapacityParametersDialog = (({onUpdate}) => {
  onUpdate = onUpdate ? onUpdate : (() => {
  });
  let defaultModel = CommonHospitalCapacityDefaultParams();
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
            <SimpleHospitalCapacityModelParameters model={ simulationParams } onParamUpdate={ updateSimulation } />
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

