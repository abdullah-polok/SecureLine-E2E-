import React from "react";
import AllPerson from "../../Components/AllPerson/AllPerson";
import Login from "../Auth/Login/Login";
import Navbar from "../../Components/Header/Navbar";

const Home = () => {
  return (
    <div className="p-4 max-h-full">
      <Navbar></Navbar>
      {/* <Login></Login> */}
      <AllPerson></AllPerson>
    </div>
  );
};

export default Home;
