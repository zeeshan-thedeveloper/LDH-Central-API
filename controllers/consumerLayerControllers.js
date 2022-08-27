const {
  admin_users_schema,
} = require("../mongodb/schemas/admin-schemas/admin-users");
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
  remote_database_endpoints_schema,
} = require("../mongodb/schemas/remote-database-endpoints/remote-database-endpoints");

const { generateTokenWithId } = require("../token-manager/token-manager");
const {
  FETCHED,
  COULD_NOT_FETCH,
  CREATED_ACCOUNT,
  COULD_NOT_CREATE_ACCOUNT,
  DATA_UPDATED,
  DATA_NOT_UPDATED,
} = require("./responses/responses");

const getListOfServiceProviders = (req, res) => {
  const { developerId } = req.body;

  admin_users_schema.find({}, async (err, data) => {
    if (err) {
      res.status(200).send({
        responseCode: COULD_NOT_FETCH,
        responseMessage: "Error in fetching list of admins",
        payload: err,
      });
    } else {
      // Promises

      const individualHostData = (host) => {
        return new Promise(async (resolve, reject) => {
          const completeHost = await host_users_schema.findOne({
            hostId: host.hostId,
          });
          resolve(completeHost);
        });
      };

      const fetchHostCompleteData = (serviceProvider) => {
        return new Promise(async (resolve, reject) => {
          var promises =
            serviceProvider.connectedHostList.map(individualHostData);
          var results = Promise.all(promises);
          let v = await results.then((data) => data);
          let numberOfOpenAPIs = await remote_database_endpoints_schema
            .find({ ownerAdminId: serviceProvider._id, isPublic: true })
            .count();
          // console.log("connected hosts list : ",serviceProvider.connectedHostList.length)
          let record = {
            serviceProviderId: serviceProvider._id,
            firstName: serviceProvider.firstName,
            lastName: serviceProvider.lastName,
            email: serviceProvider.email,
            profilePhotoUrl: serviceProvider.profilePhotoUrl,
            // connectedHostList:  [...new Map(v.map((item, key) => [item[key], item])).values()],
            connectedHostList: v,
            numberOfOpenAPIs: numberOfOpenAPIs,
          };

          resolve(record);
        });
      };

      const populateTheHostInfo = (dataFetched) => {
        return new Promise(async (resolve, reject) => {
          var promises = dataFetched.map(fetchHostCompleteData);
          var results = await Promise.all(promises);
          resolve(results);
        });
      };

      const checkForServiceProviderStatus = (listOfServiceProviders) => {
        return new Promise((resolve, reject) => {
          dev_admin_con_schema.find(
            { developerId: developerId },
            (err, listOfConnectionRequests) => {
              if (!err) {
                let recordsToSend = [];
                listOfServiceProviders.forEach((record) => {
                  let flag = false;

                  listOfConnectionRequests.forEach((conReq) => {
                    // if (conReq.adminId == record.serviceProviderId) {
                    if (conReq.adminId == record.serviceProviderId) {
                      let rec = {
                        serviceProviderId: record.serviceProviderId,
                        firstName: record.firstName,
                        lastName: record.lastName,
                        email: record.email,
                        profilePhotoUrl: record.profilePhotoUrl,
                        connectedHostList: record.connectedHostList,
                        connectionRequest: conReq,
                        numberOfOpenAPIs: record.numberOfOpenAPIs,
                      };
                      recordsToSend.push(rec);
                      flag = true;
                    }
                  });

                  if (!flag) {
                    let rec = {
                      serviceProviderId: record.serviceProviderId,
                      firstName: record.firstName,
                      lastName: record.lastName,
                      email: record.email,
                      profilePhotoUrl: record.profilePhotoUrl,
                      connectedHostList: record.connectedHostList,
                      connectionRequest: null,
                    };

                    recordsToSend.push(rec);
                  }
                });

                resolve(recordsToSend);
              } else {
                reject(err);
              }
            }
          );
        });
      };

      populateTheHostInfo(data).then((results) => {
        checkForServiceProviderStatus(results).then(
          (success) => {
            res.status(200).send({
              responseMessage: " Data fetched successfully ",
              responseCode: FETCHED,
              responsePayload: success,
            });
          },
          (error) => {
            res.status(200).send({
              responseCode: COULD_NOT_FETCH,
              responseMessage: "Error in fetching list of admins",
              payload: error,
            });
          }
        );
      });
    }
  });
};

