const express=require('express')
const authController=require('../controllers/authenticationControllers')
const hostLayerController = require('../controllers/hostLayerControllers');
const desktopApp=express()

desktopApp.get("/getListOfAdminAccounts",authController.getListOfAdminAccounts);
desktopApp.get("/getListOfDevelopersAccounts",authController.getListOfDeveloperAccounts);
desktopApp.post("/addHostInRequestList",hostLayerController.addHostInRequestList);
desktopApp.post("/updateHostConnectionStatus",hostLayerController.updateHostConnectionStatus);
desktopApp.post("/isHostConnected",hostLayerController.isHostConnected);
desktopApp.get("/getUniqueId",hostLayerController.getUniqueId);
desktopApp.post("/updateDeviceIdInCache",hostLayerController.updateDeviceIdInCache);
desktopApp.post("/getListOfPendingHostsByAdminId",hostLayerController.getListOfPendingHostsByAdminId);
desktopApp.post("/getListOfConnectedHostsByAdminId",hostLayerController.getListOfConnectedHostsByAdminId);
desktopApp.get("/getInfo",hostLayerController.getInfo);
module.exports = {
    desktopApp
};
