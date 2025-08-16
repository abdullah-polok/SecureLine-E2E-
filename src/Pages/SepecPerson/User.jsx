import React, { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { IoChevronBackOutline } from "react-icons/io5";
import { AuthContext } from "../../AuthProvider/AuthContext";
import { IoSend } from "react-icons/io5";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase.config";
const User = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messagesList, setMessagesList] = useState([]);
  const [chatId, setChatId] = useState(null);
  const {
    user,
    generalBinaryConvertor,
    binaryToText,
    generataRandomInitilKey,
  } = useContext(AuthContext);

  const { id } = useParams(); // <-- get dynamic portion of a link
  console.log("Dynamic portion:", id, " User", user.uid);

  const getInputText = (event) => {
    setMessage(event.target.value);
  };

  const createFirstChat = async () => {
    // generate a chat document id
    const chatRef = doc(collection(db, "Chats"));
   ///check if chats already exist between two users
   const find=query(chatRef,where("participants","array-contains",user.uid));
   const snapShot=await getDocs(find);

   ///find the chat that contains the other user
   let chatDoc=snapShot.docs.find(doc=>doc.data().participants.includes(id));
if(chatDoc)
{
  setChatId(chatDoc.id);
}
 else{
  // create new chat
  const newChatRef=doc(chatRef); 
  await setDoc(newChatRef, {
      participants: [user.uid,id],
      lastMessage: { text: message || "", timeStamp: serverTimestamp() },
    });
setChatId(newChatRef.id);
 } 
 if(message)
  {
 // add the first message to the messages subcollection
    await addDoc(collection(chatRef, "messages"), {
      sender: user.uid,
      text: message,
      timestamp: serverTimestamp(),
    });
  } 
   
  };

  ///send a message
  const sendText = async () => {
if()

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
              value={message}
              placeholder="message"
              className="input input-accent"
            />
          </div>
          <div className="text-xl">
            <button onClick={createFirstChat}>
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
