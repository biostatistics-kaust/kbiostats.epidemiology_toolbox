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
import './index.less';
const KERNumericalInput = Input
/*
https://www.mdpi.com/2227-7390/5/1/7/htm

b  Birth Rate   birthspersonday   Birth rate of newborns each year
d  Death Rate   deathspersonday   Death rate of susceptible, exposed, infected, and recovered individuals each year
γ  Recovery Rate (Infected to Recovered)  days−1  Rate at which infected individuals leave infected class and enter recovered class

ρ  Vaccination Rate (Susceptible)  days−1  Rate at which susceptible individuals are vaccinated and leave susceptible class and enter recovered class to gain temporary immunity
1/ρ   Mean Susceptibility Period (Pre-Vaccination of Susceptible Individuals)  days  Time for susceptible individuals to become recovered individuals

α  Transmission Rate (Recovered to Susceptible)  days−1  Rate at which recovered individuals lose temporary immunity and leave recovered class and enter susceptible class
1/α   Mean Temporary Immunity Period  days  Time for recovered individuals to become susceptible individuals

β  Transmission Rate (Susceptible to Infected)  days−1  Rate at which susceptible individuals become exposed by infected individuals and leave susceptible class and enter exposed class
1/β   Mean Susceptibility Period (Pre-Exposed Individuals)  days  Time for susceptible individuals to become exposed individuals

σ  Transmission Rate (Exposed to Infected)  days−1  Rate at which exposed individuals become infected by incubating infection and leave exposed class and enter infected class
1/σ   Mean Latency Period  days  Time for exposed individuals to become infected individuals

ν  Vaccination Proportion (Newborns)  Dimensionless  Proportion of vaccinated newborns
1/γ   Mean Infectious Period  days  Time for infected individuals to become recovered individuals

const Parameter_Tau = ({ params, onValueChange }) => (
  <ModelBasicParameter
    name="Transmissibility"
    symbol={"\\tau"}
    description="Probability of infection given contact between a susceptible and infected individual."
    defaultValue={params.tau}
    onValueChange={onValueChange}
  />
)

//Other references
//    https://web.stanford.edu/~jhj1/teachingdocs/Jones-on-R0.pdf
//    http://www.public.asu.edu/~hnesse/classes/seir.html

*/

const keywordEventEnter = () => new KeyboardEvent('keydown', {
  altKey: false,
  bubbles: true,
  cancelBubble: false,
  cancelable: true,
  charCode: 0,
  code: "Enter",
  composed: true,
  ctrlKey: false,
  currentTarget: null,
  defaultPrevented: true,
  detail: 0,
  eventPhase: 0,
  isComposing: false,
  isTrusted: true,
  key: "Enter",
  keyCode: 13,
  location: 0,
  metaKey: false,
  repeat: false,
  returnValue: false,
  shiftKey: false,
  type: "keydown",
  which: 13
});
//
const InputModelParameter = ({model_params, field, defaultValue, symbol, label, description, inverse_label, inverse_description, onValueChange, inputProps}) => {
  const [paramValue, setParamValue] = useState(defaultValue);
  const [invParamValue, setInvParamValue] = useState(1 / defaultValue);
  let directRef = useRef(null);
  //
  onValueChange = onValueChange ? onValueChange : (() => null);
  inputProps = inputProps ? inputProps : {}
  //
  const updateFieldValue = (val) => {
    let newParams = model_params.get() || {};
    let oldval = model_params.getField(field);
    model_params.setField(field, val);
    if (oldval != val) {
      model_params.set(newParams);
    }
  };
  //
  const forceUpdateInputs = () => Array.from(directRef.current.querySelectorAll("input")).forEach(el => el.dispatchEvent(keywordEventEnter()))
  const onDirectChange = (v) => {
    onValueChange(v);
    updateFieldValue(v);
    setInvParamValue(1 / v);
    forceUpdateInputs();
  }
  const onInverseChange = (iv) => {
    onValueChange(1 / iv);
    updateFieldValue(1 / iv);
    setParamValue(1 / iv);
    forceUpdateInputs();
  }
  //
  return (<div ref={ directRef }>
            Hi!
          </div>)
  return (
    <div ref={ directRef }>
      <Tooltip className={ classNames("block-element", "descriptive-property", "SIERS", Classes.TOOLTIP_INDICATOR) } popoverClassName="SIERS-model-param-tooltip" content={ description + `. Default value: ${Math.round(paramValue * 10000) / 10000}` }>
        <label className="bp3-label bp3-inline">
          { label }
          <TeX>
            { symbol }
          </TeX>
          <KERNumericalInput className="bp3-inline float-right" value={ paramValue } onValueChange={ onDirectChange } {...inputProps} />
        </label>
      </Tooltip>
      { inverse_label && <Tooltip key={ "inv_" + field } className={ classNames("block-element", "descriptive-property", "SIERS", Classes.TOOLTIP_INDICATOR) } popoverClassName="SIERS-model-param-tooltip" content={ inverse_description + `. Default value: ${Math.round(1 / paramValue * 10000) / 10000}` }>
                           <label className="bp3-label bp3-inline">
                             { inverse_label }
                             <TeX>
                               { "\\frac{1}{" + symbol + "}" }
                             </TeX>
                             <KERNumericalInput className="bp3-inline float-right" value={ invParamValue } onValueChange={ onInverseChange } {...inputProps} />
                           </label>
                         </Tooltip> }
    </div>
  );
  return fields;
}

