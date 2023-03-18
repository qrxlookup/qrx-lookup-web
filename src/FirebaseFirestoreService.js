import firebase from './FirebaseConfig';
import { getFirestore, collection, doc, addDoc, setDoc, getDoc, getDocs } from "firebase/firestore";

const db = getFirestore(firebase);

const createDocument = async (collectName, doc) => {
    return await addDoc(collection(db, collectName), doc);
};

const updateDocument = async (collection, document) => {
    return await setDoc(doc(db, collection, document.email), document);
};

const readDocuments = async (collectName) => {
    return await getDocs(collection(db, collectName));
};

const readDocument = async (collectName, id) => {

    const docSnap = await getDoc(doc(db, collectName, id));

    if (!docSnap.exists()) {
        return null;
    } else {
        console.log("No such document!");
    }

    return docSnap.data;
};

const FirebaseFirestoreService = {
    createDocument,
    updateDocument,
    readDocuments,
    readDocument,
};

export default FirebaseFirestoreService;