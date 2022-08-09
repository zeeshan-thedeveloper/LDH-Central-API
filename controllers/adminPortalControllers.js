const {
  developers_users_schema,
} = require("../mongodb/schemas/consumer-schemas/developer-users");
const {
  dev_admin_con_schema,
} = require("../mongodb/schemas/developer-and-admin-connection-schema/developer-and-admin-connection-schema");
const {
  host_users_schema,
} = require("../mongodb/schemas/host-schemas/host-users");
const {
  denied_requests_history_schema,
} = require("../mongodb/schemas/request-history-schema/denied-request-history-schema");
const { resolved_requests_history_schema } = require("../mongodb/schemas/request-history-schema/resolved-request-history-schema");
const {
  FETCHED,
  COULD_NOT_FETCH,
  DATA_UPDATED,
  DATA_NOT_UPDATED,
} = require("./responses/responses");

const getListOfDevelopersRequestsByAdminId = (req, res) => {
  //TODO: resolving the consistency for list of developer requests

  const { adminId } = req.body;
  dev_admin_con_schema.find(
    {
      $and: [
        { adminId: adminId },
        {
          $or: [{ requestStatus: "Un-resolved" }, { requestStatus: "Decline" }],
        },
      ],
    },
    (err, data) => {
      if (data) {
        const fetchData = (hostId) => {
          return new Promise((resolve, reject) => {
            host_users_schema.find({ hostId: hostId }, (err, data) => {
              if (!err) {
                resolve(data);
              }
            });
          });
        };

        const fetchIndividualData = (request) => {
          return new Promise((resolve, reject) => {
            let promises = request.listOfDatabases.map(fetchData);
            let results = Promise.all(promises);
            results.then((data) => {
              request.listOfDatabases = data[0];
              resolve(request);
            });
          });
        };

        const fetchTheCompleteDataOfListedHosts = (dataToProcess) => {
          return new Promise((resolve, reject) => {
            let promises = dataToProcess.map(fetchIndividualData);
            let results = Promise.all(promises);
            results.then((data) => {
              resolve(data);
            });
          });
        };

        fetchTheCompleteDataOfListedHosts(data).then((response) => {
          res.status(200).send({
            responseMessage: "List of connection requests fetched",
            responseCode: FETCHED,
            responsePayload: response,
          });
        });
      } else {
        res.status(200).send({
          responseMessage: "List of connection requests could not fetched",
          responseCode: COULD_NOT_FETCH,
          responsePayload: err,
        });
      }
    }
  );
};

const getListOfDevelopersAccountsByAdminId = (req, res) => {
  const { adminId } = req.body;
  dev_admin_con_schema.find(
    { $and: [{ adminId: adminId }, { $or: [{ requestStatus: "Accept" }] }] },
    (err, data) => {
      if (data) {
        const fetchData = (hostId) => {
          return new Promise((resolve, reject) => {
            host_users_schema.find({ hostId: hostId }, (err, data) => {
              if (!err) {
                resolve(data);
              }
            });
          });
        };

        const fetchIndividualData = (request) => {
          return new Promise((resolve, reject) => {
            let promises = request.listOfDatabases.map(fetchData);
            let results = Promise.all(promises);
            results.then((data) => {
              request.listOfDatabases = data[0];
              resolve(request);
            });
          });
        };

        const fetchTheCompleteDataOfListedHosts = (dataToProcess) => {
          return new Promise((resolve, reject) => {
            let promises = dataToProcess.map(fetchIndividualData);
            let results = Promise.all(promises);
            results.then((data) => {
              resolve(data);
            });
          });
        };

        fetchTheCompleteDataOfListedHosts(data).then((response) => {
          res.status(200).send({
            responseMessage: "List of connection requests fetched",
            responseCode: FETCHED,
            responsePayload: response,
          });
        });
      } else {
        res.status(200).send({
          responseMessage: "List of connection requests could not fetched",
          responseCode: COULD_NOT_FETCH,
          responsePayload: err,
        });
      }
    }
  );
};

