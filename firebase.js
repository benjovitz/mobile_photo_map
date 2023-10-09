// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
import { getStorage } from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXfDwd0Yf0CDajE-_QpK0m6jZtTmCdz00",
  authDomain: "react-native-ad4f3.firebaseapp.com",
  projectId: "react-native-ad4f3",
  storageBucket: "react-native-ad4f3.appspot.com",
  messagingSenderId: "655880243696",
  appId: "1:655880243696:web:2c3260d4f03aec965cb535"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app)
const storage = getStorage(app)

export { app, database, storage }