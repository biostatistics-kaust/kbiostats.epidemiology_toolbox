export default (state, action) => {
  switch (action.type) {
  case 'REMOVE_INTERVENTION':
    return {
      ...state,
      interventions: state.interventions.filter(intervention => intervention.id !== action.payload)
    };
  case 'ADD_INTERVENTION':
    return {
      ...state,
      interventions: [...state.interventions, action.payload]
    };
  case 'EDIT_INTERVENTION':
    const updatedIntervention = action.payload;

    const updatedInterventions = state.interventions.map(intervention => {
      if (intervention.id === updatedIntervention.id) {
        return updatedIntervention;
      }
      return intervention;
    });

    return {
      ...state,
      interventions: updatedInterventions
    };
  //
  case 'SET_SIMULATIONS':
    return {
      ...state,
      //simulations: [...state.simulations, action.payload]
      simulations: action.payload
    };
  //
  default:
    return state;
  }
}