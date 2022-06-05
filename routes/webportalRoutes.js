const express=require('express')
const authController=require('../controllers/authenticationControllers')
const authRouter=express()

authRouter.post("/createAdminAccount",authController.createAdminAccount);

module.exports = {
    authRouter
};
