import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { Route, Switch, useHistory, Link } from "react-router-dom";
import classNames from "classnames";
import { Button, Intent, Spinner, Menu, MenuDivider, MenuItem, Popover, Position, ContextMenuTarget, Overlay, Classes, Code, Icon } from "@blueprintjs/core";
import SplitPane from 'react-split-pane/lib/SplitPane.js';
import Resizer from 'react-split-pane/lib/Resizer.js';
import Pane from 'react-split-pane/lib/Pane.js';
import { Tabs, TabList, Tab, PanelList, Panel } from 'react-tabtab';
import * as customStyle from 'react-tabtab/lib/themes/bulma';
import './index.less';

export const RibbonBar = () => {
  const [showMenuItems, setShowMenuItems] = useState(true);
  let dblClick = false;
  const makeMenuItemsVisible = () => !dblClick && setShowMenuItems(true);
  const toggleMenuItemsVisible = () => setShowMenuItems(!showMenuItems);
  const toggleMenuItemsVisibleIfHidden = (e) => {
    e.preventDefault(); e.stopPropagation();
    dblClick = true; setShowMenuItems(!showMenuItems);
    dblClick = false;
  };
  return (
    <div className={ classNames("ket-main-menu", {
                   minimized: !showMenuItems,
                   restored: showMenuItems,
                 }) }>
      <Button className="minimize-bar" icon="chevron-down" text="" minimal={ true } onClick={ toggleMenuItemsVisible } />
      <Tabs customStyle={ customStyle } showModalButton={ false }>
        <TabList>
          <Tab>
            <div onClick={ makeMenuItemsVisible } onDoubleClick={ toggleMenuItemsVisibleIfHidden }>
              EpiToolbox
            </div>
          </Tab>
          <Tab>
            <div onClick={ makeMenuItemsVisible } onDoubleClick={ toggleMenuItemsVisibleIfHidden }>
              Epidemic model
            </div>
          </Tab>
          <Tab>
            <div onClick={ makeMenuItemsVisible } onDoubleClick={ toggleMenuItemsVisibleIfHidden }>
              Capacity planning model
            </div>
          </Tab>
          <Tab>
            <div onClick={ makeMenuItemsVisible } onDoubleClick={ toggleMenuItemsVisibleIfHidden }>
              Reports
            </div>
          </Tab>
          <Tab>
            <div onClick={ makeMenuItemsVisible } onDoubleClick={ toggleMenuItemsVisibleIfHidden }>
              Help
            </div>
          </Tab>
        </TabList>
        <PanelList>
          <Panel>
            <Link to='/not-implemented' className='menu-item'>
              <Button className="big" icon="document-open" text="Open" minimal={ true } disabled={ true } />
            </Link>
            <Link to='/not-implemented' className='menu-item'>
              <Button className="big" icon="document-open" text="Open" minimal={ true } disabled={ true } />
            </Link>
            <Link to='/not-implemented' className='menu-item'>
              <Button className="big" icon="import" text="Save" minimal={ true } disabled={ true } />
            </Link>
          </Panel>
          <Panel>
            <Link to='/timeline' className='menu-item'>
              <Button className="big" icon="new-layers" text="Intervention plan" minimal={ true } />
            </Link>
            <Link to='/epidemic-simulation' className='menu-item'>
              <Button className="big" icon="exchange" text="SEIRS simulation" minimal={ true } />
            </Link>
          </Panel>
          <Panel>
            <Link to='/hospital-simulation' className='menu-item'>
              <Button className="big" icon="inheritance" text="Common model" minimal={ true } />
            </Link>
            <Link to='/rbinom-hospital-simulation' className='menu-item'>
              <Button className="big" icon="inheritance" text="NegBin model" minimal={ true } />
            </Link>
          </Panel>
          <Panel>
            <Link to='/a' className='menu-item'>
              <Button className="big" icon="merge-links" text="Simulations" minimal={ true } disabled={ true } />
            </Link>
            <Link to='/a' className='menu-item'>
              <Button className="big" icon="document" text="Report" minimal={ true } disabled={ true } />
            </Link>
          </Panel>
          <Panel>
            { false ? <React.Fragment>
                        <Link to='/a' className='menu-item'>
                          <Button className="big" icon="help" text="Simulations" minimal={ true } disabled={ true } />
                        </Link>
                        <Link to='/a' className='menu-item'>
                          <Button className="big" icon="git-repo" text="Source-code" minimal={ true } disabled={ true } />
                        </Link>
                        <Link to='/a' className='menu-item'>
                          <Button className="big" icon="help" text="Help" minimal={ true } disabled={ true } />
                        </Link>
                      </React.Fragment>
              : "" }
            <Link to='/' className='menu-item'>
              <Button className="big" icon="help" text="About" minimal={ true } />
            </Link>
          </Panel>
        </PanelList>
      </Tabs>
    </div>
  );
}