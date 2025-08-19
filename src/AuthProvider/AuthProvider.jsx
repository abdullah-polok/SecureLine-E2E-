import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase.config";
import { AuthContext } from "./AuthContext";
import { collection, getDoc, getDocs } from "firebase/firestore";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
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
  let messageBinary;
  const blocks = [];
  const generalBinaryConvertor = () => {
    console.log("Message is coming", message);
    for (let i = 0; i < message.length; i += 8) {
      let block = message.slice(i, i + 8);
      while (block.length < 8) {
        block += "\0"; // Null character padding (can be changed to space or any char)
      }

      messageBinary = "";

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
        messageBinary = messageBinary + bin;
      }
      blocks.push(messageBinary);
      // console.log(messageBinary.length);
      sliceCharacter();
      generataRandomInitilKey();
      xorOperation();
      sboxcompression();
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
    // console.log(key48bit);
    // console.log("PC2" + PC2.length);
  };

  ///Left and Right slice two part 64 bits string
  const sliceCharacter = () => {
    if (messageBinary.length != 64) return;
    left32bits = messageBinary.slice(0, 32);
    right32bits = messageBinary.slice(32);

    // console.log("left", left32bits.length);
    // console.log("Right", right32bits.length);
    expansionBox48bits();
  };

  let right48bits = "";
  const expansionBox48bits = () => {
    // Expansion table (DES E-box)
    const E = [
      32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15,
      16, 17, 16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27,
      28, 29, 28, 29, 30, 31, 32, 1,
    ];

    for (let i = 0; i < E.length; i++) {
      right48bits += right32bits[E[i] - 1]; // -1 since JS is 0-indexed
    }

    // console.log(right48bits.length);
    xorOperation();
  };

  ///S Box for 48 bits to 32convert
  const sboxcompression = () => {
    const S_BOXES = [
      // S1
      [
        [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
        [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
        [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
        [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
      ],

      // S2
      [
        [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
        [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
        [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
        [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
      ],

      // S3
      [
        [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
        [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
        [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
        [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
      ],

      // S4
      [
        [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
        [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
        [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
        [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
      ],

      // S5
      [
        [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
        [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
        [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
        [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
      ],

      // S6
      [
        [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
        [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
        [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
        [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
      ],

      // S7
      [
        [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
        [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
        [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
        [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
      ],

      // S8
      [
        [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
        [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
        [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
        [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11],
      ],
    ];

    let copyXorString = xorString;

    for (let i = 0; i < 48; i += 6) {
      ///take 6bits chunk from 48 bits string;
      let chunk6bits = copyXorString.slice(i, i + 6);

      ///First bit and last bit for row directly convert binary string into decimal number for  column;
      let sliceForRow = parseInt(chunk6bits[0] + chunk6bits[5], 2);

      ////Middle bits 1 to 5 means 4 bits directly convert binary string into decimal number for column
      let sliceForColumn = parseInt(copyXorString.slice(1, 5), 2);

      console.log(S_BOXES[sliceForRow][sliceForColumn]);
    }
  };

  ////////XOR operation between key and plain text binary

  let xorString = "";
  const xorOperation = () => {
    xorString = "";
    // console.log("key", key48bit.length);
    // console.log("text", right48bits.length);
    for (let i = 0; i < 48; i++) {
      if (key48bit[i] === right48bits[i]) xorString += "0";
      else xorString += "1";
    }
    // console.log("XOR String", xorString.length);
  };

  useEffect(() => {
    if (key48bit.length == 48 && right48bits.length == 48) xorOperation();
  });

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

  const userInfo = {
    user,
    allusers,
    message,
    setMessage,
    generalBinaryConvertor,
    binaryToText,
    generataRandomInitilKey,
  };
  return (
    <AuthContext.Provider value={userInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
