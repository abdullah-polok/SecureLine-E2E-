import React, { createContext, useContext } from "react";
import { Link } from "react-router";
import { AuthContext } from "../../AuthProvider/AuthContext";

const Users = () => {
  const { allusers } = useContext(AuthContext);
  // console.log(allusers);
  return (
    <div className="flex gap-x-4">
      {allusers.map((person) => (
        <Link key={person.id} to={`/users/${person.id}`}>
          <div className="w-16">
            <div className="avatar avatar-online">
              <div className="w-14 rounded-full">
                <img src="https://img.daisyui.com/images/profile/demo/gordon@192.webp" />
              </div>
            </div>
            <div className="text-center text-xs">
              <h1>{person.displayName}</h1>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Users;
