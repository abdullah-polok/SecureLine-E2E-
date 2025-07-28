import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth } from "../../firebase.config";
import { AuthContext } from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //////DES Method manually set up
  const char = "Helloy";
  // const ass = char.charCodeAt(0);

  let charBinary = "";
  // let num = ass;
  const binaryCheck = (char) => {
    for (let i = 0; i < char.length; i++) {
      let asciiValue = char.charCodeAt(i);
      while (asciiValue > 0) {
        const rem = asciiValue % 2;
        charBinary = charBinary + rem;
        asciiValue = Math.floor(asciiValue / 2);
      }
      charBinary = charBinary + " ";
    }
    console.log(charBinary);
  };

  ////Generate 64 bits random key for DES

  // A byte = 8 bits = can represent 256 different values
  // So, each byte can be any value from:

  // css
  // Copy
  // Edit
  // 0 to 255 (inclusive)
  let key = "";
  const generataRandomInitilKey = () => {
    for (let i = 0; i < 8; i++) {
      const randomByte = Math.floor(Math.random() * 256);
      console.log(randomByte);
      key = key + String.fromCharCode(randomByte);
    }
    // console.log(key);
    binaryCheck(key);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, [user]);
  const userInfo = { user, binaryCheck, generataRandomInitilKey };
  return (
    <AuthContext.Provider value={userInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