const updateStatusOfDevConReq = async (req, res) => {
  const {
    requestId,
    requestStatus,
    accessRole,
    isAutoAccessUrlTokenGenerationAllowed,
  } = req.body;
  console.log(
    "isAutoAccessUrlTokenGenerationAllowed",
    isAutoAccessUrlTokenGenerationAllowed
  );
  const record = await dev_admin_con_schema.findOneAndUpdate(
    { _id: requestId },
    {
      requestStatus: requestStatus,
      accessRole: accessRole,
      isAutoAccessUrlTokenGenerationAllowed:
        isAutoAccessUrlTokenGenerationAllowed,
    },
    { new: true }
  );
  if (record) {
    // ------------------------------
    // We have to add this in the relative admin and developer for ease of fetching the records.
    // -----------------------------

    if (requestStatus == "Accept") {
      const updatedRecord = await developers_users_schema.findOneAndUpdate(
        { _id: record.developerId },
        { $push: { allowedHostAccessUrls: record } },
        { new: true }
      );
      if (updatedRecord) {
        res.status(200).send({
          responseMessage: " Connection Status updated successfully",
          responseCode: DATA_UPDATED,
          responsePayload: record,
        });
      } else {
        res.status(200).send({
          responseMessage: " Connection Status could not updated successfully",
          responseCode: DATA_NOT_UPDATED,
          responsePayload: record,
        });
      }
    } else if (requestStatus == "Decline") {
      const updatedRecord = await developers_users_schema.findOneAndUpdate(
        { _id: record.developerId },
        { $pull: { allowedHostAccessUrls: { _id: record._id } } },
        { new: true }
      );
      if (updatedRecord) {
        res.status(200).send({
          responseMessage: " Connection Status updated successfully",
          responseCode: DATA_UPDATED,
          responsePayload: record,
        });
      } else {
        res.status(200).send({
          responseMessage: " Connection Status could not updated successfully",
          responseCode: DATA_NOT_UPDATED,
          responsePayload: record,
        });
      }
    }
  } else {
    console.log("Status not updated");
    res.status(200).send({
      responseMessage: " Connection Status could not updated successfully",
      responseCode: DATA_NOT_UPDATED,
      responsePayload: record,
    });
  }
};

const getListOfDeniedRequestsByAdminId = async (req, res) => {
  const { adminId } = req.body;
  const data = await denied_requests_history_schema
    .find({ adminId: adminId })
    .sort({ requestId: -1 });
  if (data) {
      const getData=(request)=>{
        return new Promise(async(resolve,reject)=>{
           const dev =await developers_users_schema.findOne({email:request.requestSender});
            resolve ( {request:request,requestSenderName:dev.firstName+" "+dev.lastName})
        })
    }
    const fetchDeveloperData = (listOfRequests) => {
      return new Promise((resolve, reject) => {
        const promises = listOfRequests.map(getData);
        const results = Promise.all(promises);
        results.then((data)=>{
            resolve(data)
        })
      });
    };
    fetchDeveloperData(data).then((data) => {
      res.status(200).send({
        responseMessage: "Successfully loaded the list of denied requests",
        responseCode: FETCHED,
        responsePayload: data,
      });
    });
  } else {
    res.status(200).send({
      responseMessage: "Could not load the list of denied requests",
      responseCode: COULD_NOT_FETCH,
      responsePayload: err,
    });
  }
};

const getListOfResolvedRequestsByAdminId = async (req, res) => {
  const { adminId } = req.body;
  const data = await resolved_requests_history_schema
    .find({ adminId: adminId })
    .sort({ requestId: -1 });
  if (data) {
      const getData=(request)=>{
        return new Promise(async(resolve,reject)=>{
           const dev =await developers_users_schema.findOne({email:request.requestSender});
            resolve ( {request:request,requestSenderName:dev.firstName+" "+dev.lastName})
        })
    }
    const fetchDeveloperData = (listOfRequests) => {
      return new Promise((resolve, reject) => {
        const promises = listOfRequests.map(getData);
        const results = Promise.all(promises);
        results.then((data)=>{
            resolve(data)
        })
      });
    };
    fetchDeveloperData(data).then((data) => {
      res.status(200).send({
        responseMessage: "Successfully loaded the list of resolved requests",
        responseCode: FETCHED,
        responsePayload: data,
      });
    });
  } else {
    res.status(200).send({
      responseMessage: "Could not load the list of resolved requests",
      responseCode: COULD_NOT_FETCH,
      responsePayload: err,
    });
  }
};


module.exports = {
  getListOfDevelopersRequestsByAdminId,
  updateStatusOfDevConReq,
  getListOfDevelopersAccountsByAdminId,
  getListOfDeniedRequestsByAdminId,
  getListOfResolvedRequestsByAdminId,
  
};
