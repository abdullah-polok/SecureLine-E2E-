import React from "react";
import Login from "../Auth/Login/Login";
import Navbar from "../../Components/Header/Navbar";
import Users from "../../Components/AllPerson/Users";

const Home = () => {
  return (
    <div className="p-4 max-h-full">
      {/* <Navbar></Navbar> */}
      <Users></Users>
    </div>
  );
};

export default Home;
