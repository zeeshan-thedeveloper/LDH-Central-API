const express=require('express')
const consumerLayerControllers = require('../controllers/consumerLayerControllers');
const hostAccessUrlController=require('../controllers/hostAccessEndPointsControllers')
const authScheme=require('../middlewares')
const consumer=express()

consumer.post("/getListOfServiceProviders",consumerLayerControllers.getListOfServiceProviders);
consumer.post("/makeConnectionRequestToAdmin",consumerLayerControllers.makeConnectionRequestToAdmin);
consumer.post("/getListOfActiveHostsByDeveloperId",consumerLayerControllers.getListOfActiveHostsByDeveloperId);
consumer.post("/getListOfActiveHostsByDeveloperId",consumerLayerControllers.getListOfActiveHostsByDeveloperId);
consumer.post("/generateTokenForDeveloper",consumerLayerControllers.generateTokenForDeveloper);
consumer.post("/getHostAccessUrlToken",hostAccessUrlController.getHostAccessUrlToken);
consumer.post("/executeMysqlQuery",authScheme.verifyJwt,hostAccessUrlController.executeMysqlQuery);

module.exports = {
    consumer
};
