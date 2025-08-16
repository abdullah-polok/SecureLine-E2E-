import React, { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { IoChevronBackOutline } from "react-icons/io5";
import { AuthContext } from "../../AuthProvider/AuthContext";
import { IoSend } from "react-icons/io5";
const User = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  const {
    user,
    generalBinaryConvertor,
    binaryToText,
    generataRandomInitilKey,
  } = useContext(AuthContext);

  const { id } = useParams(); // <-- get dynamic portion of a link
  console.log("Dynamic portion:", id, " User", user.uid);

  const getInputText = (event) => {
    setValue(event.target.value);
  };
  const sendText = () => {
    console.log(value);
  };
  return (
    <div>
      <div className="flex items-center bg-gray-300 p-2">
        <div className="flex items-center text-sm">
          <div className="text-lg">
            <IoChevronBackOutline />
          </div>
          Chats
        </div>
        <div className="mx-auto">
          <h1 className="text-sm">Abdullah</h1>
        </div>
      </div>

      <div className="bg-green-300 min-h-svh flex-1 overflow-y-auto p-3 space-y-3">
        <div className="flex ">
          <div>
            <p className="bg-[#eeefee]  p-3 rounded-lg">Its great</p>
          </div>
        </div>

        <div className="flex justify-end ">
          <div>
            <p className="bg-[#0385ff] p-3 rounded-lg text-white">
              Good to know Lorem ipsum dolor sit amet consectetur adipisicing
              elit. Minima, doloribus ipsa? Ut facilis architecto quos facere
              assumenda, laudantium et natus laborum obcaecati qui dolorem dicta
              blanditiis, repudiandae pariatur exercitationem consectetur!
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-full">
            <input
              onChange={getInputText}
              type="text"
              value={value}
              placeholder="message"
              className="input input-accent"
            />
          </div>
          <div className="text-xl">
            <button onClick={sendText}>
              <IoSend />
            </button>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button onClick={generalBinaryConvertor} className="btn  bg-red-400">
          Check
        </button>
        <button onClick={binaryToText} className="btn  bg-red-400">
          Check message
        </button>
        <button onClick={generataRandomInitilKey} className="btn  bg-red-400">
          Check 64
        </button>
      </div>
    </div>
  );
};

export default User;
