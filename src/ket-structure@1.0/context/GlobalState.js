import React, { createContext, useReducer } from 'react';
import moment from "moment";
import AppReducer from './AppReducer'

import { SEIRSModelDefaultParameters } from "../components/SEIRSModel/defaultParameters.jsx";

const defaultSEIRModel = {
  "b": {
    "distribution": "uniform",
    "min": 0.010450000000000001,
    "max": 0.027549999999999998,
    "mean": 0.019
  },
  "d": {
    "distribution": "uniform",
    "min": 0.0044,
    "max": 0.0116,
    "mean": 0.008
  },
  "nu": {
    "distribution": "uniform",
    "min": 0.44000000000000006,
    "max": 1.16,
    "mean": 0.8
  },
  "rho": {
    "distribution": "uniform",
    "min": 0.275,
    "max": 0.725,
    "mean": 0.5
  },
  "alpha": {
    "distribution": "uniform",
    "min": 0.039285714285714285,
    "max": 0.10357142857142856,
    "mean": 0.07142857142857142
  },
  "beta": {
    "distribution": "uniform",
    "min": 0.1375,
    "max": 0.3625,
    "mean": 0.25
  },
  "sigma": {
    "distribution": "uniform",
    "min": 0.18333333333333335,
    "max": 0.4833333333333333,
    "mean": 0.3333333333333333
  },
  "gamma": {
    "distribution": "uniform",
    "min": 0.07857142857142857,
    "max": 0.20714285714285713,
    "mean": 0.14285714285714285
  },
  "S0": {
    "distribution": "uniform",
    "min": 0.1375,
    "max": 0.3625,
    "mean": 0.25
  },
  "I0": {
    "distribution": "uniform",
    "min": 0.1375,
    "max": 0.3625,
    "mean": 0.25
  },
  "E0": {
    "distribution": "uniform",
    "min": 0.1375,
    "max": 0.3625,
    "mean": 0.25
  },
  "R0": {
    "distribution": "uniform",
    "min": 0.1375,
    "max": 0.3625,
    "mean": 0.25
  },
  "Nfactor": {
    "distribution": "uniform",
    "min": 0.55,
    "max": 1.45,
    "mean": 1
  }
};
const initialState = {
  interventions: [
    {
      id: 1,
      name: 'Status quo (default condition)',
      color: "#d27514",
      startDate: moment().format('MMMM Do YYYY'),
      endDate: moment().add(30, "days").format('MMMM Do YYYY'),
      infectionModel: {
        type: "SEIRS",
        parameters: {
          ...SEIRSModelDefaultParameters()
        },
      }
    }
  ],
  simulations: {
    dates: {
      totalDays: 1,
      startDates: [moment().format('MMMM Do YYYY')],
      endDates: [moment().format('MMMM Do YYYY')],
      minStartDate: moment().format('MMMM Do YYYY'),
      maxStartDate: moment().format('MMMM Do YYYY'),
      minEndDate: moment().format('MMMM Do YYYY'),
      maxEndDate: moment().format('MMMM Do YYYY'),
    },
    curves: [],
    percentileCurves: [],
  },
}

export const emptyInterventionState = {
  id: "",
  name: 'New intervention',
  color: "#5883b7",
  startDate: moment().format('MMMM Do YYYY'),
  endDate: moment().add(13, "days").format('MMMM Do YYYY'),
  infectionModel: {
    type: "SEIRS",
    parameters: {
      ...SEIRSModelDefaultParameters()
    },
  }
}

export const GlobalContext = createContext(initialState);
export const GlobalProvider = ({children}) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  function removeIntervention(id) {
    dispatch({
      type: 'REMOVE_INTERVENTION',
      payload: id
    });
  }
  ;

  function addIntervention(interventions) {
    dispatch({
      type: 'ADD_INTERVENTION',
      payload: interventions
    });
  }
  ;

  function editIntervention(interventions) {
    dispatch({
      type: 'EDIT_INTERVENTION',
      payload: interventions
    });
  }
  ;

  function setSimulations(simulationCurves) {
    dispatch({
      type: 'SET_SIMULATIONS',
      payload: simulationCurves
    });
  }
  ;
  return (<GlobalContext.Provider value={ { interventions: state.interventions, removeIntervention, addIntervention, editIntervention, simulations: state.simulations, setSimulations } }>
            { children }
          </GlobalContext.Provider>);
}