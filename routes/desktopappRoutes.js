const express=require('express')
const authController=require('../controllers/authenticationControllers')
const authRouter_desktopApp=express()

authRouter_desktopApp.get("/getListOfAdminAccounts",authController.getListOfAdminAccounts);

module.exports = {
    authRouter_desktopApp
};