const SingleSimLine = ({data}, extraOpts) => {
  const {levels = 5} = extraOpts;
  return (<ResponsiveLine width={ 700 } height={ 400 } data={ data } margin={ { top: 50, right: 110, bottom: 50, left: 60 } } curve="linear" axisTop={ null }
            axisRight={ null } axisBottom={ { tickValues: levels, orient: 'bottom', tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'time [days]', legendOffset: 36, legendPosition: 'middle' } } axisLeft={ { orient: 'left', legend: 'count', legendOffset: -40, legendPosition: 'middle' } } yScale={ { type: 'linear', min: 0, max: 'auto', } } xScale={ { type: 'linear', min: 0, max: 'auto', } } colors={ ["#2ca02c", "#d62728", "#ff7f0e", "#1f77b4", "hsl(269, 70%, 50%)"] }
            enablePoints={ false } pointSize={ 10 } pointColor={ { theme: 'background' } } pointBorderWidth={ 2 } pointBorderColor={ { from: 'serieColor' } }
            pointLabel="y" pointLabelYOffset={ -12 } useMesh={ true } legends={ [{ anchor: 'bottom-right', direction: 'column', justify: false, translateX: 100, translateY: 0, itemsSpacing: 0, itemDirection: 'left-to-right', itemWidth: 80, itemHeight: 20, itemOpacity: 0.75, symbolSize: 12, symbolShape: 'circle', symbolBorderColor: 'rgba(0, 0, 0, .5)', effects: [{ on: 'hover', style: { itemBackground: 'rgba(0, 0, 0, .03)', itemOpacity: 1 } }] }] } />
  );
}

