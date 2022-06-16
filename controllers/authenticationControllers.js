const passport = require('passport');
const {requestsListCache} = require('../cache-store/cache')
const { firestore, admin } = require("../firebase-database/firebase-connector");
const {admin_user_schema} = require("../mongodb/schemas/admin-schemas/admin-users");



const onGoogleAuthSucess = (req, res) => {
  // when google authentication is successful
  console.log("Google-Auth-success",req.user);
  res.send("google authentication is successful");
}

const onGoogleAuthFailure = (req, res) => {
  console.log("Google-Auth-fail",req.user);
 // when google authentication is unsuccessful
  res.send("google authentication is not successful")
}



const createAdminAccount = (req, res) => {
  res.send({ responseMessage: "This is method for creating admin account" });
};
const loginToAdminAccount = (req, res) => {
  res.status(200).send({ responseMessage: "This is method for log in the admin account" });
};
 
module.exports = { 

    onGoogleAuthSucess,
    onGoogleAuthFailure,
    createAdminAccount,
    loginToAdminAccount,
};
