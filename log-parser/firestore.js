const publicIp = require("public-ip");
const admin = require("firebase-admin");
const SERVER_PORT = "27015";
let serviceAccount = require("./csgo-stats-457a9-4aacb43cb750.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//For local tests
//admin.firestore().settings({ host: "localhost:8080", ssl: false });

let db = admin.firestore();

const initServer = () => {
  //Update server status
  publicIp.v4().then((ip) => {
    let docRef = db.collection("_config").doc("status");
    docRef.set({
      state: "ON",
      ip: `${ip}:${SERVER_PORT}`,
    });
  });

  //Update users status
  db.collection("_users")
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        doc.ref.set({ online: false }, { merge: true });
      });
    });
};

const setUserOnline = (userId, value) => {
  let docRef = db.collection("_users").doc(userId);
  docRef.set({ online: value }, { merge: true });
};

const sendMatch = (matchData) => {
  let docRef = db
    .collection("_matches")
    .doc(matchData.id + new Date().getTime());
  docRef.set(matchData);
};

module.exports = {
  sendMatch: sendMatch,
  initServer: initServer,
  setUserOnline: setUserOnline,
};