const makeConnectionRequestToAdmin = async (req, res) => {
  const {
    adminId,
    developerId,
    developerName,
    developerEmail,
    listOfDatabases,
    requestType,
    requestId,
  } = req.body;

  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  let timeAndData =
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;

  console.log(
    "Rec values ",
    adminId + " - " + developerId + " - " + listOfDatabases
  );

  if (requestType == "new") {
    dev_admin_con_schema.create(
      {
        developerId: developerId,
        adminId: adminId,
        requestTimeAndData: timeAndData,
        listOfDatabases: listOfDatabases,
        requestStatus: "Un-resolved",
        developerName: developerName,
        developerEmail: developerEmail,
      },
      (err, data) => {
        if (data) {
          res.status(200).send({
            responseMessage: "Successfully made a connection request",
            responseCode: CREATED_ACCOUNT,
            payload: data,
          });
        } else {
          res.status(200).send({
            responseMessage: "Could not made a connection request",
            responseCode: COULD_NOT_CREATE_ACCOUNT,
            payload: err,
          });
        }
      }
    );
  } else if (requestType == "update") {
    let record = await dev_admin_con_schema.findOneAndUpdate(
      {
        _id: requestId,
      },
      {
        listOfDatabases: listOfDatabases,
      },
      {
        nre: true,
      }
    );

    if(record){
      res.status(200).send({
        responseMessage: "Request Successfully updated ",
        responseCode: DATA_UPDATED,
        payload: record,
      }); 
    }else{
      res.status(200).send({
        responseMessage: "Request could not updated ",
        responseCode: DATA_NOT_UPDATED,
        payload: null,
      }); 
    }
  }
};

const getListOfActiveHostsByDeveloperId = (req, res) => {
  const { developerId } = req.body;
  developers_users_schema.find({ _id: developerId }, async (err, data) => {
    if (data) {
      const listOfHosts = data[0].allowedHostAccessUrls;

      const fetchIndividualHostData = (hostId) => {
        return new Promise((resolve, reject) => {
          // console.log(hostId);
          host_users_schema.find({ hostId: hostId }, (err, data) => {
            if (!err) {
              // console.log(data)
              resolve(data);
            }
          });
        });
      };
      const fetchIndividualUrlData = (url) => {
        return new Promise((resolve, reject) => {
          const promises = url.listOfDatabases.map(fetchIndividualHostData);
          const results = Promise.all(promises);
          let temp = [];
          results.then((data) => {
            data.forEach((item) => {
              item.forEach((ele) => {
                // console.log(ele)
                temp.push(ele);
              });
            });

            url.listOfDatabases = temp.map((item) => item);
            console.log(url);
            resolve(url);
          });
        });
      };

      const promises = listOfHosts.map(fetchIndividualUrlData);
      const results = Promise.all(promises);
      results.then((data) => {
        res.status(200).send({
          responseMessage: "Successfully loaded the list of hosts..",
          responseCode: FETCHED,
          responsePayload: data,
        });
      });
    } else {
      res.status(200).send({
        responseMessage: "Could not  successfully loaded the list of hosts..",
        responseCode: COULD_NOT_FETCH,
        responsePayload: err,
      });
    }
  });
};

const generateTokenForDeveloper = (req, res) => {
  const { developerEmail, hostId, expiresIn } = req.body;
  console.log("Host id for generating token : ", hostId);

  //authentication schemes
  // 1- check if host is enabled for resource sharing.
  // 2- check in developer profile if this requested database is allowed.

  host_users_schema.find({ hostId: hostId }, (err, hostData) => {
    if (!err) {
      if (hostData.length > 0) {
        console.log("Data", hostData);
        // data exists
        if (hostData[0].hostAcessUrl.status == true) {
          // checking if this is allowed for targeted developer
          developers_users_schema.find(
            { email: developerEmail },
            (err, data) => {
              if (!err) {
                if (data.length > 0) {
                  // Now let's generate token
                  console.log(expiresIn);
                  const jwtToken = generateTokenWithId(
                    { key: developerEmail },
                    expiresIn
                  );
                  res.status(501).send({
                    responseMessage: "Token generated successfully",
                    responseCode: FETCHED,
                    responsePayload: { jwtToken, host: hostData },
                  });
                } else {
                  // No such record
                  res.status(501).send({
                    responseMessage: "No such data found for this email",
                    responseCode: COULD_NOT_FETCH,
                    responsePayload: null,
                  });
                }
              } else {
                res.status(501).send({
                  responseMessage: "Server internal error while loading data",
                  responseCode: COULD_NOT_FETCH,
                  responsePayload: err,
                });
              }
            }
          );
        } else {
          // status is not available
          res.status(200).send({
            responseMessage:
              "could not generated the token because host is not sharing resource",
            responseCode: COULD_NOT_FETCH,
            responsePayload: null,
          });
        }
      } else {
        // status is not available
        res.status(200).send({
          responseMessage: "could not find the host with provided host id",
          responseCode: COULD_NOT_FETCH,
          responsePayload: hostData,
        });
      }
    }
  });
};

const getTotalNumberOfConnectedDevelopersByAdminId = async (req, res) => {
  const { adminId } = req.body;
  const result = await dev_admin_con_schema
    .find({ adminId: adminId, requestStatus: "Accept" })
    .count();
  if (result) {
    res.status(200).send({
      responseMessage: "Successfully loaded number of connected developers",
      responseCode: FETCHED,
      responsePayload: result,
    });
  } else {
    res.status(200).send({
      responseMessage: "Could not loaded number of connected developers",
      responseCode: COULD_NOT_FETCH,
      responsePayload: null,
    });
  }
};

module.exports = {
  getListOfServiceProviders,
  makeConnectionRequestToAdmin,
  getListOfActiveHostsByDeveloperId,
  generateTokenForDeveloper,
  getTotalNumberOfConnectedDevelopersByAdminId,
};
