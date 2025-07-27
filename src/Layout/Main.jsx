import React from "react";

import { Outlet } from "react-router";
import Navbar from "../Components/Header/Navbar";
const Main = () => {
  return (
    <div className="max-w-sm mx-auto rounded-md">
      {/* <Navbar></Navbar> */}
      <div className="">
        <Outlet></Outlet>
      </div>
    </div>
  );
};

export default Main;
