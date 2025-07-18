import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth"; // getReactNativePersistence, initializeAuth
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCSxun0X0Xu4GwP8m-z1JI19nk9tfideq8",
    authDomain: "immersion-react-native.firebaseapp.com",
    databaseURL: "https://immersion-react-native-default-rtdb.firebaseio.com",
    projectId: "immersion-react-native",
    storageBucket: "immersion-react-native.appspot.com",
    messagingSenderId: "28474693756",
    appId: "1:28474693756:web:175eac256c9933a8f891f9",
    measurementId: "G-TF25EHYXWJ"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const auth = initializeAuth(FIREBASE_APP, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
}); //for asyncStorage
// const analytics = getAnalytics(app);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE = getFirestore(FIREBASE_APP);
// export const STORAGE = getStorage();