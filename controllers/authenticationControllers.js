const passport = require('passport');
const {requestsListCache} = require('../cache-store/cache')
const { firestore, admin } = require("../firebase-database/firebase-connector");
const {admin_user_schema} = require("../mongodb/schemas/admin-schemas/admin-users");


// ----------------------------- GOOGLE Auth -------------------

const onGoogleAuthSucess = (req, res) => {
  // when google authentication is successful
  console.log("Google-Auth-success",req.user);
  res.send("google authentication is successful");
}

const onGoogleAuthFailure = (req, res) => {
 // when google authentication is unsuccessful
  console.log("Google-Auth-fail",req.user);
  res.send("google authentication is not successful")
}

const logoutGoogle= (req, res) => {
  req.logout(req.user, err => {
            if(err) return next(err);
            req.session.destroy();
            res.send("logout from google account")
  });
}

// ----------------------------- Github -----------------------------

const onGithubAuthSucess = (req, res) => {
  // when Github authentication is successful
  console.log("Github-Auth-success",req.user);
  res.send("Github authentication is successful");
}

const onGithubAuthFailure = (req, res) => {
 // when Github authentication is unsuccessful
  console.log("Github-Auth-fail",req.user);
  res.send("Github authentication is not successful")
}



const createAdminAccount = (req, res) => {
  res.send({ responseMessage: "This is method for creating admin account" });
};
const loginToAdminAccount = (req, res) => {
  res.status(200).send({ responseMessage: "This is method for log in the admin account" });
};
 
module.exports = { 
    onGithubAuthSucess,
    onGithubAuthFailure,
    onGoogleAuthSucess,
    onGoogleAuthFailure,
    logoutGoogle,
    createAdminAccount,
    loginToAdminAccount,
};
