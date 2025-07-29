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
  const generalBinaryConvertor = (char) => {
    charBinary = "";
    for (let i = 0; i < char.length; i++) {
      let asciiValue = char.charCodeAt(i);
      while (asciiValue > 0) {
        const rem = asciiValue % 2;
        charBinary = charBinary + rem;
        asciiValue = Math.floor(asciiValue / 2);
      }
    }
    console.log(charBinary.length);
    // convert56BitBinary();
    // console.log(charBinary);
  };

  ////Generate 64 bits random key for DES

  // A byte = 8 bits = can represent 256 different values
  // So, each byte can be any value from:
  // 0 to 255 (inclusive)
  let initialKey = "";
  const generataRandomInitilKey = () => {
    initialKey = "";
    for (let i = 0; i < 8; i++) {
      const randomByte = Math.floor(Math.random() * 256);
      // console.log(randomByte);

      // Get ASCII code and convert to 8-bit binary
      // key = key + String.fromCharCode(randomByte);

      initialKey = initialKey + randomByte.toString(2).padStart(8, "0");
    }
    console.log("key length:" + initialKey.length);
    // console.log(initialKey);
    convert56BitBinary(initialKey);
  };

  let key56bit = "";
  const convert56BitBinary = (localInitialKey) => {
    key56bit = "";
    for (let i = 0; i < localInitialKey.length; i++) {
      if ((i + 1) % 8 != 0) key56bit = key56bit + localInitialKey[i];
    }
    // console.log("Key 56 bits " + key56bit.length);
    console.log(key56bit);
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
  const userInfo = { user, generalBinaryConvertor, generataRandomInitilKey };
  return (
    <AuthContext.Provider value={userInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
