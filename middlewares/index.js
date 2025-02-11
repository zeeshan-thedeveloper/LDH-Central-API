const {
  ERROR_IN_MIDDLEWARE,
  HOST_URL_IS_NOT_ENABLED,
  NOT_ALLOWED_TO_USE_THIS_URL,
  INVALID_OPERATION_KEY_WORDS_IN_QUERY,
  UN_AUTHORIZED_TO_PERFORM_OPERATION,
  FETCHED,
  COULD_NOT_FETCH,
} = require("../controllers/responses/responses");
const {
  developers_users_schema,
} = require("../mongodb/schemas/consumer-schemas/developer-users");
const {
  host_users_schema,
} = require("../mongodb/schemas/host-schemas/host-users");
const { verifyToken } = require("../token-manager/token-manager");
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const {
  addRequestInDeniedRequestHistory,
} = require("../request-manager/request-manager");
const { getCurrentDataAndTime } = require("../utils/utils");
const {
  admin_users_schema,
} = require("../mongodb/schemas/admin-schemas/admin-users");
const {
  decrypt,
} = require("../encryptionAndDecryption/encryptionAndDecryption");
const {
  remote_database_endpoints_schema,
} = require("../mongodb/schemas/remote-database-endpoints/remote-database-endpoints");

const verifyJwt = (req, res, next) => {
  const authToken = req.headers.authorization.split(" ")[1];
  console.log(req.body);
  if (authToken != undefined) {
    let response = verifyToken(authToken);
    console.log("response", response);
    if (response.hasOwnProperty("key")) {
      console.log("Token is verified");
      next();
    } else {
      res.status(501).send({
        responseMessage: response,
      });
    }
  } else {
    res.status(502).send({
      responseMessage: "Could not find the token in request header",
      responseCode: ERROR_IN_MIDDLEWARE,
    });
  }
};

const verifyAdminUserUid = (req, res, next) => {
  console.log(req.body);
  const { userUid, secretKey } = req.body;

  const decryptedUserUid = decrypt(userUid);
  admin_users_schema.findOne({ email: secretKey }, (err, data) => {
    if (!err) {
      const storedUserUid = decrypt(data.userUid);
      if (decryptedUserUid == storedUserUid) {
        next();
      } else {
        res.status(501).send({
          responseMessage: "Could not verify the user uid",
          responseCode: ERROR_IN_MIDDLEWARE,
          responsePayload: null,
        });
      }
    } else {
      console.log(err);
      res.status(200).send({
        responseMessage:
          "Error while fetching the admin user in middleware : verifyAdminUserUid ",
        responseCode: ERROR_IN_MIDDLEWARE,
        responsePayload: err,
      });
    }
  });
};

const isHostAccessUrlEnabled = (req, res, next) => {
  const { secretKey, hostAccessUrl, query, databaseName } = req.body;
  let hostId = hostAccessUrl.split("/")[2];
  let adminId = hostAccessUrl.split("/")[3];

  if (hostId) {
    const requestId = Math.round(new Date().getTime() / 1000);
    host_users_schema.findOne({ hostId: hostId }, (err, data) => {
      if (data) {
        if (data.hostAcessUrl.status) next();
        else {
          // Add request in request history.
          addRequestInDeniedRequestHistory(
            requestId,
            secretKey,
            hostId,
            JSON.stringify({
              query,
              databaseName,
            }),
            getCurrentDataAndTime(),
            JSON.stringify({
              statusMessage: "Host url is not enabled",
              statusCode: HOST_URL_IS_NOT_ENABLED,
            }),
            false,
            adminId
          ).then(
            (data) => {
              res.status(502).send({
                responseMessage: "Host url is not enabled",
                responseCode: HOST_URL_IS_NOT_ENABLED,
              });
            },
            (err) => {
              console.log(err);
              res.status(502).send({
                responseMessage: "Error while storing request in db",
                responseCode: ERROR_IN_MIDDLEWARE,
              });
            }
          );
        }
      } else {
        console.log(data);
        res.status(502).send({
          responseMessage: "Invalid host access url",
          responseCode: ERROR_IN_MIDDLEWARE,
        });
      }
    });
  } else {
    res.status(502).send({
      responseMessage: "Host id is null while checking 2nd auth layer",
      responseCode: ERROR_IN_MIDDLEWARE,
    });
  }
};

