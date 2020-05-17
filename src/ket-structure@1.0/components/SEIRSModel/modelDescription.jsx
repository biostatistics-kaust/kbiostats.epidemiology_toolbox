import React, { Fragment, useState, useContext, useEffect } from 'react';
import { createPortal } from "react-dom";
import { Route, useHistory, Link, withRouter } from "react-router-dom";
import classNames from "classnames";
import TeX from '@matejmazur/react-katex';
import 'katex/dist/katex.min.css'; // It does not work from less file
import { Tooltip, Img, AnchorButton, Button, Intent, Spinner, Menu, MenuDivider, MenuItem, Popover, Position, Dialog, H1, H2, H3, H5, Classes } from "@blueprintjs/core";
import "./index.less";

const SEIRSModelDescription = () => (
  <React.Fragment>
    <H5>Compartmental model</H5>
    <div className="SEIRS-diagram" />
    <H5>Mathematical formulation</H5>
    <TeX block className="equation">
      { String.raw`
                   \dot{S}  =b\left(1-\nu\right)N-\frac{1}{N}\beta SI-dS+\alpha R-\rho S\\
                  \dot{E}  =\frac{1}{N}\beta SI-\sigma E-dE\\
                  \dot{I}  =\sigma E-\gamma I-dI\\
                  \dot{R}  =b\nu N+\gamma I-dR-\alpha R+\rho S\\
                  N =S+E+I+R \\
                   R_0 =  \frac{\sigma}{\sigma + \mu} \frac{\beta}{\gamma + \mu}
            ` }
    </TeX>
    <p>
      The SEIRS model is a compartmental epidemic model that represents the population dynamics between four states: susceptible (S), exposed (E), infected (I), and recovered
      (R).
    </p>
    <p> Compared with other epidemic models, SEIRS defined a set of the population named exposed that comprises the people who had contact with infected people and eventually
      can develop the infection too.
    </p>
    <p> The flow between the 4 compartments is controlled by 6 rates:
      <TeX> \beta, \sigma, \gamma, \rho </TeX>, and
      <TeX> \alpha</TeX>. This model also takes into account the birth and death rates
      <TeX> b, d</TeX>, and vaccination of newborns
      <TeX> \nu</TeX> and grown-up individuals
      <TeX> \rho</TeX>.
    </p>
  </React.Fragment>
)

export const SEIRSModelDescriptionDialog = () => {
  let defaultModel = {} //HospitalCapacityDefaultParams();
  const [isOpen, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  }
  const onSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
  }
  return (
    <React.Fragment>
      <Button onClick={ handleOpen } icon={ "publish-function" } intent={ Intent.SUCCESS }>More on SEIRS model</Button>
      <Dialog className="model-description-dialog" icon="info-sign" onClose={ handleClose } title="SEIRS model" isOpen={ isOpen } canOutsideClickClose={ true }>
        <form onSubmit={ onSubmit }>
          <div className={ Classes.DIALOG_BODY }>
            <SEIRSModelDescription />
          </div>
          <div className={ Classes.DIALOG_FOOTER }>
            <div className={ Classes.DIALOG_FOOTER_ACTIONS }>
              <button type="submit" className="bp3-button bp3-intent-primary">
                Close
              </button>
            </div>
          </div>
        </form>
      </Dialog>
    </React.Fragment>
  )
};