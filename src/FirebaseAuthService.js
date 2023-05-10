import { app } from './FirebaseConfig';

// const auth = firebase.auth();

// const registerUser = (email, password) => {
//     return auth.createUserWithEmailAndPassword(email, password);
// }

// const loginUser = (email, password) => {
//     return auth.signInWithEmailAndPassword(email, password);
// }

// const logoutUser = () => {
//     return auth.signOut();
// }

// const sendPasswordResetEmail = (email) => {
//     return auth.sendPasswordResetEmail(email);
// }

// const loginWithGoogle = (email, password) => {
//     const provider = new firebase.auth.GoogleAuthProvider();

//     return auth.signInWithPopup(provider);
// }

// const loginWithFacebook = (email, password) => {
//     const provider = new firebase.auth.FacebookAuthProvider();

//     return auth.signInWithPopup(provider);
// }

// const loginWithTwitter = (email, password) => {
//     const provider = new firebase.auth.TwitterAuthProvider();

//     return auth.signInWithPopup(provider);
// }

// const subscribeToAuthChanges = (handleAuthChange) => {
//     auth.onAuthStateChanged((user) => {
//         handleAuthChange(user);
//     });
// }

// const FirebaseAuthService = {
//     registerUser,
//     loginUser,
//     logoutUser,
//     sendPasswordResetEmail,
//     loginWithGoogle,
//     loginWithFacebook,
//     loginWithTwitter,
//     subscribeToAuthChanges,
// };

// export default FirebaseAuthService;

import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    signInWithPopup, 
    GoogleAuthProvider, 
    FacebookAuthProvider, 
    TwitterAuthProvider,
    linkWithPopup
} from "firebase/auth";

const auth = getAuth(app);

const registerUser = (email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user; // eslint-disable-line
        // ...
    })
    .catch((error) => {
        const errorCode = error.code; // eslint-disable-line
        const errorMessage = error.message; // eslint-disable-line
        // ..
    });
}

const loginUser = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user; // eslint-disable-line
        // ...
    })
    .catch((error) => {
        const errorCode = error.code; // eslint-disable-line
        const errorMessage = error.message; // eslint-disable-line
    });
}

const logoutUser = () => {
    signOut(auth).then(() => {
        // Sign-out successful.
    }).catch((error) => {
        // An error happened.
    });
}

const sendPasswordResetEmail = (email) => {
    sendPasswordResetEmail(auth, email)
    .then(() => {
      // Password reset email sent!
      // ..
    })
    .catch((error) => {
      const errorCode = error.code; // eslint-disable-line
      const errorMessage = error.message; // eslint-disable-line
      // ..
    });    
}

const subscribeToAuthChanges = (handleAuthChange) => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          const uid = user.uid; // eslint-disable-line
          // ...

          handleAuthChange(user);
        } else {
          // User is signed out
          // ...
          handleAuthChange(null);
        }
    });
}

const loginWithGoogle = (linkAccounts) => {
    signInWithPopup(auth, new GoogleAuthProvider())
    .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken; // eslint-disable-line
        // The signed-in user info.
        const user = result.user; // eslint-disable-line
        // IdP data available using getAdditionalUserInfo(result)
        // ...

        if (linkAccounts) {
            linkWithPopup(user, new FacebookAuthProvider()).then((result) => {
                // Accounts successfully linked.
                const facebookCredential = FacebookAuthProvider.credentialFromResult(result);  // eslint-disable-line
                const facebookUser = result.user;  // eslint-disable-line
                // ...
            }).catch((error) => {
                // Handle Errors here.
                // ...
            });
        }

    }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code; // eslint-disable-line
        const errorMessage = error.message; // eslint-disable-line
        // The email of the user's account used.
        const email = error.customData.email; // eslint-disable-line
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error); // eslint-disable-line
        // ...
        if (error.code === 'auth/account-exists-with-different-credential') {
            alert(error.message);
        }
    });
}

const loginWithFacebook = (linkAccounts) => {
    // getRedirectResult(auth)
    signInWithPopup(auth, new FacebookAuthProvider())
    .then((result) => {
        // The signed-in user info.
        const user = result.user; // eslint-disable-line

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        const credential = FacebookAuthProvider.credentialFromResult(result); // eslint-disable-line
        const accessToken = credential.accessToken; // eslint-disable-line

        // IdP data available using getAdditionalUserInfo(result)
        // ...

        if (linkAccounts) {
            linkWithPopup(user, new GoogleAuthProvider()).then((result) => {
                // Accounts successfully linked.
                const facebookCredential = GoogleAuthProvider.credentialFromResult(result);  // eslint-disable-line
                const facebookUser = result.user;  // eslint-disable-line
                // ...
            }).catch((error) => {
                // Handle Errors here.
                // ...
            });
        }
    })
    .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code; // eslint-disable-line
        const errorMessage = error.message; // eslint-disable-line
        // The email of the user's account used.
        const email = error.customData.email; // eslint-disable-line
        // The AuthCredential type that was used.
        const credential = FacebookAuthProvider.credentialFromError(error); // eslint-disable-line
        // ...
    });
}

const loginWithTwitter = () => {
    signInWithPopup(auth, new TwitterAuthProvider())
    .then((result) => {
        // This gives you a the Twitter OAuth 1.0 Access Token and Secret.
        // You can use these server side with your app's credentials to access the Twitter API.
        const credential = TwitterAuthProvider.credentialFromResult(result);
        const token = credential.accessToken; // eslint-disable-line
        const secret = credential.secret; // eslint-disable-line

        // The signed-in user info.
        const user = result.user; // eslint-disable-line
        // IdP data available using getAdditionalUserInfo(result)
        // ...
    }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code; // eslint-disable-line
        const errorMessage = error.message; // eslint-disable-line
        // The email of the user's account used.
        const email = error.customData.email; // eslint-disable-line
        // The AuthCredential type that was used.
        const credential = TwitterAuthProvider.credentialFromError(error); // eslint-disable-line
        // ...
    });
}

const FirebaseAuthService = {
    registerUser,
    loginUser,
    logoutUser,
    sendPasswordResetEmail,
    subscribeToAuthChanges,
    loginWithGoogle,
    loginWithFacebook,
    loginWithTwitter,
};

export default FirebaseAuthService;