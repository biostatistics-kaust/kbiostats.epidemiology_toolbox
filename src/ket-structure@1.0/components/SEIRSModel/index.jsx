import React, { useState, useEffect, useRef } from 'react';
import { render, findDOMNode } from 'react-dom';
import classNames from "classnames";
import { Overlay, Classes, Code, H3, H4, H5, Icon, Label, Slider, Tooltip, ContextMenuTarget, AnchorButton, Button, Intent, Spinner, Menu, MenuDivider, MenuItem, Popover, Position, Dialog, Input } from "@blueprintjs/core";
import SplitPane from 'react-split-pane/lib/SplitPane.js';
import Resizer from 'react-split-pane/lib/Resizer.js';
import Pane from 'react-split-pane/lib/Pane.js';
import TeX from '@matejmazur/react-katex';
import 'katex/dist/katex.min.css';
import { ResponsiveLine } from '@nivo/line'
import { ParameterInput, InversableInputModelParameter } from "./parameterInput.jsx";
import './index.less';

//
const SingleSimLine = ({data}, extraOpts) => {
  const {levels = 5} = extraOpts;
  return (<ResponsiveLine width={ 450 } height={ 400 } data={ data } margin={ { top: 50, right: 110, bottom: 50, left: 60 } } curve="linear" axisTop={ null }
            axisRight={ null } axisBottom={ { tickValues: levels, orient: 'bottom', tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'time [days]', legendOffset: 36, legendPosition: 'middle' } } axisLeft={ { orient: 'left', legend: 'count', legendOffset: -40, legendPosition: 'middle' } } yScale={ { type: 'linear', min: 0, max: 'auto', } } xScale={ { type: 'linear', min: 0, max: 'auto', } } colors={ ["#2ca02c", "#d62728", "#ff7f0e", "#1f77b4", "hsl(269, 70%, 50%)"] }
            enablePoints={ false } pointSize={ 10 } pointColor={ { theme: 'background' } } pointBorderWidth={ 2 } pointBorderColor={ { from: 'serieColor' } }
            pointLabel="y" pointLabelYOffset={ -12 } useMesh={ true } legends={ [{ anchor: 'bottom-right', direction: 'column', justify: false, translateX: 100, translateY: 0, itemsSpacing: 0, itemDirection: 'left-to-right', itemWidth: 80, itemHeight: 20, itemOpacity: 0.75, symbolSize: 12, symbolShape: 'circle', symbolBorderColor: 'rgba(0, 0, 0, .5)', effects: [{ on: 'hover', style: { itemBackground: 'rgba(0, 0, 0, .03)', itemOpacity: 1 } }] }] } />
  );
}

import { simulateParametersSEIRS } from "./simulation.jsx";
import { SEIRSModelDefaultParameters } from "./defaultParameters.jsx";

