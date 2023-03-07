//import firebase from './FirebaseConfig';

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

// const firestore = firebase.firestore();

// const createDocument = (collection, document) => {
//     firestore.collection(collection).add(document);
// };

const createDocument = async (col, doc) => {
    return await addDoc(collection(db, col), doc);
};

// const readDocuments = (collection) => {
//     return firestore.collection(collection).get();
// };

const readDocuments = async (col) => {
    return await getDocs(collection(db, col));
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const FirebaseFirestoreService = {
    createDocument,
    readDocuments,
};

export default FirebaseFirestoreService;