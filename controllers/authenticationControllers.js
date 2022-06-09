const {requestsListCache} = require('../cache-store/cache')
const { firestore, admin } = require("../firebase-database/firebase-connector");
const createAdminAccount = (req, res) => {
  res.send({ responseMessage: "This is method for creating admin account" });
};
const loginToAdminAccount = (req, res) => {
  res.status(200).send({ responseMessage: "This is method for log in the admin account" });
};
module.exports = { 
    createAdminAccount,
    loginToAdminAccount,
};
