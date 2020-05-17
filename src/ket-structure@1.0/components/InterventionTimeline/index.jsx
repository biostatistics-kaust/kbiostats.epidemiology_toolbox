import React, { useState, useEffect, Fragment, useContext } from 'react';
import { render, createPortal } from 'react-dom';
import { Route, Switch, useHistory, Link, useRouteMatch } from "react-router-dom";
import classNames from "classnames";
import { Slider, Button, ButtonGroup, Intent, Spinner, Menu, MenuDivider, MenuItem, Popover, Position, ContextMenuTarget, Overlay, Classes, Code, Icon } from "@blueprintjs/core";
import TimeLine from "../react-timeline-gantt-modified/TimeLine.jsx";
import moment from "moment";
import { GlobalContext } from '../../context/GlobalState';
import './index.less';

window.moment = moment
const timeScaleHandler = (() => {
  const intToDateScale = ["year", "month", "week", "day"];
  let date2int = {};
  let int2date = {};
  for (let i = 0; i < intToDateScale.length; i++) {
    date2int[intToDateScale[i]] = i;
    int2date[i] = intToDateScale[i];
  }
  return {
    int2date,
    date2int
  };
})();

export const InterventionTimeline = () => {
  const routerMatch = useRouteMatch();
  const history = useHistory();
  const {interventions, removeIntervention, editIntervention} = useContext(GlobalContext);
  const fields = interventions.map(intervention => (
    <div className="flex items-center bg-gray-100 mb-10 shadow" key={ intervention.id }>
      <div className="flex-auto text-left px-4 py-2 m-2">
        { intervention.name }
        <br/>
        { intervention.startDate }
        <br/>
        { intervention.endDate }
        <br/>
        { JSON.stringify(intervention.infectionModel) }
      </div>
      <div className="flex-auto text-right px-4 py-2 m-2">
        <Link to={ `/edit/${intervention.id}` }>
          <button onClick={ () => editIntervention(intervention.id) } className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold mr-3 py-2 px-4 rounded-full inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="feather feather-edit">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </Link>
        <button onClick={ () => removeIntervention(intervention.id) } className="block bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-full inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="feather feather-trash-2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
  ))

  /*
  {
      id: 1,
      start: d1,
      end: d2,
      name: "Default dynamics"
    }
  */
  //
  const timelineData = interventions.map(intervention => ({
    id: intervention.id,
    start: moment(intervention.startDate, 'MMMM Do YYYY').unix() * 1000,
    end: moment(intervention.endDate, 'MMMM Do YYYY').unix() * 1000 + 1000 * 3600 * 24, // Timeline.js do not include the last day inclusively. So, we apply this small tweak.
    name: intervention.name,
    rawData: intervention,
  }));
  const onUpdateTask = (item, props) => {
    //console.log("update", item, props);
    const newItem = {
      ...item,
      ...props,
    };
    editIntervention({
      ...item.rawData,
      name: newItem.name,
      startDate: moment(newItem.start).format('MMMM Do YYYY'),
      endDate: moment(newItem.end).subtract(1, "day").format('MMMM Do YYYY'), //To undo the previous tweak.
    })
  //dispatch(updateTask(item, props));
  };
  const onSelectItem = item => {
    console.log("select", item,);
  //dispatch(selectedItem(item));
  };
  const addTaskAction = () => {
    console.log("add-task");
  //dispatch(addTask());
  };
  const onCreateLink = item => {
    console.log("add-link");
  //dispatch(addLink(item));
  };
  const deleteTaskAction = () => {
    if (!props.selectedItem) {
      console.log("Nothing selected")
      return
    }
    console.log("delete");
  //dispatch(deleteItem(props.selectedItem));
  };
  const editTaskAction = () => {
    if (!props.selectedItem) {
      console.log("Nothing selected")
      return
    }
    console.log("edit-task");
  //dispatch(editItem(props.selectedItem));
  };
  const _changeDateScale = (v) => setDateScale(v);
  const changeDateScale = (v) => {
    setDateScale(v);
  }
  const onEditItem = (intervention) => {
    editIntervention(intervention.id)
  }
  const [selectedTimelineItem, setSelectedTimelineItem] = useState(null);
  const links = [];
  const [dateScale, setDateScale] = useState(timeScaleHandler.date2int["month"]);
  const dateScaleRendered = (n) => timeScaleHandler.int2date[n];
  //
  const extraButtons = [{
    button: <Button icon="edit" title="Edit intervention" />,
    onClick: (e) => {
      console.log("onTriggerEditItem", e)
      history.push(`/edit/${e.id}`)
    }
  }, {
    button: <Button icon="trash" title="Remove intervention" />,
    onClick: (e) => {
      console.log("onTriggerRemoveItem", e)
      removeIntervention(e.id);
    }
  }];
  //

  return (
    <Fragment>
      <div className="default-container">
        <div className="main-timeline-container">
          <div className="nav-container">
            <ButtonGroup style={ { minWidth: 200 } }>
              <Link to="/add">
                <Button icon="new-layers">Add intervention</Button>
              </Link>
              <Link to="/epidemic-simulation">
                <Button icon="new-layers">Simulate</Button>
              </Link>
            </ButtonGroup>
            <div className="mode-container-title"></div>
            <div className="operation-button-container">
              <Slider min={ 0 } max={ 1 } stepSize={ 1 } labelStepSize={ 1 } onChange={ changeDateScale } labelRenderer={ dateScaleRendered }
                showTrackFill={ true } value={ dateScale } />
            </div>
          </div>
          <div className="time-line-container">
            <TimeLine itemheight={ 40 } data={ timelineData } selectedItem={ selectedTimelineItem } links={ links } onUpdateTask={ onUpdateTask }
              onCreateLink={ onCreateLink } onSelectItem={ onSelectItem } mode={ timeScaleHandler.int2date[dateScale] } config={ { taskList: { title: { label: "Interventions' models", } } } } extraButtons={ extraButtons }
            />
          </div>
        </div>
      </div>
    </Fragment>
  )
}
