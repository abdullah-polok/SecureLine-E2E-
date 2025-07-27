import React, { useContext } from "react";
import { AuthContext } from "../AuthProvider/AuthContext";
import Login from "../Pages/Auth/Login/Login";
import { Navigate } from "react-router";

const PrivateRouter = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading)
    return (
      <div className="flex justify-center items-center mt-10 min-h-screen">
        <div className="flex w-52 flex-col gap-4 ">
          <div className="skeleton h-32 w-full"></div>
          <div className="skeleton h-4 w-28"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-full"></div>
        </div>
      </div>
    );
  if (!user)
    return (
      <>
        <Login></Login>
      </>
    );
  //check user login or not
  if (user) return children;

  return <Navigate to={"/home"}></Navigate>;
};

export default PrivateRouter;
