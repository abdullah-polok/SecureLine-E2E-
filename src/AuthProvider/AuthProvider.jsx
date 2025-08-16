import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase.config";
import { AuthContext } from "./AuthContext";
import { collection, getDoc, getDocs } from "firebase/firestore";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [allusers, setAllUsers] = useState([]);

  ////Get all users
  const getAllUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Users"));
      const userArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllUsers(userArray);

      console.lgo(userArray);
    } catch (err) {
      console.log(err);
    }
  };

  ////////////////////////////////////////////////////////////

  //////DES Method manually set up
  let char = "Hello world good boy i am abdullah who are you ";
  // const ass = char.charCodeAt(0);
  // let num = ass;
  let left32bits = "";
  let right32bits = "";
  const blocks = [];
  const generalBinaryConvertor = () => {
    for (let i = 0; i < char.length; i += 8) {
      let block = char.slice(i, i + 8);
      console.log(block);
      while (block.length < 8) {
        block += "\0"; // Null character padding (can be changed to space or any char)
      }

      let charBinary = "";

      // console.log(char);
      for (let i = 0; i < block.length; i++) {
        let asciiValue = block.charCodeAt(i);
        let bin = "";
        while (asciiValue > 0) {
          ///get reminder of set into the bin as string
          // bin = bin + (asciiValue % 2);//// Backward binary addition
          bin = (asciiValue % 2) + bin; ///forward bit addition
          asciiValue = Math.floor(asciiValue / 2);
        }

        bin = bin.padStart(8, "0"); ///Add o infront to make 8-bits
        charBinary = charBinary + bin;
      }
      blocks.push(charBinary);
      console.log(charBinary);
    }

    // console.log(blocks[1].length);
    // convert56BitBinary();
    // console.log(charBinary);
  };

  ///Reverse Function Code:
  const binaryToText = () => {
    let message = "";

    for (let block of blocks) {
      for (let i = 0; i < block.length; i += 8) {
        const byte = block.slice(i, i + 8); // get 8 bits

        const ascii = parseInt(byte, 2); // convert binary to decimal
        const char = String.fromCharCode(ascii); // convert to character

        message += char;
      }
    }
    console.log(message);
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
    // console.log("key length:" + initialKey.length);
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
    // console.log(key56bit);
    convert48bitBinary(key56bit);
  };

  ///Built in array table in DES Algorithm
  const PC2 = [
    14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27,
    20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56,
    34, 53, 46, 42, 50, 36, 29, 32,
  ];

  let key48bit = "";
  const convert48bitBinary = (local56bitKey) => {
    key48bit = "";
    for (let i = 0; i < PC2.length; i++) {
      key48bit += local56bitKey[PC2[i] - 1]; // -1 because of 0-index
    }
    // console.log("Key 48 bits " + key48bit.length);
    console.log(key48bit.length);
    // console.log("PC2" + PC2.length);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      setLoading(false);
      getAllUsers();
    });
    return () => {
      unsubscribe();
    };
  }, [user]);

  console.log(allusers);
  const userInfo = {
    user,
    allusers,
    generalBinaryConvertor,
    binaryToText,
    generataRandomInitilKey,
  };
  return (
    <AuthContext.Provider value={userInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
