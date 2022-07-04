const express=require('express')
const authController=require('../controllers/authenticationControllers')
const authRouter_webportal=express()

// Auth router
authRouter_webportal.get("/onGoogleAuthSucess",authController.onGoogleAuthSucess);
authRouter_webportal.get("/onGoogleAuthFailure",authController.onGoogleAuthFailure);
authRouter_webportal.get("/logoutGoogleAccount",authController.logoutGoogle);
authRouter_webportal.get("/onGithubAuthSucess",authController.onGithubAuthSucess);
authRouter_webportal.get("/onGithubAuthFailure",authController.onGithubAuthFailure);
authRouter_webportal.post("/createAdminAccount",authController.createAdminAccount);

authRouter_webportal.post("/ ",authController.verifyJWTToken);
authRouter_webportal.post("/getJwtToken",authController.getJWTToken);

authRouter_webportal.get("/test",authController.test);

module.exports = {
    authRouter_webportal
};