const SEIRSModelParameters = ({model, onParamUpdate}) => {
  onParamUpdate = onParamUpdate ? onParamUpdate : (() => null);
  let modelParams = {
    ...SEIRSModelDefaultParameters(),
    ...model,
  }
  const updateModel = (m) => {
    onParamUpdate(m);
  }
  if (Object.keys(model).length == 0) {
    updateModel(SEIRSModelDefaultParameters());
  }
  return (
    <div>
      <H4>Parameters</H4>
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="beta" defaultValue={ 4 } symbol={ "\\beta" }
        label="Infectious Rate (Susceptible &#8614; Infected)" units="[1/days]" description="Rate at which susceptible individuals become exposed by infected individuals and leave susceptible class and enter exposed class"
        inverse_label="Mean Susceptibility Period (Pre-Exposed Individuals)" inverse_units="[days]" inverse_description="Time for susceptible individuals to become exposed individuals"
      />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="gamma" defaultValue={ 1 / 7 } symbol={ "\\gamma" }
        label="Recovery Rate (Infected &#8614; Recovered)" units="[1/days]" description="Rate at which infected individuals leave infected class and enter recovered class"
        inverse_label="Average Duration of Infection" inverse_units="[days]" inverse_description="Time for infected individuals to become recovered individuals" />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="sigma" defaultValue={ 1 / 3 } symbol={ "\\sigma" }
        label="Incubation Rate (Exposed &#8614; Infected)" units="[1/days]" description="Rate at which exposed individuals become infected by incubating infection and leave exposed class and enter infected class"
        inverse_label="Average Duration of Incubation" inverse_units="[days]" inverse_description="Time for exposed individuals to become infected individuals" />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="alpha" defaultValue={ 1 / 14 } symbol={ "\\alpha" }
        label="Reinfection Rate (Recovered &#8614; Susceptible)" units="[1/days]" description="Rate at which recovered individuals lose temporary immunity and leave recovered class and enter susceptible class."
        inverse_label="Average Temporary Immunity Period" inverse_units="[days]" inverse_description="Time for recovered individuals to become susceptible individuals"
      />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="rho" defaultValue={ 1 / 2 } symbol={ "\\rho" }
        label="Vaccination Rate (Susceptible)" units="[1/days]" description="Rate at which susceptible individuals are vaccinated and leave susceptible class and enter recovered class to gain temporary immunity"
        inverse_label="Average Susceptibility Period" inverse_units="[days]" inverse_description="(Pre-Vaccination of Susceptible Individuals) Time for susceptible individuals to become recovered individuals"
      />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="nu" defaultValue={ 0.8 } symbol={ "\\nu" }
        label="Vaccination Proportion (Newborns)" units="" description="Proportion of vaccinated newborns" />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="b" defaultValue={ 1.9 / 100 } symbol={ "b" }
        label="Birth Rate" units="[births/day]" description="Birth rate of newborns/day during one year" />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="d" defaultValue={ 0.8 / 100 } symbol={ "d" }
        label="Death Rate" units="[deaths/day]" description="Death rate of susceptible, exposed, infected, and recovered individuals per day during one year." />
      <H4>Initial values</H4>
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="S0" defaultValue={ 90 } symbol={ "S_0" }
        label="Initial susceptibles individuals" units="" description="The quantity of susceptible individuals at the beginning of the model run." />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="E0" defaultValue={ 0 } symbol={ "E_0" }
        label="Initial exposed individuals" units="" description="The quantity of exposed individuals at the beginning of the model run." />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="I0" defaultValue={ 10 } symbol={ "I_0" }
        label="Initial infected individuals" units="" description="The quantity of infected individuals at the beginning of the model run." />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="R0" defaultValue={ 10 } symbol={ "I_0" }
        label="Initial recovered individuals" units="" description="The quantity of recovered individuals at the beginning of the model run." />
    </div>
  )
  /*
   *
    return (
      <div>
        <H4>Parameters</H4>
        <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="beta" defaultValue={ 4 } symbol={ "\\beta" }
          label="Transmission Rate (Susceptible to Infected)" units="[1/days]" description="Rate at which susceptible individuals become exposed by infected individuals and leave susceptible class and enter exposed class"
          inverse_label="Mean Susceptibility Period (Pre-Exposed Individuals)" inverse_units="[days]" inverse_description="Time for susceptible individuals to become exposed individuals"
        />
        <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="gamma" defaultValue={ 1 / 7 } symbol={ "\\gamma" }
          label="Recovery Rate (Infected to Recovered)" units="[1/days]" description="Rate at which infected individuals leave infected class and enter recovered class"
          inverse_label="Mean Infectious Period" inverse_units="[days]" inverse_description="Time for infected individuals to become recovered individuals" />
        <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="sigma" defaultValue={ 1 / 3 } symbol={ "\\sigma" }
          label="Transmission Rate (Exposed to Infected)" units="[1/days]" description="Rate at which exposed individuals become infected by incubating infection and leave exposed class and enter infected class"
          inverse_label="Mean Latency Period" inverse_units="[days]" inverse_description="Time for exposed individuals to become infected individuals" />
        <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="alpha" defaultValue={ 1 / 14 } symbol={ "\\alpha" }
          label="Transmission Rate (Recovered to Susceptible)" units="[1/days]" description="Rate at which recovered individuals lose temporary immunity and leave recovered class and enter susceptible class"
          inverse_label="Mean Temporary Immunity Period" inverse_units="[days]" inverse_description="Time for recovered individuals to become susceptible individuals" />
        <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="rho" defaultValue={ 1 / 2 } symbol={ "\\rho" }
          label="Vaccination Rate (Susceptible)" units="[1/days]" description="Rate at which susceptible individuals are vaccinated and leave susceptible class and enter recovered class to gain temporary immunity"
          inverse_label="Mean Susceptibility Period" inverse_units="[days]" inverse_description="(Pre-Vaccination of Susceptible Individuals) Time for susceptible individuals to become recovered individuals"
        />
        <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="nu" defaultValue={ 0.8 } symbol={ "\\nu" }
          label="Vaccination Proportion (Newborns)" units="" description="Proportion of vaccinated newborns" />
        <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="b" defaultValue={ 1.9 / 100 } symbol={ "b" }
          label="Birth Rate" units="[births/day]" description="Birth rate of newborns/day during one year" />
        <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="d" defaultValue={ 0.8 / 100 } symbol={ "d" }
          label="Death Rate" units="[deaths/day]" description="Death rate of susceptible, exposed, infected, and recovered individuals per day during one year." />
        <H4>Initial values</H4>
        <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="S0" defaultValue={ 90 } symbol={ "S_0" }
          label="Initial susceptibles individuals" units="" description="The quantity of susceptible individuals at the beginning of the model run." />
        <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="E0" defaultValue={ 0 } symbol={ "E_0" }
          label="Initial exposed individuals" units="" description="The quantity of exposed individuals at the beginning of the model run." />
        <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="I0" defaultValue={ 10 } symbol={ "I_0" }
          label="Initial infected individuals" units="" description="The quantity of infected individuals at the beginning of the model run." />
        <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="R0" defaultValue={ 10 } symbol={ "I_0" }
          label="Initial recovered individuals" units="" description="The quantity of recovered individuals at the beginning of the model run." />
      </div>
    )
   *
  */

/*
<InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="S0" defaultValue={ 0.9 } symbol={ "S_0" }
        label="Initial proportion of susceptibles" units="" description="The percentage of susceptible individuals at the beginning of the model run." />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="E0" defaultValue={ 0 } symbol={ "E_0" }
        label="Initial proportion of exposed" units="" description="The percentage of exposed individuals at the beginning of the model run." />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="I0" defaultValue={ 0.1 } symbol={ "I_0" }
        label="Initial proportion of infected" units="" description="The percentage of infected individuals at the beginning of the model run." />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="R0" defaultValue={ 0 } symbol={ "S_0" }
        label="Initial population" units="" description="Initial population." />
label="Initial proportion of recovered" units="" description="The percentage of recovered individuals at the beginning of the model run." />
      <InversableInputModelParameter model={ modelParams } updateModel={ updateModel } field="Nfactor" defaultValue={ 10000 } symbol={ "N_0" }
*/
}


