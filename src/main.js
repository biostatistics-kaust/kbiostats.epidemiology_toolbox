
import React from 'react';
import { render } from 'react-dom';

//import './main.css';
import "normalize.css/normalize.css";
import classNames from "classnames";

import { Button, Intent, Spinner, Menu, MenuDivider, MenuItem, Popover, Position } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

//import SplitPane, { Pane } from 'react-split-pane';
import SplitPane from 'react-split-pane/lib/SplitPane.js';
import Resizer from 'react-split-pane/lib/Resizer.js';
import Pane from 'react-split-pane/lib/Pane.js';
//http://react-split-pane-v2.surge.sh/?MultipleVerticalExample

import { Tabs, TabList, Tab, PanelList, Panel } from 'react-tabtab';
import * as customStyle from 'react-tabtab/lib/themes/bulma';
//https://github.com/ctxhou/react-tabtab
import { ContextMenuTarget } from "@blueprintjs/core";
import { Overlay, Classes, Code } from "@blueprintjs/core";

/*
import {MainWindow} from "./ket-components@1.0/ket-main-window.jsx";

render(<MainWindow/>, document.getElementById("app"));
*/

import * as App from "./ket-structure@1.0/main.jsx";
