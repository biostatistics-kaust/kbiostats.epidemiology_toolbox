import React, { Fragment, useState, useContext, useEffect } from 'react';
import { createPortal } from "react-dom";
import { Route, useHistory, Link, withRouter } from "react-router-dom";
import classNames from "classnames";
import SplitPane from 'react-split-pane/lib/SplitPane.js';
import Resizer from 'react-split-pane/lib/Resizer.js';
import Pane from 'react-split-pane/lib/Pane.js';
import TeX from '@matejmazur/react-katex';
import 'katex/dist/katex.min.css'; // It does not work from less file
import { Pre, Collapse, Tooltip, AnchorButton, Button, Intent, Spinner, Menu, MenuDivider, MenuItem, Popover, Position, Dialog, H1, H2, H3, H5, Classes } from "@blueprintjs/core";
import { GlobalContext, emptyInterventionState } from '../../context/GlobalState';
import { SEIRSModel } from "../SEIRSModel/index.jsx";
//import { EditEpidemicModel } from "../EditEpidemicModel.jsx";
import { SEIRSModelDescriptionDialog } from "../SEIRSModel/modelDescription.jsx";
import "./index.less";


const DefaultCompartimentalModel = ({infectionModel, updateModel}) => {
  return (
    <React.Fragment>
      <div className="w-full  mb-5">
        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="location">
          Type
        </label>
        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:text-gray-600 focus:shadow-outline" value={ infectionModel.type }
          onChange={ e => updateModel({
                       type: e.target.value
                     }) } type="text" placeholder="Model type" />
      </div>
    </React.Fragment>
  )
}


const CollapsibleDataLog = (model) => {
  const [isOpen, setOpen] = useState(false);
  const handleClick = () => setOpen(!isOpen)
  return (
    <React.Fragment>
      <Button className="button-log-details" onClick={ handleClick }>
        { isOpen ? "Hide" : "Show" } model details
      </Button>
      <Collapse className="log-details" isOpen={ isOpen }>
        <Pre>{ JSON.stringify(model, null, 2) }</Pre>
      </Collapse>
    </React.Fragment>
  );
}

export const EditInterventionRoute = (route) => {
  const currentUserId = route.match.params.id;
  return <EditIntervention currentUserId={ currentUserId } />
}

export const EditIntervention = ({currentUserId}) => {
  const isNewId = currentUserId == null || typeof (currentUserId) == "undefined";
  let history = useHistory();
  const {interventions, editIntervention, addIntervention} = useContext(GlobalContext);
  const [selectedIntervention, setSelectedIntervention] = useState(emptyInterventionState);
  const [innerModel, setInnerModel] = useState({});

  useEffect(() => {
    const interventionID = currentUserId;
    if (isNewId) {
      const selectedIntervention = Object.assign({}, emptyInterventionState, true);
      selectedIntervention.id = interventions.length + 1;
      setSelectedIntervention(selectedIntervention);
    } else {
      const selectedIntervention = interventions.find(emp => emp.id === parseInt(interventionID));
      setSelectedIntervention(selectedIntervention);
    }
  // eslint-disable-next-line
  }, []);

  const onSubmit = e => {
    e.preventDefault();
    if (isNewId) {
      addIntervention(selectedIntervention);
    } else {
      editIntervention(selectedIntervention);
    }
    //history.push('/');
    history.goBack();
    e.stopPropagation();
  }

  const handleOnChange = (userKey, value) => setSelectedIntervention({
    ...selectedIntervention,
    [userKey]: value
  })

  const changeInfectionModel = (value) => handleOnChange("infectionModel", {
    ...selectedIntervention.infectionModel,
    ...value
  })

  const onModelUpdate = (value) => changeInfectionModel({
    parameters: value,
  })

  const DialogFragment = (
  <div className="bp3-dialog-container3 dialog-intervention-params">
    <div className="bp3-dialog3">
      <form onSubmit={ onSubmit }>
        <div className="bp3-dialog-body">
          <div className="w-full mb-5">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="name">
              Intervention name
            </label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:text-gray-600 focus:shadow-outline" value={ selectedIntervention.name }
              onChange={ (e) => handleOnChange('name', e.target.value) } type="text" placeholder="Enter name" />
          </div>
          <div className="w-full  mb-5">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="location">
              Start date
            </label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:text-gray-600 focus:shadow-outline" value={ selectedIntervention.startDate }
              onChange={ (e) => handleOnChange('startDate', e.target.value) } type="text" placeholder="Enter date" />
          </div>
          <div className="w-full  mb-5">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="designation">
              End date
            </label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:text-gray-600 focus:shadow-outline" value={ selectedIntervention.endDate }
              onChange={ (e) => handleOnChange('endDate', e.target.value) } type="text" placeholder="Enter designation" />
          </div>
          <DefaultCompartimentalModel infectionModel={ selectedIntervention.infectionModel } updateModel={ changeInfectionModel } />
        </div>
        <div className="bp3-dialog-footer">
          <div className="bp3-dialog-footer-actions">
            <Link to='/timeline'>
              <button type="button" className="bp3-button">Cancel</button>
            </Link>
            <button type="submit" className="bp3-button bp3-intent-primary">
              { isNewId ? "Create & add new intervention model" : "Save changes on the model" }
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
  );

  if (!selectedIntervention || !selectedIntervention.id) {
    return <div></div>
  //return <div>[NO DATA]</div> // <- it causes a flickering impression
  }

  const handleClose = () => {
    history.goBack();
  }
  const isOpen = true;
  return (
    <React.Fragment>
      <Dialog className="param-dialog" icon="info-sign" onClose={ handleClose } title="Intervention and epidemic model" isOpen={ isOpen } canOutsideClickClose={ false }>
        <div className={ Classes.DIALOG_BODY }>
          <SplitPane split="vertical" className="three-pane-window splitter-container">
            <Pane initialSize="30%" minSize="250px" className="left-pane model-edit-intervention">
              <div>
                { DialogFragment }
                <SEIRSModelDescriptionDialog />
                <CollapsibleDataLog model={ selectedIntervention } />
              </div>
            </Pane>
            <Pane initialSize="70%" minSize="30%" className="content-pane">
              <SEIRSModel model={ selectedIntervention.infectionModel.parameters } onModelUpdate={ onModelUpdate } />
            </Pane>
          </SplitPane>
        </div>
      </Dialog>
    </React.Fragment>
  );
}

