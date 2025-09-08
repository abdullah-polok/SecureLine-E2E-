import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "./firebase"; // adjust your import

const useChatMessages = (chatId, receiverId) => {
  //Declare state inside the hook
  const [sentMessages, setSentMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return; // make sure user is logged in

    const currentUserId = auth.currentUser.uid;

    // Messages I sent
    const q1 = query(
      collection(db, "chats", chatId, "messages"),
      where("senderId", "==", currentUserId),
      where("receiverId", "==", receiverId),
      orderBy("createdAt", "asc")
    );

    const unsub1 = onSnapshot(q1, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSentMessages(msgs);
    });

    // Messages I received
    const q2 = query(
      collection(db, "chats", chatId, "messages"),
      where("senderId", "==", receiverId),
      where("receiverId", "==", currentUserId),
      orderBy("createdAt", "asc")
    );

    const unsub2 = onSnapshot(q2, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReceivedMessages(msgs);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [chatId, receiverId]);

  return { sentMessages, receivedMessages };
};

export default useChatMessages;