const isUserAllowedToUseTheUrl = (req, res, next) => {
  console.log("isUserAllowedToUseTheUrl");
  const { secretKey, hostAccessUrl, query, databaseName } = req.body;
  let hostId = hostAccessUrl.split("/")[2];
  let adminId = hostAccessUrl.split("/")[3];

  const requestId = Math.round(new Date().getTime() / 1000);

  developers_users_schema.findOne({ email: secretKey }, (err, data) => {
    if (data) {
      let flag = true;
      data.allowedHostAccessUrls.forEach((element) => {
        if (element.listOfDatabases.includes(hostId)) {
          flag = false;
          next();
          return;
        }
      });
      if (flag) {
        addRequestInDeniedRequestHistory(
          requestId,
          secretKey,
          hostId,
          JSON.stringify({
            query,
            databaseName,
          }),
          getCurrentDataAndTime(),
          JSON.stringify({
            statusMessage: "You are not allowed to use this url",
            statusCode: NOT_ALLOWED_TO_USE_THIS_URL,
          }),
          false,
          adminId
        ).then(
          (data) => {
            console.log(data);
            res.status(502).send({
              responseMessage: "You are not allowed to use this url",
              responseCode: ERROR_IN_MIDDLEWARE,
            });
          },
          (err) => {
            console.log(err);
            res.status(502).send({
              responseMessage: "Error while storing request in db",
              responseCode: ERROR_IN_MIDDLEWARE,
            });
          }
        );
      }
    } else {
      res.status(502).send({
        responseMessage: "Invalid secret key",
        responseCode: ERROR_IN_MIDDLEWARE,
      });
    }
  });
};

