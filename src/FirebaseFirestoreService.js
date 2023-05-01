import firebase from './FirebaseConfig';
import { getFirestore, collection, query, onSnapshot, serverTimestamp, doc, addDoc, setDoc, getDoc, getDocs } from "firebase/firestore";

const db = getFirestore(firebase);

const createDocument = async (collectName, doc) => {
    return await addDoc(collection(db, collectName), doc);
};

const updateDocument = async (collection, document) => {
    
    const docRef = doc(db, collection, document.id);

    await setDoc(docRef, { 
        ...document, 
        timestamp: serverTimestamp()
    });
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

const subscribeToDocChanges = (collectName, handleDocChange) => {

    const q = query(collection(db, collectName));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        handleDocChange(snapshot.docChanges());
    });

    return unsubscribe;
}

const FirebaseFirestoreService = {
    createDocument,
    updateDocument,
    readDocuments,
    readDocument,
    subscribeToDocChanges,
};

export default FirebaseFirestoreService;