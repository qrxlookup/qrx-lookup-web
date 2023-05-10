const admin = require("firebase-admin");
const fetch = require("node-fetch");
const {runWith} = require("firebase-functions");
const {firestore} = require("firebase-admin");
const {google} = require("googleapis");

admin.initializeApp();

// Load the service account key JSON file.
const serviceAccount = require("./service-account.json");

// Remaining air time when some action is needed
const criticalAirTime = 10;

// Extra minutes each air time increased
const extraAirTime = 30;

// eslint-disable-next-line
const pushNotification = async (title, body, IID_TOKEN, ACCESS_TOKEN) => {
  const projectId = serviceAccount.project_id;
  const options = {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "message": {
        "token": IID_TOKEN,
        "notification": {
          title,
          body,
        },
        "data": {},
      },
    }),
  };

  try {
    // const resp = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, options);
    // eslint-disable-next-line max-len
    await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, options);
    // const result = await resp.json();
    console.log("+ Success pushing notification...");
    console.log("\n");
  } catch (error) {
    console.error("+ Error pushing notification...");
    console.log("\n");
  }
};

const getAccessToken = () => {
  const scopes = [
    "https://www.googleapis.com/auth/firebase.database",
    "https://www.googleapis.com/auth/firebase.messaging",
  ];

  return new Promise((resolve, reject) => {
    const jwtClient = new google.auth.JWT(
        serviceAccount.client_email,
        null,
        serviceAccount.private_key,
        scopes,
        null,
    );
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
};

// eslint-disable-next-line max-len
exports.notifier = runWith({memory: "512MB"}).pubsub.schedule("*/3 * * * *").onRun(async (context) => {
  const thirtyMinsAgoMs = Date.now() - (1000 * 60 * extraAirTime);
  const thirtyMinsAgo = firestore.Timestamp.fromMillis(thirtyMinsAgoMs);

  // eslint-disable-next-line max-len
  const querySnapshot = await firestore().collection("contacts").where("timestamp", ">=", thirtyMinsAgo).get();
  querySnapshot.forEach(async (snapshot) => {
    const {sessions} = snapshot.data();
    const lastSession = sessions[sessions.length - 1];
    const checkOut = lastSession?.checkOut?.toDate();
    const IIDToken = lastSession?.IIDToken;

    // eslint-disable-next-line max-len
    const remainingMins = Math.ceil((checkOut.getTime() - Date.now())/(1000 * 60));
    if (remainingMins > 0 && remainingMins <= criticalAirTime && IIDToken) {
      const title = "Alert!";
      const body = "AirTime expiring in less than 10m.";

      getAccessToken().then((accessToken) => {
        pushNotification(title, body, IIDToken, accessToken);
      });

      // const notification = await admin.messaging().send({
      //   token: IIDToken,
      //   notification: {
      //     title: "Alert!",
      //     body: "AirTime expiring in less than 10m.",
      //   },
      //   data: {},
      // });

      // if (notification.length !== 0) {
      //   console.log(`Success! Notification pushed to: ${IIDToken}`);
      //   console.log("\n");
      // }
    }
  });
});
