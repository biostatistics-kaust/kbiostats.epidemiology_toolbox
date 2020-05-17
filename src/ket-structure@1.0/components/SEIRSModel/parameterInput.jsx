import React, { useState, useEffect, useRef } from 'react';
import { render, findDOMNode } from 'react-dom';
import classNames from "classnames";
import { Keys, Overlay, Classes, Code, H3, H4, H5, Icon, Label, Slider, Tooltip, ContextMenuTarget, AnchorButton, Button, Intent, Spinner, Menu, MenuDivider, MenuItem, Popover, Position, Dialog } from "@blueprintjs/core";
import SplitPane from 'react-split-pane/lib/SplitPane.js';
import Resizer from 'react-split-pane/lib/Resizer.js';
import Pane from 'react-split-pane/lib/Pane.js';
import TeX from '@matejmazur/react-katex';
import 'katex/dist/katex.min.css';
import * as math from "mathjs";
import './index.less';

export const UniformParameterInput = React.memo(({name, symbol, parameterName, units, model, updateModel, forceUpdate=false, inverse=false, disable=false} = {}) => {
  const [inputError, setInputError] = useState(false);
  const updateMeanValue = (param) => {
    const newValue = {
      ...param,
      mean: (param.min + param.max) * 0.5,
    }
    return newValue;
  }
  //onResetModel = onResetModel?onResetModel: (() => null);
  const onTargetChange = (param, val) => {
    updateModel(
      {
        ...model,
        [parameterName]: updateMeanValue({
          ...model[parameterName],
          [param]: val
        }),
      }
    )
  }
  const getNumValue = (txt) => {
    let result = null;
    try {
      result = math.evaluate(txt);
      if (inputError)
        setInputError(false);
    } catch ( e ) {
      setInputError(true);
    }
    return result;
  }
  //
  const onMinChange = (e) => {
    let result = getNumValue(intervalMinValue);
    if (math.isNumber(result)) {
      onTargetChange("min", inverse ? 1 / result : result);
      setInternalMinValue("")
    }
  }
  const onMaxChange = (e) => {
    let result = getNumValue(e.target.value);
    if (math.isNumber(result)) {
      onTargetChange("max", inverse ? 1 / result : result);
      setInternalMaxValue("")
    }
  }
  const onKeyDownMax = (e) => {
    if (e.keyCode === Keys.ENTER) {
      onMaxChange(e);
    }
  }
  const onKeyDownMin = (e) => {
    if (e.keyCode === Keys.ENTER) {
      onMaxChange(e);
    }
  }
  //
  let minValue = math.round(inverse ? 1 / model[parameterName].min : model[parameterName].min, 6);
  let maxValue = math.round(inverse ? 1 / model[parameterName].max : model[parameterName].max, 6);
  //
  const [intervalMinValue, setInternalMinValue] = useState("");
  const [intervalMaxValue, setInternalMaxValue] = useState("");
  const onInternalMaxValue = (e) => setInternalMaxValue(e.target.value);
  const onInternalMinValue = (e) => setInternalMinValue(e.target.value);
  //
  if (intervalMinValue === "" || (intervalMinValue != minValue && forceUpdate)) {
    setInternalMinValue(minValue);
  }
  if (intervalMaxValue === "" || (intervalMaxValue != maxValue && forceUpdate)) {
    setInternalMaxValue(maxValue);
  }
  //
  const unitTags = units ? (<span className="bp3-tag ml-5 float-right">{ units }</span>) : "";
  // TODO: Do it better
  if (inverse) {
    return (
      <div className={ classNames("mb-5", inputError ? "input-error" : "", {
                   "input-disabled": disable
                 }) }>
        <div className="w-full block mb-2">
          <span className="uppercase tracking-wide text-gray-700 text-xs font-bold mr-2"> { name } </span>
          <TeX>
            { symbol }
          </TeX>
          { unitTags }
        </div>
        <div className="flex flex-row bg-gray-200">
          <input className="hidden" type="text" placeholder="Min" value={ minValue } onChange={ () => false } />
          <input className="hidden" type="text" placeholder="Max" value={ maxValue } onChange={ () => false } />
          <input className="shadow appearance-none border rounded mr-2 py-2 px-3 text-gray-700 leading-tight focus:text-gray-600 focus:shadow-outline" type="text" placeholder="Max"
            onBlur={ onMaxChange } onKeyDown={ onKeyDownMax } value={ intervalMaxValue } onChange={ onInternalMaxValue } />
          <input className="shadow appearance-none border rounded mr-2 py-2 px-3 text-gray-700 leading-tight focus:text-gray-600 focus:shadow-outline" type="text" placeholder="Max"
            onBlur={ onMinChange } onKeyDown={ onKeyDownMin } value={ intervalMinValue } onChange={ onInternalMinValue } />
        </div>
      </div>
    )
  }
  return (
    <div className={ classNames("mb-5", inputError ? "input-error" : "", {
                   "input-disabled": disable
                 }) }>
      <div className="w-full block mb-2">
        <span className="uppercase tracking-wide text-gray-700 text-xs font-bold mr-2"> { name } </span>
        <TeX>
          { symbol }
        </TeX>
        { unitTags }
      </div>
      <div className="flex flex-row bg-gray-200">
        <input className="hidden" type="text" placeholder="Min" value={ minValue } onChange={ () => false } />
        <input className="hidden" type="text" placeholder="Max" value={ maxValue } onChange={ () => false } />
        <input className="shadow appearance-none border rounded mr-2 py-2 px-3 text-gray-700 leading-tight focus:text-gray-600 focus:shadow-outline" type="text" placeholder="Max"
          onBlur={ onMinChange } onKeyDown={ onKeyDownMin } value={ intervalMinValue } onChange={ onInternalMinValue } />
        <input className="shadow appearance-none border rounded mr-2 py-2 px-3 text-gray-700 leading-tight focus:text-gray-600 focus:shadow-outline" type="text" placeholder="Max"
          onBlur={ onMaxChange } onKeyDown={ onKeyDownMax } value={ intervalMaxValue } onChange={ onInternalMaxValue } />
      </div>
    </div>
  )
});

