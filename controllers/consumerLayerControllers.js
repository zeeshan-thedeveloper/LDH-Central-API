const {
  admin_users_schema,
} = require("../mongodb/schemas/admin-schemas/admin-users");
const {
  dev_admin_con_schema,
} = require("../mongodb/schemas/developer-and-admin-connection-schema/developer-and-admin-connection-schema");
const {
  FETCHED,
  COULD_NOT_FETCH,
  CREATED_ACCOUNT,
  COULD_NOT_CREATE_ACCOUNT,
} = require("./responses/responses");

const getListOfServiceProviders = (req, res) => {
  const { developerId } = req.body;

  admin_users_schema.find({}, (err, data) => {
    if (err) {
      res.status(200).send({
        responseCode: COULD_NOT_FETCH,
        responseMessage: "Error in fetching list of admins",
        payload: err,
      });
    } else {
      // console.log(data)

      let results = data.map((record) => {
        // check for status of connected hosts...record
        return {
          serviceProviderId: record._id,
          firstName: record.firstName,
          lastName: record.lastName,
          email: record.email,
          profilePhotoUrl: record.profilePhotoUrl,
          connectedHostList: record.connectedHostList,
        };
      });

      const checkForServiceProviderStatus = (listOfServiceProviders) => {
        return new Promise((resolve, reject) => {
          dev_admin_con_schema.find({developerId:developerId}, (err, listOfConnectionRequests) => {
            if (!err) {
              let recordsToSend = [];
              listOfServiceProviders.forEach((record) => {
                let flag = false;
                console.log("Service provider:",record)
                listOfConnectionRequests.forEach((conReq) => {
                  // if (conReq.adminId == record.serviceProviderId) {
                    if (conReq.adminId == record.serviceProviderId) {
                    let rec = {
                      serviceProviderId: record. serviceProviderId,
                      firstName: record.firstName,
                      lastName: record.lastName,
                      email: record.email,
                      profilePhotoUrl: record.profilePhotoUrl,
                      connectedHostList: record.connectedHostList,
                      connectionRequest: conReq,
                    };
                    recordsToSend.push(rec);
                    flag = true;
                  }
                });

                if (!flag) {
                  let rec = {
                    serviceProviderId: record. serviceProviderId,
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
          });
        });
      };

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
    }
  });
};

const makeConnectionRequestToAdmin = (req, res) => {
  const {
    adminId,
    developerId,
    developerName,
    developerEmail,
    listOfDatabases,
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
};

module.exports = {
  getListOfServiceProviders,
  makeConnectionRequestToAdmin,
};
