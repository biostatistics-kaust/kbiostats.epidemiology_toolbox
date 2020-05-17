import React, { Fragment } from 'react';
import { Route, useHistory, Link, withRouter } from "react-router-dom";
import { InterventionHeading } from './InterventionHeading';
import { InterventionList } from './InterventionList';
import { InterventionTimeline } from "./InterventionTimeline/index.jsx"
import { Card, Overlay, Classes, Code, H3, H4, H5, Icon, Label, Slider, Tooltip, ContextMenuTarget, AnchorButton, Button, Intent, Spinner, Menu, MenuDivider, MenuItem, Popover, Position, Dialog, Input } from "@blueprintjs/core";
import "./general.less";

//<InterventionHeading />
//<h3 className="text-center  text-3xl mt-20 text-base leading-8 text-black font-bold tracking-wide uppercase">Epidemiologic models</h3>
export const Home = () => {
  return (
    <Fragment>
      <div className="App">
        <div className="container mx-auto">
          <div className="titles">
            <div class="icon" />
            <h1 class="title">K-Epidemiologic toolbox </h1>
            <a class="subtitle" href="https://cemse.kaust.edu.sa/biostats" target="_blank">Biostatistics research group at KAUST</a>
          </div>
          <Card className="actions" interactive={ true }>
            <ul>
              <li className="disabled">Load a saved <a href="#">intervention plan</a> from disk</li>
              <li>Create and simulate a
                <Link to='/timeline'>new intervention</Link> plan</li>
            </ul>
          </Card>
        </div>
      </div>
    </Fragment>
  )
}