export const SEIRSModel = ({model, onModelUpdate}) => {
  onModelUpdate = onModelUpdate ? onModelUpdate : (() => null);
  const [isOpen, setOpen] = useState(true);
  const [dataSimulation, setDataSimulation] = useState([]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const plotSimulation = (params) => {
    const meanValues = Object.fromEntries(Object.entries(params).map(([k, v]) => [k, v.mean]));
    setDataSimulation(simulateParametersSEIRS(50e2, meanValues, {
      epsilon_n: 100,
      epsilon_t: 1e-2
    }));
  }
  const updateSimulation = (params) => {
    plotSimulation(params);
    if (Object.keys(params).length > 0) {
      onModelUpdate(params);
    }
  }

  if (dataSimulation.length == 0) {
    plotSimulation(model);
  }

  return (
    <React.Fragment>
      <SplitPane split="vertical" className="sim-pane-window">
        <Pane initialSize="50%" minSize="350px" className="param-pane">
          <div>
            <SEIRSModelParameters model={ model } onParamUpdate={ updateSimulation } />
          </div>
        </Pane>
        <Pane initialSize="50%" minSize="250px" className="preview-pane">
          <div>
            <H3>Model projection</H3>
            <div className="plot">
              <SingleSimLine data={ dataSimulation } enablePoints={ false } />
            </div>
            <div className="bp3-callout bp3-intent-warning">
              <h4 className="bp3-heading">Note</h4> This simulated projection only relates to the choosen parameters and not to the whole simulation.
            </div>
          </div>
        </Pane>
      </SplitPane>
    </React.Fragment>
  )
};


export { SEIRSModelDescription } from "./modelDescription.jsx";
