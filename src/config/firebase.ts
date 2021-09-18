import * as firebase from "firebase-admin";

export function initialiseFirebaseApp() {
  firebase.initializeApp({
    // @ts-ignore
    credential: firebase.credential.cert("firebaseServiceAccount.json"),
  });
}
