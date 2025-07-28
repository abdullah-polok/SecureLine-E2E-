import React, { createContext } from "react";
import { Link } from "react-router";

const Users = () => {
  return (
    <div>
      <Link to={"/users/user"}>
        <div className="w-16">
          <div className="avatar avatar-online">
            <div className="w-20 rounded-full">
              <img src="https://img.daisyui.com/images/profile/demo/gordon@192.webp" />
            </div>
          </div>
          <div className="text-right">
            <h1>Abdullah</h1>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Users;
