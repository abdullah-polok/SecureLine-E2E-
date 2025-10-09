import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase.config";
import { AuthContext } from "./AuthContext";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import JSEncrypt from "jsencrypt";
import { useParams } from "react-router";
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [allusers, setAllUsers] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [storedMessages, setStoredMessages] = useState([]);
  const [decryrtedDESKey, setDecryptedDESKey] = useState("");
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
  ////////////////////////////Authentication State Change////////////////////////////
  const signInUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  /////////////////////

  /////////////////DES Process///////////////////////////////////

  let messageBinary;
  let blocks = [];
  let roundKeys48bit = [];
  const cipherBlocks = [];
  let cipherText = "";

  const generalBinaryConvertor = () => {
    console.log("Message is coming", message);

    generataRandomInitilKey();
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
      //process each block here
    }
    const sliceText = sliceCharacter(messageBinary);
    // console.log(blocks[1].length);
    // convert56BitBinaryKey();
    // console.log(charBinary);

    return sliceText;
  };

  let left32bitsPrimary = "";
  let right32bitsPrimary = "";

  ///Left and Right slice two part 64 bits string
  /*
  sliceCharacter:
  - now applies initialPermutation first,
  - then splits into left/right 32-bit halves,
  - runs feistalEntireRound (which will use the global roundKeys48bit if no keys passed),
  - then runs inverseInitialPermutation and returns hex.
*/
  const sliceCharacter = (localMessageBinary) => {
    if (!localMessageBinary || localMessageBinary.length !== 64) return;

    // 1) Apply initial permutation (IP)
    const permuted = initialPermutation(localMessageBinary);

    // 2) Split into left & right (post-IP)
    left32bitsPrimary = permuted.slice(0, 32);
    right32bitsPrimary = permuted.slice(32);

    // 3) Run 16 Feistel rounds (uses global roundKeys48bit if none passed)
    const [right, left] = feistalEntireRound(
      left32bitsPrimary,
      right32bitsPrimary,
      roundKeys48bit
    );

    // 4) Combine, apply inverse IP, push result
    const combineRightLeft = right + left;
    const finalBlock = inverseInitialPermutation(combineRightLeft);

    cipherBlocks.push(finalBlock);
    cipherText = finalBlock;
    // console.log("Cipher text Before binary form", cipherText);
    const hexText = binaryToHex(finalBlock);
    // console.log("Cipher HEX Before", hexText);
    return hexText;
  };

  ///Reverse Function Code:
  const binaryToText = () => {
    let message = "";

    for (let block of cipherBlocks) {
      for (let i = 0; i < block.length; i += 8) {
        const byte = block.slice(i, i + 8); // get 8 bits

        const ascii = parseInt(byte, 2); // convert binary to decimal
        const char = String.fromCharCode(ascii); // convert to character

        message += char;
      }
    }
    // console.log(message);
    return message;
  };

  /////////////Key areas //////////////////////

  ////Generate 64 bits random key for DES
  // A byte = 8 bits = can represent 256 different values
  // So, each byte can be any value from:
  // 0 to 255 (inclusive)
  let initialKey64bit = "";
  const generataRandomInitilKey = () => {
    initialKey64bit = "";
    for (let i = 0; i < 8; i++) {
      const randomByte = Math.floor(Math.random() * 256);
      // console.log(randomByte);

      // Get ASCII code and convert to 8-bit binary
      // key = key + String.fromCharCode(randomByte);

      initialKey64bit =
        initialKey64bit + randomByte.toString(2).padStart(8, "0");
    }
    // console.log("key length:" + initialKey64bit.length);
    // console.log(initialKey64bit);
    convert56BitBinaryKey(initialKey64bit);
  };

  ///Built in array table in DES Algorithm PC-1 table
  const PC1 = [
    57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35,
    27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46,
    38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4,
  ];

  let key56bit = "";
  let key56Hex = "";
  const convert56BitBinaryKey = (localinitialKey64bit) => {
    key56bit = "";
    // Apply PC-1 permutation
    for (let i = 0; i < PC1.length; i++) {
      key56bit += localinitialKey64bit[PC1[i] - 1]; // -1 because array is 0-indexed
    }

    // console.log("Key 56 bits " + key56bit.length);
    // console.log(key56bit);
    // Convert 56-bit binary to hex (14 characters)

    key56Hex = BigInt("0b" + key56bit)
      .toString(16)
      .padStart(14, "0");

    console.log("Key 56 Hex Before " + key56Hex);
    convert48BitBinaryKey(key56bit);
  };

  ///Built in array table in DES Algorithm PC-2 table
  const PC2 = [
    14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27,
    20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56,
    34, 53, 46, 42, 50, 36, 29, 32,
  ];

  /// store 48-bit keys for all 16 rounds

  const convert48BitBinaryKey = (local56bitKey) => {
    roundKeys48bit = [];
    const SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

    // Split into C and D halves (28 bits each)
    let C = local56bitKey.slice(0, 28);
    let D = local56bitKey.slice(28, 56);

    // Generate 16 round keys
    for (let round = 0; round < 16; round++) {
      // Circular left shift
      let shiftAmount = SHIFTS[round];
      C = C.slice(shiftAmount) + C.slice(0, shiftAmount);
      D = D.slice(shiftAmount) + D.slice(0, shiftAmount);

      // Combine C and D for this round
      let combinedCD = C + D;

      // Apply PC-2 to get 48-bit key
      let roundKey48 = "";
      for (let i = 0; i < PC2.length; i++) {
        roundKey48 += combinedCD[PC2[i] - 1];
      }
      roundKeys48bit.push(roundKey48);
    }
    // console.log(roundKeys48bit);
  };

  /////////////Key areas //////////////////////

  ///////////////Function Defination inside DES//////////////////////////////

  const expansionBox48bits = (localRight32bits) => {
    let right48bits = "";
    // Expansion table (DES E-box)
    const E = [
      32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15,
      16, 17, 16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27,
      28, 29, 28, 29, 30, 31, 32, 1,
    ];

    for (let i = 0; i < E.length; i++) {
      right48bits += localRight32bits[E[i] - 1]; // -1 since JS is 0-indexed
    }

    // console.log(right48bits.length);
    return right48bits;
  };

  ////////XOR operation between key and plain text binary 48 bits key and plain text

  const xorOperation = (rightExpended48bitKey, eachRoundKey) => {
    let xorString = "";
    // console.log("key", key48bit.length);
    // console.log("text", right48bits.length);
    for (let i = 0; i < rightExpended48bitKey.length; i++) {
      if (rightExpended48bitKey[i] === eachRoundKey[i]) xorString += "0";
      else xorString += "1";
    }
    // console.log("XOR String", xorString.length);
    return xorString;
  };

  ///S Box for 48 bits to 32convert

  const sboxcompression = (localxorResult) => {
    let sbox32bitString = "";
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

    let copyXorString = localxorResult;
    sbox32bitString = "";
    for (let i = 0; i < 48; i += 6) {
      ///take 6bits chunk from 48 bits string;
      let chunk6bits = copyXorString.slice(i, i + 6);

      ///First bit and last bit for row directly convert binary string into decimal number for  column;
      let sliceForRow = parseInt(chunk6bits[0] + chunk6bits[5], 2);

      ////Middle bits 1 to 5 means 4 bits directly convert binary string into decimal number for column
      let sliceForColumn = parseInt(chunk6bits.slice(1, 5), 2);

      let valuerOfSBox =
        S_BOXES[Math.floor(i / 6)][sliceForRow][sliceForColumn];

      let outputOf32Bits = valuerOfSBox.toString(2).padStart(4, "0");

      sbox32bitString += outputOf32Bits;
    }

    // console.log(sbox32bitString.length);
    // permutationBoxAfterSbox();
    return sbox32bitString;
  };

  ///Permutation box after s box 32bits input to 32 bits output

  const permutationBoxAfterSbox = (localSboxOutput) => {
    let output32bits = "";
    const P_BOX = [
      16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14,
      32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25,
    ];
    output32bits = "";
    for (let i = 0; i < P_BOX.length; i++) {
      // P_BOX[i] tells us which bit from input goes here
      output32bits += localSboxOutput[P_BOX[i] - 1];
      // -1 because arrays in JS are 0-based but DES table is 1-based
    }
    return output32bits;
  };
  ///Encryption function
  const feistalEntireRound = (
    left32bits,
    right32bits,
    roundKeys48bit,
    decrypt = false
  ) => {
    // Use keys in reverse order for decryption
    const keys = decrypt ? [...roundKeys48bit].reverse() : roundKeys48bit;

    for (let round = 0; round < 16; round++) {
      // 1️⃣ Expansion (32 → 48 bits)
      const expandedRight = expansionBox48bits(right32bits);

      // 2️⃣ XOR with round key
      const xorResult = xorOperation(expandedRight, keys[round]);

      // 3️⃣ S-box substitution (48 → 32 bits)
      const sBoxOutput = sboxcompression(xorResult);

      // 4️⃣ P-box permutation
      const pBoxOutput = permutationBoxAfterSbox(sBoxOutput);

      // 5️⃣ Feistel XOR with left half
      const newRight = xorOperation(left32bits, pBoxOutput);

      // 6️⃣ Swap halves
      left32bits = right32bits;
      right32bits = newRight;
    }

    // 16 rounds done → final swap for DES
    return [right32bits, left32bits];
  };

  ////Decryption function
  const feistalEntireRoundWithKeys = (left32bits, right32bits, keys) => {
    // keys should already be reversed for decryption
    for (let round = 0; round < 16; round++) {
      // 1️⃣ Expansion (32 → 48 bits)
      const expandedRight = expansionBox48bits(right32bits);

      // 2️⃣ XOR with round key
      const xorResult = xorOperation(expandedRight, keys[round]);

      // 3️⃣ S-box substitution (48 → 32 bits)
      const sBoxOutput = sboxcompression(xorResult);

      // 4️⃣ P-box permutation
      const pBoxOutput = permutationBoxAfterSbox(sBoxOutput);

      // 5️⃣ Feistel XOR with left half
      const newRight = xorOperation(left32bits, pBoxOutput);

      // 6️⃣ Swap halves
      left32bits = right32bits;
      right32bits = newRight;
    }

    // 16 rounds done → final swap for DES
    return [right32bits, left32bits];
  };

  ///////////////Function Defination inside Feistal Round DES//////////////////////////////

  /////After feistal round inverse initial permutation////
  ///64 bits input to 64 bits output

  // Initial Permutation (DES IP table)
  const initialPermutation = (block64) => {
    if (!block64 || block64.length !== 64) {
      throw new Error(
        "initialPermutation: input must be a 64-bit binary string"
      );
    }
    const IP = [
      58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46,
      38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17,
      9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61, 53, 45, 37, 29, 21, 13, 5, 63,
      55, 47, 39, 31, 23, 15, 7,
    ];

    let permuted = "";
    for (let i = 0; i < IP.length; i++) {
      permuted += block64[IP[i] - 1];
    }
    return permuted;
  };

  const inverseInitialPermutation = (localCombineRightLeft) => {
    let localCipherText = "";
    const inverseTable = [
      40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46,
      14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20,
      60, 28, 35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33,
      1, 41, 9, 49, 17, 57, 25,
    ];

    let block = localCombineRightLeft; // take last 64-bit block
    let permuted = "";

    for (let i = 0; i < inverseTable.length; i++) {
      permuted += block[inverseTable[i] - 1];
    }

    localCipherText = permuted;
    return localCipherText;
  };

  /////////////////DES Process///////////////////////////////////

  /////Binary string base 64 character string convert
  // const [ciphertextHex, setCipertextHex] = useState("");
  const binaryToHex = (binaryString) => {
    const cipherHex = BigInt("0b" + binaryString)
      .toString(16)
      .toUpperCase();
    return cipherHex.padStart(16, "0"); // ensure 64-bit = 16 hex chars
  };
  // Helper: Convert hex string to binary
  const hexToBinary = (hexString) => {
    const cipherBinary = BigInt("0x" + hexString)
      .toString(2)
      .padStart(64, "0");
    return cipherBinary;
  };

  const encryptDESKeyForReceiver = async (receiverId) => {
    // 2. Get receiver's public key
    const receiverDoc = await getDoc(doc(db, "Users", receiverId));
    if (!receiverDoc.exists()) throw new Error("Receiver not found");
    const getReceiverPublicKey = receiverDoc.data().publicKey;
    console.log("Reciever Public key", getReceiverPublicKey);
    //Encrypt DES key with receiver’s public key
    const rsa = new JSEncrypt();
    rsa.setPublicKey(getReceiverPublicKey);
    return rsa.encrypt(key56Hex);
  };

  // Run DES decryption on a single block
  // const runDESDecryption = (ciphertextHex, desKey56bit) => {
  //   // Convert hex → binary 64-bit
  //   const ciphertextBinary = hexToBinary(ciphertextHex);

  //   // Split into left/right
  //   const left32 = ciphertextBinary.slice(0, 32);
  //   const right32 = ciphertextBinary.slice(32);

  //   // Generate round keys for decryption (reverse order!)
  //   convert48BitBinaryKey(desKey56bit);
  //   const reversedRoundKeys = [...roundKeys48bit].reverse();

  // Run Feistel with reversed keys
  //   const [decryptedRight, decryptedLeft] = feistalEntireRoundWithKeys(
  //     left32,
  //     right32,
  //     reversedRoundKeys
  //   );

  //   const combinedBinary = inverseInitialPermutation(
  //     decryptedRight + decryptedLeft
  //   );

  //   return binaryToText(combinedBinary).replace(/\0+$/, "");
  // };
  const decryptDESKey = (encryptedDESKey) => {
    try {
      // 1. Get receiver's private key from localStorage
      const receiverPrivateKey = localStorage.getItem(
        "W8Dczpa9VOgd4URk1uhOPyiCjVZ2"
      );
      if (!receiverPrivateKey) {
        throw new Error("Private key not found in localStorage");
      }

      // 2. Create RSA instance
      const rsa = new JSEncrypt();
      rsa.setPrivateKey(receiverPrivateKey);

      // 3. Decrypt the DES key
      const decryptedDESKey = rsa.decrypt(encryptedDESKey);

      if (!decryptedDESKey) {
        throw new Error("Failed to decrypt DES key");
      }

      const desBinary = hexToBinary(decryptedDESKey);
      // setDecryptedDESKey(desBinary);

      return desBinary; // this should be your DES key in hex (key56Hex)
    } catch (error) {
      console.error("Error decrypting DES key:", error);
      throw error;
    }
  };

  // Decrypt multiple messages
  const decryptMessages = (messages) => {
    // console.log("Inside decrypt", messages);

    messages.forEach((msg) => {
      const {
        id,
        senderId,
        receiverId,
        cipherTexthex,
        encryptedDESKey,
        createdAt,
      } = msg;

      const ciperTextBinary = hexToBinary(cipherTexthex);

      ////
      const originalDESKey = decryptDESKey(encryptedDESKey);

      console.log("Binary text", ciperTextBinary.length);
      console.log("Binary key ", originalDESKey.length);
      // 3️⃣ Decrypt the message using your DES function
      const plainText = runDESDecryption(cipherTexthex, originalDESKey);

      console.log(plainText);
    });
  };

  // Run DES Decryption on a ciphertext (in hex) using the 56-bit binary DES key
  const runDESDecryption = (ciphertextHex, desKey56bit) => {
    try {
      // 1️⃣ Convert ciphertext hex → 64-bit binary
      const ciphertextBinary = hexToBinary(ciphertextHex);

      // 2️⃣ Apply Initial Permutation (same as encryption start)
      const permuted = initialPermutation(ciphertextBinary);

      // 3️⃣ Split into left/right halves
      let left32 = permuted.slice(0, 32);
      let right32 = permuted.slice(32);

      // 4️⃣ Generate round keys from the provided 56-bit key
      convert48BitBinaryKey(desKey56bit);

      // 5️⃣ Reverse the round keys for decryption
      const reversedKeys = [...roundKeys48bit].reverse();

      // 6️⃣ Run 16 Feistel rounds with reversed keys
      const [right, left] = feistalEntireRoundWithKeys(
        left32,
        right32,
        reversedKeys
      );

      // 7️⃣ Combine (swap order before final permutation)
      const combined = right + left;

      // 8️⃣ Apply Inverse Initial Permutation (final DES step)
      const decryptedBinary = inverseInitialPermutation(combined);

      // 9️⃣ Convert binary → text
      let decryptedText = "";
      for (let i = 0; i < decryptedBinary.length; i += 8) {
        const byte = decryptedBinary.slice(i, i + 8);
        const charCode = parseInt(byte, 2);
        decryptedText += String.fromCharCode(charCode);
      }

      // 🔟 Remove padding (null characters)
      decryptedText = decryptedText.replace(/\0+$/, "");

      return decryptedText;
    } catch (error) {
      console.error("Error in runDESDecryption:", error);
      return null;
    }
  };

  //////////////////////////////////////////////////////////

  ///////////////////////Firebase Process////////////////////////////
  // const sendMessage = async (
  //   senderId,
  //   receiverId,
  //   cipherTexthex,
  //   encryptedDESKey
  // ) => {
  //   const chatId = [senderId, receiverId].sort().join("_");
  //   const currentUser = auth.currentUser;

  //   if (!currentUser || currentUser.uid !== senderId) {
  //     throw new Error("Unauthorized: senderId mismatch");
  //   }

  //   //Make sure receiverId is valid and exists in Users
  //   const receiverDoc = await getDoc(doc(db, "Users", receiverId));
  //   if (!receiverDoc.exists()) {
  //     throw new Error("Invalid receiverId");
  //   }

  //   const messageData = {
  //     senderId,
  //     receiverId,
  //     cipherTexthex,
  //     encryptedDESKey,
  //     createdAt: serverTimestamp(),
  //   };

  //   await addDoc(collection(db, "chats", chatId, "messages"), messageData);
  //   setMessage("");
  // };
  const sendMessage = async (
    senderId,
    receiverId,
    cipherTexthex,
    encryptedDESKey
  ) => {
    const chatId = [senderId, receiverId].sort().join("_");
    const currentUser = auth.currentUser;

    if (!currentUser || currentUser.uid !== senderId) {
      throw new Error("Unauthorized: senderId mismatch");
    }

    // Make sure receiverId exists
    const receiverDoc = await getDoc(doc(db, "Users", receiverId));
    if (!receiverDoc.exists()) {
      throw new Error("Invalid receiverId");
    }
    await setDoc(doc(db, "chats", chatId), {
      participants: [senderId, receiverId],
      lastMessage: { text: cipherTexthex || "", timestamp: serverTimestamp() },
    });

    console.log(senderId, "/n", receiverId);
    const messageData = {
      senderId,
      receiverId,
      cipherTexthex,
      encryptedDESKey,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "chats", chatId, "messages"), messageData);

    // Reset input message
    setMessage("");
  };
  // console.log(localStorage.getItem("W8Dczpa9VOgd4URk1uhOPyiCjVZ2"));
  // console.log(user?.displayName);
  console.log(decryrtedDESKey);

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
    receiverId,
    setReceiverId,
    generalBinaryConvertor,
    binaryToText,
    generataRandomInitilKey,
    sendMessage,
    storedMessages,
    setStoredMessages,
    encryptDESKeyForReceiver,
    decryptMessages,
    signInUser,
  };
  return (
    <AuthContext.Provider value={userInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
