import React from 'react';
import { useState, useEffect } from 'react';
import { render } from 'react-dom';
import classNames from "classnames";
import SplitPane from 'react-split-pane/lib/SplitPane.js';
import Resizer from 'react-split-pane/lib/Resizer.js';
import Pane from 'react-split-pane/lib/Pane.js';
import { Button, Intent, Spinner, Menu, MenuDivider, MenuItem, Popover, Position } from "@blueprintjs/core";
import { ContextMenuTarget } from "@blueprintjs/core";
import { Overlay, Classes, Code } from "@blueprintjs/core";
import { H3, H5, Icon, Label, Slider, NumericInput } from "@blueprintjs/core";
import { Switch } from "@blueprintjs/core";
import './index.less';



const KERAutoNumericalInput = ({onChangeUISettings}) => {
  const [literalInput, setLiteralInput] = useState(false);
  onChangeUISettings = onChangeUISettings === null ? (() => {
  }) : onChangeUISettings;
  return (
    <span className="ket-numerical-input-selector" onClick={ e => {
                                                           e.stopPropagation()
                                                         } }>
                			<Switch
        className={ classNames("ket-numerical-input-switch") }
        checked={ literalInput }
        labelElement=""
        innerLabelChecked="Use sliders"
        innerLabel="Use numerical input"
        onChange={ (v) => [setLiteralInput(!literalInput), onChangeUISettings("preferSliderOverNumericalInput", !literalInput)] }
        />
                		</span>
  )
}

export const MainFooter = ({onChangeUISettings}) => {
  return (<div className="ket-main-footer">
            KAUST Biostatistics Group - Epidemiology Simulation Toolbox
            <KERAutoNumericalInput onChangeUISettings={ onChangeUISettings } />
          </div>);
}
