import React, { Fragment, useState, useContext, useEffect } from 'react';
import { Route, useHistory, Link } from "react-router-dom";
import { GlobalContext, emptyInterventionState } from '../context/GlobalState';
import { EditEpidemicModel } from "./EditEpidemicModel.jsx";

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

import { createPortal } from "react-dom";

import { withRouter, useRouteMatch } from 'react-router-dom';

export const EditInterventionRoute = (route) => <EditIntervention />
export const EditIntervention = () => {
  let history = useHistory();
  const routeMatch = useRouteMatch();
  const {interventions, editIntervention, addIntervention} = useContext(GlobalContext);
  const [selectedIntervention, setSelectedIntervention] = useState(emptyInterventionState);
  const [innerModel, setInnerModel] = useState({});
  const currentUserId = routeMatch.params.id;
  //console.log("route.match.url", route.match)
  //console.log("innerModel", innerModel)

  const isNewId = typeof (currentUserId) == "undefined";
  //console.log(currentUserId)

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
  }

  const handleOnChange = (userKey, value) => setSelectedIntervention({
    ...selectedIntervention,
    [userKey]: value
  })

  const changeInfectionModel = (value) => handleOnChange("infectionModel", {
    ...selectedIntervention.infectionModel,
    ...value
  })

  const renderEditEpidemicModel = () => createPortal(
    <EditEpidemicModel updateModel={ changeInfectionModel } targetModel={ selectedIntervention.infectionModel }>
      <div style={ { display: "flex", alignItems: "center", justifyContent: "center", height: '100%' } }>
        Edit Profile Modal!
      </div>
    </EditEpidemicModel>,
    document.getElementById("modal-root"),
  )

  if (!selectedIntervention || !selectedIntervention.id) {
    return <div>[NO DATA]</div>
  }

  /*
  return (
    <Fragment>
      <div className="w-full max-w-sm container mt-20 mx-auto">
        <form onSubmit={ onSubmit }>
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
          <Link to={ `${route.match.url}/edit-epidemic` }>Edit Epidemic Model</Link>
          <Route path={ `${route.match.url}/edit-epidemic` } render={ renderEditEpidemicModel } />
          <div className="flex items-center justify-between">
            <button className="block mt-5 bg-green-400 w-full hover:bg-green-500 text-white font-bold py-2 px-4 rounded focus:text-gray-600 focus:shadow-outline">
              { isNewId ? "Add Intervention Model" : "Edit Intervention Model" }
            </button>
          </div>
          <div className="text-center mt-4 text-gray-500">
            <Link to='/'>Cancel</Link>
          </div>
        </form>
      </div>
    </Fragment>
  )
*/

  return (
    <div className="bp3-dialog-container">
      <div className="bp3-dialog">
        <form onSubmit={ onSubmit }>
          <div className="bp3-dialog-header">
            <span className="bp3-icon-large bp3-icon-inbox"></span>
            <h4 className="bp3-heading">Intervention details</h4>
          </div>
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
            <Link to={ `${routeMatch.url}/edit-epidemic` }>Edit Epidemic Model</Link>
            <Route path={ `${routeMatch.url}/edit-epidemic` } render={ renderEditEpidemicModel } />
          </div>
          <div className="bp3-dialog-footer">
            <div className="bp3-dialog-footer-actions">
              <Link to='/'>
                <button type="button" className="bp3-button">Cancel</button>
              </Link>
              <button type="submit" className="bp3-button bp3-intent-primary">
                { isNewId ? "Add Intervention Model" : "Edit Intervention Model" }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}