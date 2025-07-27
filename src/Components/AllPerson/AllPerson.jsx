import React, { createContext } from "react";

const AllPerson = () => {
  return (
    <div>
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
    </div>
  );
};

export default AllPerson;
export const AuthContext = createContext(null);
