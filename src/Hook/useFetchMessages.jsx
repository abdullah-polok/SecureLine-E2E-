import { useContext, useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase.config";
import { AuthContext } from "../AuthProvider/AuthContext";

const useFetchMessages = (senderId, receiverId) => {
  const { storedMessages, setStoredMessages, decryptMessages } =
    useContext(AuthContext);
  const [chatId, setChatId] = useState(null);

  useEffect(() => {
    const fetchChatIdAndMessages = async () => {
      if (!senderId || !receiverId) return;

      // Generate combined chatId
      const generatedChatId = [senderId, receiverId].sort().join("_");
      setChatId(generatedChatId);

      // Reference the chat messages collection
      const messagesRef = collection(db, "chats", generatedChatId, "messages");

      // Query messages ordered by createdAt
      const q = query(messagesRef, orderBy("createdAt", "asc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          // Only include messages relevant to this chat
          .filter((m) => m.senderId === senderId || m.receiverId === senderId);
        const decryptedMsgs = decryptMessages(msgs, receiverId);
        setStoredMessages(decryptedMsgs);
      });

      return unsubscribe; // unsubscribe when cleanup
    };

    let unsub;
    fetchChatIdAndMessages().then((fn) => (unsub = fn));

    return () => {
      if (unsub) unsub();
    };
  }, [receiverId]);

  return { storedMessages, chatId };
};

export default useFetchMessages;