const optimPlotSIERSim = (T, params, optionalParams) => {
  let {b =1.9 / 100, d =0.8 / 100, nu = 0.8, rho =1 / 2, alpha =1 / 14, _beta = 4, beta =1 / 4, sigma =1 / 3, gamma =1 / 7, _S0 = .9, _I0 = .1, _E0 = 0, _R0 = 0, S0 = .25, I0 = .25, E0 = .25, R0 = .25, } = (params || {});
  let {epsilon_t = 1e-2, epsilon_n = 100} = (optionalParams || {});

  const dt = epsilon_t;
  const deltan = epsilon_n;

  b = b / 365; // Adjusted by year
  d = d / 365; // Adjusted by year
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
  //"color": "hsl(269, 70%, 50%)",
  let output = [
    {
      "id": "R",
      "data": [],
    },
    {
      "id": "I",
      "data": [],
    },
    {
      "id": "E",
      "data": [],
    },
    {
      "id": "S",
      "data": [],
    },
  ///{ "id": "N", "data": [], },
  ];
  const indices = {
    S: 3,
    I: 1,
    E: 2,
    R: 0
  };
  //
  output[indices.S].data.push({
    x: 0,
    y: S
  })
  output[indices.E].data.push({
    x: 0,
    y: E
  })
  output[indices.I].data.push({
    x: 0,
    y: I
  })
  output[indices.R].data.push({
    x: 0,
    y: R
  })
  ///output[4].data.push({x: 0, y: N})
  //
  for (let i = 1; i < T; i++) {
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
    if (i % deltan == 0) {
      output[indices.S].data.push({
        x: dt * i,
        y: S
      })
      output[indices.E].data.push({
        x: dt * i,
        y: E
      })
      output[indices.I].data.push({
        x: dt * i,
        y: I
      })
      output[indices.R].data.push({
        x: dt * i,
        y: R
      })
    ///output[4].data.push({x: dt * i, y: N})
    }
  }
  return output
}


const SEIRSModelParameters = ({onParamUpdate}) => {
  onParamUpdate = onParamUpdate ? onParamUpdate : (() => null);
  let [modelParams, setModelParams] = useState(Object.assign({}, {
    b: 1.9 / 100,
    d: 0.8 / 100,
    nu: 0.8,
    rho: 1 / 2,
    alpha: 1 / 14,
    beta: 1 / 4,
    sigma: 1 / 3,
    gamma: 1 / 7,
    S0: .25,
    I0: .25,
    E0: .25,
    R0: .25,
  }))
  const model_params = {
    get: () => modelParams,
    set: (v) => {
      console.log(v);
      onParamUpdate(v);
      setModelParams(v);
    },
    setField: (f, v) => {
      modelParams[f] = v;
    },
    getField: (f) => modelParams[f],
  };
  //
  return (
    <div>
      <H4>Parameters</H4>
      <InputModelParameter model_params={ model_params } field="b" defaultValue={ 1.9 / 100 } symbol={ "b" } label="Birth Rate [births person day]"
        description="Birth rate of newborns each year" />
      <InputModelParameter model_params={ model_params } field="d" defaultValue={ 0.8 / 100 } symbol={ "d" } label="Death Rate [deaths person day]"
        description="Death rate of susceptible, exposed, infected, and recovered individuals each year" />
      <InputModelParameter model_params={ model_params } field="nu" defaultValue={ 0.8 } symbol={ "\\nu" } label="Vaccination Proportion (Newborns)"
        description="Proportion of vaccinated newborns" />
      <InputModelParameter model_params={ model_params } field="rho" defaultValue={ 1 / 2 } symbol={ "\\rho" } label="Vaccination Rate (Susceptible) [1/days]"
        description="Rate at which susceptible individuals are vaccinated and leave susceptible class and enter recovered class to gain temporary immunity" inverse_label="Mean Susceptibility Period [days]"
        inverse_description="(Pre-Vaccination of Susceptible Individuals) Time for susceptible individuals to become recovered individuals" />
      <InputModelParameter model_params={ model_params } field="alpha" defaultValue={ 1 / 14 } symbol={ "\\alpha" } label="Transmission Rate (Recovered to Susceptible)  [1/days]"
        description="Rate at which recovered individuals lose temporary immunity and leave recovered class and enter susceptible class" inverse_label="Mean Temporary Immunity Period [days]"
        inverse_description="Time for recovered individuals to become susceptible individuals" />
      <InputModelParameter model_params={ model_params } field="beta" defaultValue={ 4 } symbol={ "\\beta" } label="Transmission Rate (Susceptible to Infected) [1/days]"
        description="Rate at which susceptible individuals become exposed by infected individuals and leave susceptible class and enter exposed class" inverse_label="Mean Susceptibility Period (Pre-Exposed Individuals) [days]"
        inverse_description="Time for susceptible individuals to become exposed individuals" />
      <InputModelParameter model_params={ model_params } field="sigma" defaultValue={ 1 / 3 } symbol={ "\\sigma" } label="Transmission Rate (Exposed to Infected) [1/days]"
        description="Rate at which exposed individuals become infected by incubating infection and leave exposed class and enter infected class" inverse_label="Mean Latency Period [days]"
        inverse_description="Time for exposed individuals to become infected individuals" />
      <InputModelParameter model_params={ model_params } field="gamma" defaultValue={ 1 / 7 } symbol={ "\\gamma" } label="Recovery Rate (Infected to Recovered) [1/days]"
        description="Rate at which infected individuals leave infected class and enter recovered class" inverse_label="Mean Infectious Period [days]" inverse_description="Time for infected individuals to become recovered individuals"
      />
      <H4>Initial values</H4>
      <InputModelParameter model_params={ model_params } field="S0" defaultValue={ 0.9 } symbol={ "S_0" } label="Initial proportion of susceptibles"
        description="The percentage of susceptible individuals at the beginning of the model run." />
      <InputModelParameter model_params={ model_params } field="E0" defaultValue={ 0 } symbol={ "E_0" } label="Initial proportion of exposed"
        description="The percentage of exposed individuals at the beginning of the model run." />
      <InputModelParameter model_params={ model_params } field="I0" defaultValue={ 0.1 } symbol={ "I_0" } label="Initial proportion of infected"
        description="The percentage of infected individuals at the beginning of the model run." />
      <InputModelParameter model_params={ model_params } field="S0" defaultValue={ 0 } symbol={ "S_0" } label="Initial proportion of recovered"
        description="The percentage of recovered individuals at the beginning of the model run." />
      <InputModelParameter model_params={ model_params } field="N0" defaultValue={ 0 } symbol={ "N_0" } label="Initial population" description="Population the beginning of the model run."
      />
    </div>
  )
}


