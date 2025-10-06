import React, { useContext } from "react";
import { AuthContext } from "../../AuthProvider/AuthContext";
import { Navigate, useNavigate } from "react-router";
import { signOut } from "firebase/auth";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => {
    signOut(user.auth);
    navigate("/");
  };
  return (
    <div className="navbar bg-blue-300 shadow-sm ">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Secureline</a>
      </div>
      <div className="flex gap-2">
        {user ? (
          <>
            <h1 className="text-xs">{user?.displayName}</h1>
            <button onClick={handleLogout} className="btn">
              logout
            </button>
          </>
        ) : (
          <>{/* <h1>{user?.displayName}</h1> */}</>
        )}
      </div>
    </div>
  );
};

export default Navbar;
