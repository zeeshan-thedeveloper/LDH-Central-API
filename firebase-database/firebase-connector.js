const admin = require("firebase-admin");

const firebase = require("firebase");
var serviceAccount = require("./local-database-hosting-e0064-firebase-adminsdk-a48m2-9154922943.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL+"",
   storageBucket:process.env.STORAGE_URL+""
});  

const firebaseConfig = {
  apiKey: "AIzaSyCNwKEKXxqUkt4yfW3-_-wLJ2ygODvEWOo",
  authDomain: "local-database-hosting-e0064.firebaseapp.com",
  databaseURL: "https://local-database-hosting-e0064-default-rtdb.firebaseio.com",
  projectId: "local-database-hosting-e0064",
  storageBucket: "local-database-hosting-e0064.appspot.com",
  messagingSenderId: "342800757508",
  appId: "1:342800757508:web:63e047625c65e65e931651",
  measurementId: "G-P343HDP6S2"
};

firebase.initializeApp(firebaseConfig);

const firestore = firebase.firestore();
const firestorage = admin.storage().bucket()

module.exports={
    admin,
    firestore,
    firestorage
}