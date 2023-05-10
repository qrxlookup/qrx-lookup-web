import { app } from './FirebaseConfig';
import { isSupported, getMessaging, getToken, onMessage } from "firebase/messaging";

const { detect } = require('detect-browser');

export const VAPID_KEY = 'BNgXNBqlpKNOu8Ng7GESj8Erbp63zHaVNBq3Ji30BEaorpL2Ovn0oi9InVp4hs5uN0Chlij4_Gk1fiMKEozWrY0';
export const SERVER_KEY = 'AAAAxGUHBCo:APA91bGreg-Ns-D5LeCD2Hqn2Bsk2V_jTCeix2GGop2OJeDfgWcO5_UANadO932QLNgIyyOYiHnSCF2d9e7HxbgdbV9CksICBTKehJHhx6WlM4L9_qu9XEIoNZtF38oBZYzyW05YmkPQ';

const getMyMessaging = (async () => {
    try {
        const isSupportedBrowser = await isSupported();
        if (isSupportedBrowser) {
            return getMessaging(app);
        }
        console.log('Firebase Messaging not supported by this browser');
        return null;
    } catch (err) {
        console.log(err);
        return null;
    }
})();

export const requestNotificationPermission = async() => {

    const browser = detect();

    console.log(`+ The browser is '${browser.name}' running on '${browser.os}' operating system.`);
    console.log('\n');

    const isSupportedBrowser = await isSupported();

    if (isSupportedBrowser) { 

        Notification.requestPermission().then((permission) => {

            console.log(`+ Notification permission ${permission}.`);
            console.log('\n');

            if (permission === 'granted') {
                // new Notification("Hi there!");
            } else if (permission === 'denied') {
                // console.log('Hi there!');
            }
        });

    } else {
        console.log('+ Firebase Messaging not supported by this browser');
    }
}

export const requestIIDToken = async(dispatch) => {

    let token = null;

    try {
        const messaging = await getMyMessaging;
        const currentToken = await getToken(messaging, {
            vapidKey: VAPID_KEY,
        });
        if (currentToken) {
            token = currentToken;
        }
    } catch (err) {
        console.log('An error occurred while retrieving IID token. ', err);
    }

    return token;
};

// eslint-disable-next-line
export const onMessageListener = async () => {
    new Promise((resolve) =>
        (async () => {
            const messaging = await getMyMessaging;
            onMessage(messaging, (payload) => {
                resolve(payload);
                console.log('+ Push notification while active...', payload);
                console.log('\n');
            });
        })()
    );
}