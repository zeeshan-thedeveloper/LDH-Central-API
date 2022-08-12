const {
  admin_users_schema,
} = require("../mongodb/schemas/admin-schemas/admin-users");
const {
  developers_users_schema,
} = require("../mongodb/schemas/consumer-schemas/developer-users");
const {
  remote_database_endpoints_schema,
} = require("../mongodb/schemas/remote-database-endpoints/remote-database-endpoints");

const {
  DATA_STORED,
  DATA_NOT_STORED,
  FETCHED,
  COULD_NOT_FETCH,
  DATA_NOT_UPDATED,
  DATA_UPDATED,
  DELETED,
  COULD_NOT_DELETE,
} = require("./responses/responses");

const createRemoteDatabaseEndpoint = (req, res) => {
  const { hostAccessUrl, query, databaseName, description, url, hostName } =
    req.body;
  let hostId = hostAccessUrl.split("/")[2];
  let adminId = hostAccessUrl.split("/")[3];
  const centralApiServerUrl = process.env.CENTRAL_SERVER;
  // <Host>/executeRemoteDatabaseQuery/<REQUEST_ID>/<URL>/?apiKey=""
  const urlId = Math.round(new Date().getTime() / 1000);
  //   const endpointUrl = `${centralApiServerUrl}/executeRemoteDatabaseQuery/${urlId}/${url}/?yourApikey=`;
  const endpointUrl = `/executeRemoteDatabaseQuery/${urlId}/${url}?yourApikey=`;

  remote_database_endpoints_schema.create(
    {
      urlId: urlId,
      url: url,
      hostUrl: hostAccessUrl,
      urlDescription: description,
      urlQuery: query,
      urlDatabaseName: databaseName,
      sourceHostId: hostId,
      ownerAdminId: adminId,
      endPointUrlAddress: endpointUrl,
      sourceHostName: hostName,
    },
    (err, data) => {
      if (!err) {
        res.status(200).send({
          responseMessage: "Successfully stored data in db",
          responseCode: DATA_NOT_STORED,
          responsePayload: data,
        });
      } else {
        res.status(200).send({
          responseMessage: "Error while storing data in database",
          responseCode: DATA_NOT_STORED,
          responsePayload: err,
        });
      }
    }
  );
};

const getListOfRemoteDatabaseAccessUrlsByAdminId = (req, res) => {
  const { adminId } = req.body;
  remote_database_endpoints_schema.find(
    { ownerAdminId: adminId },
    (err, data) => {
      if (!err) {
        res.status(200).send({
          responseMessage:
            "Successfully loaded list of remote database endpoints",
          responseCode: FETCHED,
          responsePayload: data.map((url) => {
            url.endPointUrlAddress =
              process.env.CENTRAL_SERVER + url.endPointUrlAddress;
            return url;
          }),
        });
      } else {
        res.status(200).send({
          responseMessage: "Could not load list of remote database endpoints",
          responseCode: COULD_NOT_FETCH,
          responsePayload: err,
        });
      }
    }
  );
};

const updateRemoteDbAccessUrlStatus = async (req, res) => {
  const { urlId, status } = req.body;
  const record = await remote_database_endpoints_schema.findOneAndUpdate(
    { urlId },
    { isEnabled: status },
    { new: true }
  );
  if (record) {
    res.status(200).send({
      responseMessage: "Updated the url status successfully",
      responseCode: DATA_UPDATED,
      responsePayload: record,
    });
  } else {
    res.status(200).send({
      responseMessage: "Could not update the url status",
      responseCode: DATA_NOT_UPDATED,
      responsePayload: null,
    });
  }
};

const updateRemoteDbAccessUrlVisibility = async (req, res) => {
  const { urlId, visibility } = req.body;
  const record = await remote_database_endpoints_schema.findOneAndUpdate(
    { urlId },
    { isPublic: visibility },
    { new: true }
  );
  if (record) {
    res.status(200).send({
      responseMessage: "Updated the url visibility  successfully",
      responseCode: DATA_UPDATED,
      responsePayload: record,
    });
  } else {
    res.status(200).send({
      responseMessage: "Could not update the url visibility",
      responseCode: DATA_NOT_UPDATED,
      responsePayload: null,
    });
  }
};

