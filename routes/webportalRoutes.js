const express=require('express')
const authController=require('../controllers/authenticationControllers')
const hostAccessUrlController=require('../controllers/hostAccessEndPointsControllers')
const hostController=require("../controllers/hostLayerControllers")
const adminPortalControllers = require('../controllers/adminPortalControllers')
const remoteDatabaseEndpointsController=require("../controllers/remoteDatabaseEndPointsControllers")
const paymentController = require("../controllers/paymentController");
const remoteDatabaseAccessUrl = require("../controllers/remoteDatabaseEndPointsControllers")
const developerLayerController=require("../controllers/consumerLayerControllers")
const middleware = require("../middlewares/index");

const webportal=express()

// Auth router
webportal.get("/onGoogleAuthSucess",authController.onGoogleAuthSucess);
webportal.get("/onGoogleAuthFailure",authController.onGoogleAuthFailure);
webportal.get("/logoutGoogleAccount",authController.logoutGoogle);
webportal.get("/onGithubAuthSucess",authController.onGithubAuthSucess);
webportal.get("/onGithubAuthFailure",authController.onGithubAuthFailure);
webportal.post("/createAdminAccount",authController.createAdminAccount);
webportal.post("/loginToAccount",authController.loginToAccount);
webportal.post("/resetMyAccountPassword",authController.resetMyAccountPassword)
webportal.post("/deleteAccount",authController.deleteAccount)

webportal.post("/verifyJWTToken",authController.verifyJWTToken);
webportal.post("/getJwtToken",authController.getJWTToken);
webportal.get("/test",authController.test);
webportal.post("/setStatusOfHostAccessUrl",hostAccessUrlController.setStatusOfHostAccessUrl);
webportal.post("/getListOfDevelopersRequestsByAdminId",adminPortalControllers.getListOfDevelopersRequestsByAdminId);
webportal.post("/updateStatusOfDevConReq",adminPortalControllers.updateStatusOfDevConReq);
webportal.post("/getListOfDevelopersAccountsByAdminId",adminPortalControllers.getListOfDevelopersAccountsByAdminId);
webportal.post("/getListOfDeniedRequestsByAdminId",adminPortalControllers.getListOfDeniedRequestsByAdminId);
webportal.post("/getListOfResolvedRequestsByAdminId",adminPortalControllers.getListOfResolvedRequestsByAdminId);
webportal.post("/getHostsByAdminId",hostController.getHostsByAdminId);
webportal.post("/testHostAccessUrl",middleware.verifyJwt,middleware.isHostAccessUrlEnabled,middleware.processAdminQuery,middleware.verifyAdminUserUid,hostAccessUrlController.executeMysqlQuery);
webportal.post("/createRemoteDatabaseEndpoint",remoteDatabaseEndpointsController.createRemoteDatabaseEndpoint);
webportal.post("/getListOfRemoteDatabaseAccessUrlsByAdminId",remoteDatabaseEndpointsController.getListOfRemoteDatabaseAccessUrlsByAdminId);
webportal.post("/updateRemoteDbAccessUrlStatus",remoteDatabaseEndpointsController.updateRemoteDbAccessUrlStatus);
webportal.post("/removeRemoteDatabaseQuery",remoteDatabaseEndpointsController.removeRemoteDatabaseQuery);
webportal.post("/makePayment",paymentController.makePayment);
webportal.post("/updateRemoteDbAccessUrlVisibility",remoteDatabaseAccessUrl.updateRemoteDbAccessUrlVisibility);
webportal.post("/terminateAllUrlByAdminId",authController.terminateAllUrlByAdminId);
webportal.post("/getTotalNumberOfConnectedDevelopersByAdminId",developerLayerController.getTotalNumberOfConnectedDevelopersByAdminId)
webportal.post("/getTotalNumberOfConnectedHostsByAdminId",hostController.getTotalNumberOfConnectedHostsByAdminId)
webportal.post("/getTotalNumberOfRemoteAccessUrlsByAdminId",hostAccessUrlController.getTotalNumberOfRemoteAccessUrlsByAdminId)
webportal.post("/getTotalNumberOfEntertainedRequestsByAdminId",hostAccessUrlController.getTotalNumberOfEntertainedRequestsByAdminId)
webportal.post("/getTotalNumberOfDeniedRequestsByAdminId",hostAccessUrlController.getTotalNumberOfDeniedRequestsByAdminId)
module.exports = {
    webportal
};
 