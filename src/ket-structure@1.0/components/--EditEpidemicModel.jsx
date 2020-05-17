import React, { Fragment, useState, useContext, useEffect } from 'react';
import { createPortal } from "react-dom";
import { Route, useHistory, Link } from "react-router-dom";

const modalStyle = {
  position: "fixed",
  left: 0,
  top: 0,
  bottom: 0,
  right: 0,
  backgroundColor: "rgba(0,0,0,.2)",
  color: "##FFF",
//fontSize: "40px",
};

export const EditEpidemicModel = ({targetModel, updateModel, children}) => {
  let history = useHistory();
  const [innerModel, setInnerModel] = useState({
    name: "A",
    startDate: "B",
    endDate: "C",
  });
  useEffect(() => {
    //setInnerModel(targetModel);
    setInnerModel({
      ...innerModel,
      ...targetModel,
    })
  }, []);
  const handleOnChange = (event, userKey, value) => setInnerModel({
    ...innerModel,
    [userKey]: value
  });
  const onSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateModel(innerModel)
    //console.log(innerModel)
    history.goBack();
  }
  const onClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateModel(innerModel);
    //console.log(innerModel)
    history.goBack();
  }
  //
  return (
    <div style={ modalStyle }>
      <form onSubmit={ onSubmit }>
        <div className="w-full mb-5">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="name">
            Intervention name
          </label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:text-gray-600 focus:shadow-outline" value={ innerModel.name }
            onChange={ (e) => handleOnChange(e, 'name', e.target.value) } type="text" placeholder="Enter name" />
        </div>
        <div className="w-full  mb-5">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="location">
            Start date
          </label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:text-gray-600 focus:shadow-outline" value={ innerModel.startDate }
            onChange={ (e) => handleOnChange(e, 'startDate', e.target.value) } type="text" placeholder="Enter date" />
        </div>
        <div className="w-full  mb-5">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="designation">
            End date
          </label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:text-gray-600 focus:shadow-outline" value={ innerModel.endDate }
            onChange={ (e) => handleOnChange(e, 'endDate', e.target.value) } type="text" placeholder="Enter designation" />
        </div>
        <div className="flex items-center justify-between">
          <button className="block mt-5 bg-green-400 w-full hover:bg-green-500 text-white font-bold py-2 px-4 rounded focus:text-gray-600 focus:shadow-outline">
            Submit
          </button>
        </div>
        <div className="text-center mt-4 text-gray-500" onClick={ onClose }>
          Cancel
        </div>
      </form>
    </div>);
}
