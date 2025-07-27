import React from "react";
import AllPerson from "../../Components/AllPerson/AllPerson";
import Login from "../Auth/Login/Login";

const Home = () => {
  return (
    <div className="p-4 max-h-full">
      <Login></Login>
      {/* <AllPerson></AllPerson> */}
    </div>
  );
};

export default Home;
