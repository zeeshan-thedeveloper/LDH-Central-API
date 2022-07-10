const express=require('express')
const authController=require('../controllers/authenticationControllers')
const hostAccessUrlController=require('../controllers/hostAccessEndPointsControllers')
const adminPortalControllers = require('../controllers/adminPortalControllers')
const webportal=express()

// Auth router
webportal.get("/onGoogleAuthSucess",authController.onGoogleAuthSucess);
webportal.get("/onGoogleAuthFailure",authController.onGoogleAuthFailure);
webportal.get("/logoutGoogleAccount",authController.logoutGoogle);
webportal.get("/onGithubAuthSucess",authController.onGithubAuthSucess);
webportal.get("/onGithubAuthFailure",authController.onGithubAuthFailure);
webportal.post("/createAdminAccount",authController.createAdminAccount);
webportal.post("/ ",authController.verifyJWTToken);
webportal.post("/getJwtToken",authController.getJWTToken);
webportal.get("/test",authController.test);
webportal.post("/setStatusOfHostAccessUrl",hostAccessUrlController.setStatusOfHostAccessUrl);
webportal.post("/getListOfDevelopersRequestsByAdminId",adminPortalControllers.getListOfDevelopersRequestsByAdminId);
webportal.post("/updateStatusOfDevConReq",adminPortalControllers.updateStatusOfDevConReq);
webportal.post("/getListOfDevelopersAccountsByAdminId",adminPortalControllers.getListOfDevelopersAccountsByAdminId);

module.exports = {
    webportal
};