const isUserAllowedToPerformRequestedQuery = (req, res, next) => {
  const readOnlyOperators = ["select"];
  const writeOnlyOperators = ["insert","delete", "drop", "update","create","use"];

  const { secretKey, hostAccessUrl, query, databaseName } = req.body;
  let hostId = hostAccessUrl.split("/")[2];
  let adminId = hostAccessUrl.split("/")[3];

  try {
    let startingKeyWord = query.split(" ")[0];
    startingKeyWord = startingKeyWord.toLowerCase();
    const requestId = Math.round(new Date().getTime() / 1000);
    developers_users_schema.findOne({ email: secretKey }, async (err, data) => {
      if (data) {
        let flag = true;
        let accessRole = null;
        data.allowedHostAccessUrls.forEach((host) => {
          if ((adminId = host.adminId)) {
            accessRole = host.accessRole;
          }
        });
        if (accessRole) {
          if (accessRole == "1201") {
            //read only
            if (startingKeyWord == readOnlyOperators[0]) {
              next();
            } else if (
              startingKeyWord == writeOnlyOperators[0] ||
              startingKeyWord == writeOnlyOperators[1] ||
              startingKeyWord == writeOnlyOperators[2] ||
              startingKeyWord == writeOnlyOperators[3] ||
              startingKeyWord == writeOnlyOperators[4] ||
              startingKeyWord == writeOnlyOperators[5]
            ) {
              addRequestInDeniedRequestHistory(
                requestId,
                secretKey,
                hostId,
                JSON.stringify({
                  query,
                  databaseName,
                }),
                getCurrentDataAndTime(),
                JSON.stringify({
                  statusMessage: "You have the only read access role",
                  statusCode: UN_AUTHORIZED_TO_PERFORM_OPERATION,
                }),
                false,
                adminId
              ).then(
                (data) => {
                  res.status(502).send({
                    responseMessage: "You have the only read access role",
                    responseCode: UN_AUTHORIZED_TO_PERFORM_OPERATION,
                  });
                },
                (error) => {
                  console.log(error);
                  res.status(502).send({
                    responseMessage: "Error while storing request",
                    responseCode: ERROR_IN_MIDDLEWARE,
                  });
                }
              );
            } else {
              addRequestInDeniedRequestHistory(
                requestId,
                secretKey,
                hostId,
                JSON.stringify({
                  query,
                  databaseName,
                }),
                getCurrentDataAndTime(),
                JSON.stringify({
                  statusMessage:
                    "Please make sure you use INSERT,SELECT,Update,Delete,Create,Use or Drop key words in sql query",
                  statusCode: UN_AUTHORIZED_TO_PERFORM_OPERATION,
                }),
                false,
                adminId
              ).then(
                (data) => {
                  res.status(502).send({
                    responseMessage:
                      "Please make sure you use INSERT,SELECT,Update,Delete,Create,Use or Drop key words in sql query",
                    responseCode: UN_AUTHORIZED_TO_PERFORM_OPERATION,
                  });
                },
                (error) => {
                  console.log(error);
                  res.status(502).send({
                    responseMessage: "Error while storing value in database",
                    responseCode: ERROR_IN_MIDDLEWARE,
                  });
                }
              );
            }
          } else if (accessRole == "1202") {
            //write only
            if (
              startingKeyWord == writeOnlyOperators[0] ||
              startingKeyWord == writeOnlyOperators[1] ||
              startingKeyWord == writeOnlyOperators[2] ||
              startingKeyWord == writeOnlyOperators[3] ||
              startingKeyWord == writeOnlyOperators[4] ||
              startingKeyWord == writeOnlyOperators[5]
            ) {
              next();
            } else if (startingKeyWord == readOnlyOperators[0]) {
              addRequestInDeniedRequestHistory(
                requestId,
                secretKey,
                hostId,
                JSON.stringify({
                  query,
                  databaseName,
                }),
                getCurrentDataAndTime(),
                JSON.stringify({
                  statusMessage: "You have the only write access role",
                  statusCode: UN_AUTHORIZED_TO_PERFORM_OPERATION,
                }),
                false,
                adminId
              ).then(
                (data) => {
                  res.status(502).send({
                    responseMessage: "You have the only write access role",
                    responseCode: UN_AUTHORIZED_TO_PERFORM_OPERATION,
                  });
                },
                (error) => {
                  console.log(error);
                  res.status(502).send({
                    responseMessage: "Error while storing data in db",
                    responseCode: ERROR_IN_MIDDLEWARE,
                  });
                }
              );
            } else {
              addRequestInDeniedRequestHistory(
                requestId,
                secretKey,
                hostId,
                JSON.stringify({
                  query,
                  databaseName,
                }),
                getCurrentDataAndTime(),
                JSON.stringify({
                  statusMessage: "You have the only write access role",
                  statusCode: UN_AUTHORIZED_TO_PERFORM_OPERATION,
                }),
                false,
                adminId
              ).then(
                (data) => {
                  res.status(502).send({
                    responseMessage: "You have the only write access role",
                    responseCode: UN_AUTHORIZED_TO_PERFORM_OPERATION,
                  });
                },
                (error) => {
                  res.status(502).send({
                    responseMessage: "Error while storing data in db",
                    responseCode: ERROR_IN_MIDDLEWARE,
                  });
                }
              );
            }
          }
            else if (accessRole == "1203") {
            //read write only
            if (
              startingKeyWord == writeOnlyOperators[0] ||
              startingKeyWord == writeOnlyOperators[1] ||
              startingKeyWord == writeOnlyOperators[2] ||
              startingKeyWord == writeOnlyOperators[3] ||
              startingKeyWord == writeOnlyOperators[4] ||
              startingKeyWord == writeOnlyOperators[5] ||
              startingKeyWord == readOnlyOperators[0]
            ) {
              next();
            } else {
              addRequestInDeniedRequestHistory(
                requestId,
                secretKey,
                hostId,
                JSON.stringify({
                  query,
                  databaseName,
                }),
                getCurrentDataAndTime(),
                JSON.stringify({
                  statusMessage:
                    "Please make sure you use INSERT,SELECT,Update,Delete,Create,Use or Drop key words in sql query",
                  statusCode: INVALID_OPERATION_KEY_WORDS_IN_QUERY,
                }),
                false,
                adminId
              ).then(
                (data) => {
                  res.status(502).send({
                    responseMessage:
                      "Please make sure you use INSERT,SELECT,Update,Delete,Create,Use or Drop key words in sql query",
                    responseCode: INVALID_OPERATION_KEY_WORDS_IN_QUERY,
                  });
                },
                (error) => {
                  console.log(error);
                  res.status(502).send({
                    responseMessage: "Error while storing data in db",
                    responseCode: ERROR_IN_MIDDLEWARE,
                  });
                }
              );
            }
          } else {
            res.status(502).send({
              responseMessage: "Invalid access role",
              responseCode: ERROR_IN_MIDDLEWARE,
            });
          }
        }

        
      } else {
        res.status(502).send({
          responseMessage: "Invalid secret key",
          responseCode: ERROR_IN_MIDDLEWARE,
        });
      }
      {
      }
    });
  } catch (e) {
    console.log("e");
    res.status(502).send({
      responseMessage: "Invalid query string",
      responseCode: ERROR_IN_MIDDLEWARE,
    });
  }
};

