const express=require('express')
const consumerLayerControllers = require('../controllers/consumerLayerControllers');
const consumer=express()

consumer.post("/getListOfServiceProviders",consumerLayerControllers.getListOfServiceProviders);
consumer.post("/makeConnectionRequestToAdmin",consumerLayerControllers.makeConnectionRequestToAdmin);

module.exports = {
    consumer
};