export const ParameterInput = UniformParameterInput;

export const InversableInputModelParameter = ({field, defaultValue, symbol, label, description, units, inverse_label, inverse_description, inverse_units, model, updateModel, inputProps}) => {
  const [paramValue, setParamValue] = useState(defaultValue);
  const [invParamValue, setInvParamValue] = useState(1 / defaultValue);
  //
  const [forceUpdate, setForceUpdate] = useState(false);
  const updateModelAndUpdateInverse = (m) => {
    updateModel(m);
    setTimeout(() => {
      setForceUpdate(true)
    }, 200);
    setTimeout(() => {
      setForceUpdate(false)
    }, 210);
  }
  //
  const directParam = (
  <Tooltip key={ "dir_" + field } className={ classNames("block-element", "descriptive-property", "SIERS", Classes.TOOLTIP_INDICATOR) } popoverClassName="SIERS-model-param-tooltip" content={ description + `. Default value: ${Math.round(paramValue * 10000) / 10000}` }>
    <ParameterInput name={ label } symbol={ symbol } parameterName={ field } model={ model } updateModel={ updateModelAndUpdateInverse }
      inverse={ false } units={ units } forceUpdate={ forceUpdate } />
  </Tooltip>
  );
  const inverseParam = (
  <Tooltip key={ "inv_" + field } className={ classNames("block-element", "descriptive-property", "SIERS", Classes.TOOLTIP_INDICATOR) } popoverClassName="SIERS-model-param-tooltip" content={ inverse_description + `. Default value: ${Math.round(1/paramValue * 10000) / 10000}` }>
    <ParameterInput name={ inverse_label } symbol={ "\\frac{1}{" + symbol + "}" } parameterName={ field } model={ model } updateModel={ updateModelAndUpdateInverse }
      inverse={ true } units={ inverse_units } forceUpdate={ forceUpdate } />
  </Tooltip>
  );
  return (
    <div className="input-parameter-group">
      { directParam }
      { inverse_label ? inverseParam : "" }
    </div>
  );
}
