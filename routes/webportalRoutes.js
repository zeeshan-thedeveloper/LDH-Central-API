const express=require('express')
const authController=require('../controllers/authenticationControllers')
const authRouter=express()

// Auth router
authRouter.get("/onGoogleAuthSucess",authController.onGoogleAuthSucess);
authRouter.get("/onGoogleAuthFailure",authController.onGoogleAuthFailure);

authRouter.post("/createAdminAccount",authController.createAdminAccount);
authRouter.post("/loginToAdminAccount",authController.loginToAdminAccount);

module.exports = {
    authRouter
};