import { ResponsiveAreaBump } from '@nivo/bump'


export const SEIRSModel = () => {
  const [isOpen, setOpen] = useState(true);
  const [dataSimulation, setDataSimulation] = useState([]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const updateSimulation = (params) => {
    console.log("TRIGGERED", params)
    setDataSimulation(optimPlotSIERSim(50e2, params, {
      epsilon_n: 100,
      epsilon_t: 1e-2
    }));
  }
  if (dataSimulation.length == 0) updateSimulation({});

  return (
    <React.Fragment>
      <Button onClick={ handleOpen }>Show dialog</Button>
      <Dialog className="param-dialog" icon="info-sign" onClose={ handleClose } title="SEIRS Model" isOpen={ isOpen } canOutsideClickClose={ false }>
        <div className={ Classes.DIALOG_BODY }>
          <SplitPane split="vertical" className="sim-pane-window">
            <Pane initialSize="50%" minSize="350px" className="param-pane">
              <div>
                <SEIRSModelParameters onParamUpdate={ updateSimulation } />
              </div>
            </Pane>
            <Pane initialSize="50%" minSize="250px" className="preview-pane">
              <div>
                <H3>Model projection</H3>
                <div className="plot">
                  <SingleSimLine data={ dataSimulation } enablePoints={ false } />
                </div>
                <div class="bp3-callout bp3-intent-warning">
                  <h4 class="bp3-heading">Note</h4> This simulated projection only relates to the choosen parameters and not to the whole simulation.
                </div>
              </div>
            </Pane>
          </SplitPane>
        </div>
        <div className={ Classes.DIALOG_FOOTER }>
          <div className={ Classes.DIALOG_FOOTER_ACTIONS }>
            <Tooltip content="This button is hooked up to close the dialog.">
              <Button onClick={ handleClose }>Close</Button>
            </Tooltip>
            <AnchorButton intent={ Intent.PRIMARY } onClick={ handleClose } href="#"> Apply </AnchorButton>
          </div>
        </div>
      </Dialog>
    </React.Fragment>
  )
};

