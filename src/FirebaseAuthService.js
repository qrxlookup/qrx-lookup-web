import firebase from './FirebaseConfig';

const auth = firebase.auth();

const registerUser = (email, password) => {
    return auth.createUserWithEmailAndPassword(email, password);
}

const loginUser = (email, password) => {
    return auth.signInWithEmailAndPassword(email, password);
}

const logoutUser = () => {
    return auth.signOut();
}

const sendPasswordResetEmail = (email) => {
    return auth.sendPasswordResetEmail(email);
}

const loginWithGoogle = (email, password) => {
    const provider = new firebase.auth.GoogleAuthProvider();

    return auth.signInWithPopup(provider);
}

const loginWithFacebook = (email, password) => {
    const provider = new firebase.auth.FacebookAuthProvider();

    return auth.signInWithPopup(provider);
}

const loginWithTwitter = (email, password) => {
    const provider = new firebase.auth.TwitterAuthProvider();

    return auth.signInWithPopup(provider);
}

const subscribeToAuthChanges = (handleAuthChange) => {
    auth.onAuthStateChanged((user) => {
        handleAuthChange(user);
    });
}

const FirebaseAuthService = {
    registerUser,
    loginUser,
    logoutUser,
    sendPasswordResetEmail,
    loginWithGoogle,
    loginWithFacebook,
    loginWithTwitter,
    subscribeToAuthChanges,
};

export default FirebaseAuthService;