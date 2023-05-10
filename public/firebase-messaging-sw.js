importScripts('/__/firebase/9.21.0/firebase-app-compat.js');
importScripts('/__/firebase/9.21.0/firebase-messaging-compat.js');
importScripts('/__/firebase/init.js');

const isSupported = firebase.messaging.isSupported();

if (isSupported) {

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('+ Push notification received while in background...');
    console.log('\n');
  });
}