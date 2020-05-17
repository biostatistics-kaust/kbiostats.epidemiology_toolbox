import React from 'react';
import { createPortal } from "react-dom";
import { Route, Switch, withRouter } from 'react-router-dom';
import './stylesheet/styles.css';
import { Home } from './components/Home';

import { GlobalProvider } from './context/GlobalState';

import { EditInterventionRoute } from './components/EditIntervention/index.jsx';
import { RunEpidemicSimulation } from './components/RunEpidemicSimulation/index.jsx';
import { RunHospitalSimulation } from './components/RunHospitalSimulation/index.jsx';
import { RunRBinomHospitalSimulation } from './components/RunRBinomHospitalSimulation/index.jsx';
import { RibbonBar } from "./components/RibbonBar/index.jsx";
import { MainFooter } from "./components/MainFooter/index.jsx";
import { InterventionTimeline } from "./components/InterventionTimeline/index.jsx"

//const makeRenderableDialog = (component) => (props) => [console.log(props), createPortal(withRouter(component)(props), document.getElementById("modal-root"))][1]
//<Route path="/dialog/add" render={ makeRenderableDialog(EditIntervention) } />
const App = () => {
  return (
    <React.Fragment>
      <div className="ket-main-window">
        <RibbonBar />
        <div className="ket-main-content">
          <GlobalProvider>
            <Switch>
              <Route path="/" component={ Home } exact />
              <Route path="/timeline" component={ InterventionTimeline } exact />
              <Route path="/add" component={ EditInterventionRoute } />
              <Route path="/edit/:id" component={ EditInterventionRoute } />
              <Route path="/epidemic-simulation" component={ RunEpidemicSimulation } />
              <Route path="/hospital-simulation" component={ RunHospitalSimulation } />
              <Route path="/rbinom-hospital-simulation" component={ RunRBinomHospitalSimulation } />
            </Switch>
          </GlobalProvider>
        </div>
        <MainFooter/>
      </div>
    </React.Fragment>
  );
}

export default App;