const processAdminQuery = (req, res, next) => {
  const readOnlyOperators = ["select"];
  const writeOnlyOperators = ["insert","delete", "drop", "update","create","use"];
  const { secretKey, hostAccessUrl, query, databaseName } = req.body;
  let hostId = hostAccessUrl.split("/")[2];
  let adminId = hostAccessUrl.split("/")[3];
  let startingKeyWord = query.split(" ")[0];
  startingKeyWord = startingKeyWord.toLowerCase();
  const requestId = Math.round(new Date().getTime() / 1000);

  if (
    startingKeyWord == writeOnlyOperators[0] ||
    startingKeyWord == writeOnlyOperators[1] ||
    startingKeyWord == writeOnlyOperators[2] ||
    startingKeyWord == writeOnlyOperators[3] ||
    startingKeyWord == writeOnlyOperators[3] ||
    startingKeyWord == writeOnlyOperators[4] ||
    startingKeyWord == writeOnlyOperators[5] ||
    startingKeyWord == readOnlyOperators[0]
  ) {
    next();
  } else {
    addRequestInDeniedRequestHistory(
      requestId,
      secretKey,
      hostId,
      JSON.stringify({
        query,
        databaseName,
      }),
      getCurrentDataAndTime(),
      JSON.stringify({
        statusMessage:
          "Please make sure you use SELECT,Update,Delete,Create,Use or Drop key words in sql query",
        statusCode: INVALID_OPERATION_KEY_WORDS_IN_QUERY,
      }),
      false,
      adminId
    ).then(
      (data) => {
        res.status(502).send({
          responseMessage:
            "Please make sure you use SELECT,Update,Delete,Create,Use or Drop key words in sql query",
          responseCode: INVALID_OPERATION_KEY_WORDS_IN_QUERY,
        });
      },
      (error) => {
        console.log(error);
        res.status(502).send({
          responseMessage: "Error while storing data in db",
          responseCode: ERROR_IN_MIDDLEWARE,
        });
      }
    );
  }
};

const isRemoteDatabaseAccessUrlEnabled = (req, res, next) => {
  const urlId = req.params.urlId;
  if (urlId) {
    remote_database_endpoints_schema.findOne({ urlId: urlId }, (err, data) => {
      if (data) {
        if (data.isEnabled == "true") {
          next();
        } else {
          res.status(502).send({
            responseMessage: "Url is not enabled",
            responseCode: COULD_NOT_FETCH,
            responsePayload: null,
          });
        }
      } else {
        res.status(502).send({
          responseMessage:
            "Could not fetch any remote db access url with such url id",
          responseCode: COULD_NOT_FETCH,
          responsePayload: err,
        });
      }
    });
  } else {
    res.status(502).send({
      responseMessage: "Please provide a url ID",
      responseCode: ERROR_IN_MIDDLEWARE,
    });
  }
};

const isApiKeyValid = (req, res, next) => {
  const apiKey = req.query.yourApikey;
  const urlId = req.params.urlId;
  if (apiKey.length > 0) {
    developers_users_schema.findOne(
      { apiKey: apiKey },
      async (err, developerSendingRequest) => {
        if (developerSendingRequest) {
          const urlDetails = await remote_database_endpoints_schema.findOne({
            urlId: urlId,
          });
          // secretKey, hostAccessUrl, query, databaseName
          req.body.secretKey = developerSendingRequest.email;
          req.body.hostAccessUrl = urlDetails.hostUrl;
          req.body.query = urlDetails.urlQuery;
          req.body.databaseName = urlDetails.urlDatabaseName;
          next();
        } else {
          admin_users_schema.findOne(
            { apiKey: apiKey },
            async (err, adminSendingRequest) => {
              if (adminSendingRequest) {
                const urlDetails =
                  await remote_database_endpoints_schema.findOne({
                    urlId: urlId,
                  });
                // secretKey, hostAccessUrl, query, databaseName
                req.body.secretKey = adminSendingRequest.email;
                req.body.hostAccessUrl = urlDetails.hostUrl;
                req.body.query = urlDetails.urlQuery;
                req.body.databaseName = urlDetails.urlDatabaseName;
                next();
              } else {
                res.status(502).send({
                  responseMessage: "Not a valid api key",
                  responseCode: COULD_NOT_FETCH,
                  responsePayload: null,
                });
              }
            }
          );
        }
      }
    );
  } else {
    res.status(502).send({
      responseMessage: "Please provide a api key",
      responseCode: ERROR_IN_MIDDLEWARE,
    });
  }
};
module.exports = {
  verifyJwt,
  isHostAccessUrlEnabled,
  isUserAllowedToUseTheUrl,
  isUserAllowedToPerformRequestedQuery,
  verifyAdminUserUid,
  processAdminQuery,
  isRemoteDatabaseAccessUrlEnabled,
  isApiKeyValid,
};
