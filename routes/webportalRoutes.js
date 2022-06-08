const express=require('express')
const authController=require('../controllers/authenticationControllers')
const authRouter=express()

// Auth router
authRouter.post("/createAdminAccount",authController.createAdminAccount);
authRouter.get("/loginToAdminAccount",authController.loginToAdminAccount);

module.exports = {
    authRouter
};
