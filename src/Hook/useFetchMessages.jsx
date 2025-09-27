import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebase.config";

const useFetchMessages = (receiverId) => {
  const [storedMessages, setStoredMessages] = useState([]);
  const [chatId, setChatId] = useState(null);

  useEffect(() => {
    const fetchChatIdAndMessages = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser || !receiverId) return;

      // Generate combined chatId
      const generatedChatId = [currentUser.uid, receiverId].sort().join("_");
      setChatId(generatedChatId);

      // Reference the chat messages collection
      const messagesRef = collection(db, "chats", generatedChatId, "messages");

      // Query messages ordered by createdAt
      const q = query(messagesRef, orderBy("createdAt", "asc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          // Only include messages relevant to this chat
          .filter(
            (m) =>
              m.senderId === currentUser.uid || m.receiverId === currentUser.uid
          );

        setStoredMessages(msgs);
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
