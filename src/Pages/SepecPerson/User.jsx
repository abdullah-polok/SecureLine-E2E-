import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { IoChevronBackOutline } from "react-icons/io5";
import { AuthContext } from "../../AuthProvider/AuthContext";
import { IoSend } from "react-icons/io5";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { auth, db } from "../../../firebase.config";
import useFetchMessages from "../../Hook/useFetchMessages";
const User = () => {
  const navigate = useNavigate();
  const [messagesList, setMessagesList] = useState([]);
  const [decryptMess, setDecryptMess] = useState([]);
  const {
    user,
    message,
    setMessage,
    generalBinaryConvertor,
    binaryToText,
    encryptDESKeyForReceiver,
    sendMessage,
    decryptMessages,
    // desFunctions,
  } = useContext(AuthContext);
  const { id } = useParams(); // <-- get dynamic portion of a link
  const { storedMessages, chatId } = useFetchMessages(user?.uid, id);
  console.log(user?.uid);
  // useEffect(() => {
  //   if (!user?.uid || !id) return;

  //   const chatId = [user.uid, id].sort().join("_");
  //   const q = query(
  //     collection(db, "chats", chatId, "messages"),
  //     orderBy("createdAt", "asc")
  //   );

  //   const unsubscribe = onSnapshot(q, (snapshot) => {
  //     const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  //     // Decrypt all messages before storing
  //     // const decryptedMsgs = decryptMessages(msgs);
  //     setStoredMessages(msgs);
  //   });

  //   return () => unsubscribe();
  // }, [user?.uid, id]);
  // console.log(storedMessages);

  const getInputText = (e) => {
    setMessage(e.target.value);
  };
  const handleSendMessage = async () => {
    // 1. Generate DES encryption of message
    const ciperText = generalBinaryConvertor(message); // make sure this sets `ciphertextHex`

    // 2. Encrypt the DES key with receiver's public key
    const encryptedDESKey = await encryptDESKeyForReceiver(id); // await the Promise

    // console.log(user.uid, "\n", id);
    // console.log("cipherTextHex :", ciperText);
    // console.log(encryptedDESKey);

    // Call sendMessage with all required fields
    await sendMessage(user.uid, id, ciperText, encryptedDESKey);

    //Clear input after sending
    setMessage("");
  };

  console.log(storedMessages);
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
            <button onClick={handleSendMessage}>
              <IoSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
