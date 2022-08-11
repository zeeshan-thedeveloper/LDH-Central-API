const express=require('express')
const consumerLayerControllers = require('../controllers/consumerLayerControllers');
const hostAccessUrlController=require('../controllers/hostAccessEndPointsControllers')
const authController=require('../controllers/authenticationControllers')
const remoteDatabaseAccessUrl=require("../controllers/remoteDatabaseEndPointsControllers")
const middleware = require("../middlewares/index")
const consumer=express()

consumer.post("/getListOfServiceProviders",consumerLayerControllers.getListOfServiceProviders);
consumer.post("/makeConnectionRequestToAdmin",consumerLayerControllers.makeConnectionRequestToAdmin);
consumer.post("/getListOfActiveHostsByDeveloperId",consumerLayerControllers.getListOfActiveHostsByDeveloperId);
consumer.post("/getListOfActiveHostsByDeveloperId",consumerLayerControllers.getListOfActiveHostsByDeveloperId);
consumer.post("/generateTokenForDeveloper",consumerLayerControllers.generateTokenForDeveloper);
consumer.post("/getHostAccessUrlToken",hostAccessUrlController.getHostAccessUrlToken);
consumer.post("/executeMysqlQuery/*",middleware.verifyJwt,middleware.isHostAccessUrlEnabled,middleware.isUserAllowedToUseTheUrl,middleware.isUserAllowedToPerformRequestedQuery,hostAccessUrlController.executeMysqlQuery);
consumer.post("/generateAndUpdateAPIKey",authController.generateAndUpdateAPIKey);
consumer.get("/executeRemoteDatabaseQuery/:urlId/:urlEnd",middleware.isRemoteDatabaseAccessUrlEnabled,middleware.isApiKeyValid,middleware.processAdminQuery,hostAccessUrlController.executeMysqlQuery);

module.exports = {
    consumer
};