const removeRemoteDatabaseQuery = (req, res) => {
  const { urlId } = req.body;
  remote_database_endpoints_schema.deleteOne({ urlId: urlId }, (err, data) => {
    if (!err) {
      res.status(200).send({
        responseMessage: "Successfully deleted endpoint",
        responseCode: DELETED,
        responsePayload: data,
      });
    } else {
      res.status(200).send({
        responseMessage: "Could not delete endpoint",
        responseCode: COULD_NOT_DELETE,
        responsePayload: err,
      });
    }
  });
};

const getListOfAllRemoteDatabaseEndpointsByDeveloperIdId = (req, res) => {
  const { developerId } = req.body;
  developers_users_schema.findOne({ _id: developerId }, (err, data) => {
    if (data) {
      let listOfConnectedHosts = [];
      data.allowedHostAccessUrls.forEach((element) => {
        if (element.requestStatus == "Accept") {
          element.listOfDatabases.forEach((hostId) => {
            listOfConnectedHosts.push(hostId);
          });
        }
      });

      const getAdminData = (url) => {
        return new Promise(async (resolve, reject) => {
          const admin = await admin_users_schema.findOne({
            _id: url.ownerAdminId,
          });
          resolve({
            adminId: admin._id,
            adminEmail: admin.email,
            adminName: admin.firstName,
          });
        });
      };

      const processList = (listOfUrls) => {
        return new Promise((resolve, reject) => {
          const promises = listOfUrls.map(getAdminData);
          const result = Promise.all(promises);
          result.then((data) => {
            let list = listOfUrls.map((url, index) => {
              return {
                url: url,
                adminData: data[index],
                host: process.env.CENTRAL_SERVER,
              };
            });
            resolve(list);
          });
        });
      };

      const fetchConnectedUrls = (hostId) => {
        return new Promise(async (resolve, reject) => {
          const listOfUrlsByHostId =
            await remote_database_endpoints_schema.find({
              sourceHostId: hostId,
              isPublic: true,
            });
          // console.log(listOfUrlsByHostId)
          processList(listOfUrlsByHostId).then((list) => {
            resolve(list);
          });
        });
      };

      const fetchListOfHosts = (listOfHosts) => {
        return new Promise((resolve, reject) => {
          const promises = listOfHosts.map(fetchConnectedUrls);
          const results = Promise.all(promises);
          results.then((data) => {
            let listOfAllAllowedAndPublicUrls = [];
            data.forEach((urlList) => {
              urlList.forEach((item) => {
                listOfAllAllowedAndPublicUrls.push(item);
              });
            });
            console.log("data", listOfAllAllowedAndPublicUrls);
            resolve(listOfAllAllowedAndPublicUrls);
          });
        });
      };

      function getUnique(array) {
        var uniqueArray = [];

        // Loop through array values
        for (i = 0; i < array.length; i++) {
          if (uniqueArray.indexOf(array[i]) === -1) {
            uniqueArray.push(array[i]);
          }
        }
        return uniqueArray;
      }

      fetchListOfHosts(getUnique(listOfConnectedHosts)).then((data) => {
        res.status(200).send({
          responseMessage: "Loaded the list of RemoteDatabaseEndpoints",
          responseCode: FETCHED,
          responsePayload: data,
        });
      });
    } else {
      res.status(200).send({
        responseMessage: "Could not load the list of connected hosts",
        responseCode: COULD_NOT_FETCH,
        responsePayload: err,
      });
    }
  });
};

module.exports = {
  createRemoteDatabaseEndpoint,
  getListOfRemoteDatabaseAccessUrlsByAdminId,
  updateRemoteDbAccessUrlStatus,
  removeRemoteDatabaseQuery,
  getListOfAllRemoteDatabaseEndpointsByDeveloperIdId,
  updateRemoteDbAccessUrlVisibility
};
