import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { IoChevronBackOutline } from "react-icons/io5";
import { AuthContext } from "../../AuthProvider/AuthContext";
import { IoSend } from "react-icons/io5";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase.config";
const User = () => {
  const { storedMessages, setReceiverId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messagesList, setMessagesList] = useState([]);
  const [chatId, setChatId] = useState(null);
  const {
    user,
    message,
    setMessage,
    generalBinaryConvertor,
    binaryToText,
    generataRandomInitilKey,
  } = useContext(AuthContext);
  const { id } = useParams(); // <-- get dynamic portion of a link
  setReceiverId(id);
  const getInputText = (event) => {
    setMessage(event.target.value);
  };
  // console.log(storedMessages);
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
        {storedMessages?.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.senderId === user.uid ? "justify-end" : "justify-start"
            }`}
          >
            <div>
              <p
                className={`p-3 rounded-lg max-w-[70%] break-words ${
                  msg.senderId === user.uid
                    ? "bg-[#0385ff] text-white"
                    : "bg-[#eeefee]"
                }`}
              >
                {binaryToText(msg.ciphertextHex)} {/* or decrypted text */}
              </p>
            </div>
          </div>
        ))}
        <div className="flex items-center">
          <div className="w-full">
            <input
              onChange={getInputText}
              type="text"
              value={message}
              placeholder="message"
              className="input input-accent"
            />
          </div>
          <div className="text-xl">
            <button onClick={generalBinaryConvertor}>
              <IoSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
