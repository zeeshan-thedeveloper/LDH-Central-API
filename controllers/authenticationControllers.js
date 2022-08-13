const passport = require("passport");
const { requestsListCache } = require("../cache-store/cache");
const { firebase, admin } = require("../firebase-database/firebase-connector");
const {
  admin_users_schema,
} = require("../mongodb/schemas/admin-schemas/admin-users");
const {
  developers_users_schema,
} = require("../mongodb/schemas/consumer-schemas/developer-users");
const {
  encrypt,
  decrypt,
} = require("../encryptionAndDecryption/encryptionAndDecryption");
var emiter = require("../events-engine/Emiters");
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
var events = require("../events-engine/Events");
const {
  getItem_admin_accounts_cache,
} = require("../cache-store/cache-operations");

const {
  COULD_NOT_CREATE_ACCOUNT,
  CREATED_ACCOUNT,
  ALREADY_CREATED_ACCOUNT,
  NULL_TOKEN,
  TOKEN_NOT_VERIFIED,
  TOKEN_VERIFIED,
  COULD_NOT_FETCH,
  FETCHED,
  ACCONT_CREATED,
  DATA_UPDATED,
  DATA_NOT_UPDATED,
  COULD_NOT_LOGIN,
  LOGGED_SUCCESSFULLY,
} = require("./responses/responses");
const {
  generateTokenWithId,
  verifyToken,
} = require("../token-manager/token-manager");
const { FRONT_END_BASE_URL } = require("../request-manager/urls");
const {
  host_users_schema,
} = require("../mongodb/schemas/host-schemas/host-users");

const expires_in = "1h";

// ----------------------------- GOOGLE Auth -------------------

const onGoogleAuthSucess = (req, res) => {
  // when google authentication is successful
  console.log("Google-Auth-success", req.user);
  // res.send("google authentication is successful");
  // Change following url to vercel url
  emiter.emit(events.ADD_ITEM_admin_account_cache, req.user);
  const user_Id = encrypt(req.user.id);
  res.redirect(
    `${FRONT_END_BASE_URL}/Authentication/SignIn?id=${
      user_Id != undefined ? user_Id : ""
    }&authType=google`
  );
};

const onGoogleAuthFailure = (req, res) => {
  // when google authentication is unsuccessful
  console.log("Google-Auth-fail", req.user);
  res.send("google authentication is not successful");
};

const logoutGoogle = (req, res) => {
  req.logout(req.user, (err) => {
    if (err) return next(err);
    req.session.destroy();
    res.send("logout from google account");
  });
};

// ----------------------------- Github -----------------------------

const onGithubAuthSucess = (req, res) => {
  // when Github authentication is successful
  console.log("Github-Auth-success", req.user);
  // res.send("Github authentication is successful");
  req.user.id = req.user.nodeId;
  console.log("git user", req.user);
  emiter.emit(events.ADD_ITEM_admin_account_cache, req.user);
  const user_Id = encrypt(req.user.nodeId);

  res.redirect(
    `${FRONT_END_BASE_URL}/Authentication/SignIn?id=${
      user_Id != undefined ? user_Id : ""
    }&authType=github`
  );
};

const onGithubAuthFailure = (req, res) => {
  // when Github authentication is unsuccessful
  console.log("Github-Auth-fail", req.user);
  res.send("Github authentication is not successful");
};

const createAdminAccount = async (req, res) => {
  const { authType, user_Id, accountType } = req.body;
 
  if (authType == "google") {
    const id = decrypt(user_Id);
    if (id) {
      // If decryption is successful
      let user = getItem_admin_accounts_cache(id);
      const jwtToken = generateTokenWithId({ key: user.email }, expires_in);
      const userUid = encrypt(user.id);
      const apiKey = uuidv1();
      data = {
        firstName: user.given_name,
        lastName: user.family_name,
        email: user.email,
        profilePhotoUrl: user.picture,
        userUid: userUid,
        jwtToken: jwtToken,
        googleAccountData: JSON.stringify(user),
        githubAccountData: null,
        apiKey: apiKey,
      };
      console.log(accountType);
      let schema = 
        accountType == "admin" ? admin_users_schema : developers_users_schema;
      // lets check if account exists or not.
      const record = await schema.findOneAndUpdate(
        { email: data.email },
        { jwtToken: jwtToken },
        { new: true }
      );
      if (record) {
        res.status(200).send({
          responseMessage: "Account already exists",
          responseCode: ALREADY_CREATED_ACCOUNT,
          responsePayload: record,
        });
      } else {
        // if already account does not exist
        schema.create(data, (error, insertedData) => {
          if (!error) {
            console.log("insertedData", insertedData);
            res.status(200).send({
              responseMessage: "Account created successfully",
              responseCode: ACCONT_CREATED,
              responsePayload: insertedData,
            });
          } else {
            res.status(200).send({
              responseMessage: "Could not create account",
              responseCode: COULD_NOT_CREATE_ACCOUNT,
              responsePayload: error,
            });
          }
        });
      }
    } else {
      // if decryption is not successful
      res.status(501).send({ responseMessage: "Invalid user id" });
    }
  } else if (authType == "github") {
    const id = decrypt(user_Id);
    if (id) {
      let user = getItem_admin_accounts_cache(id);

      const jwtToken = generateTokenWithId({ key: user.username }, expires_in);
      const userUid = encrypt(user.id);
      const apiKey = uuidv1();

      data = {
        firstName: user.displayName,
        lastName: user.displayName,
        email: user.username,
        profilePhotoUrl: user.profileUrl,
        userUid: userUid,
        jwtToken: jwtToken,
        googleAccountData: null,
        githubAccountData: JSON.stringify(user),
        apiKey: apiKey,
      };

      let schema =
        accountType == "admin" ? admin_users_schema : developers_users_schema;
      // lets check if account exists or not.
      const record = await schema.findOneAndUpdate(
        { email: data.email },
        { jwtToken: jwtToken },
        { new: true }
      );
      if (record) {
        res.status(200).send({
          responseMessage: "Account already exists",
          responseCode: ALREADY_CREATED_ACCOUNT,
          responsePayload: record,
        });
      } else {
        // if already account does not exist
        schema.create(data, (error, insertedData) => {
          if (!error) {
            console.log("insertedData", insertedData);
            res.status(200).send({
              responseMessage: "Account created successfully",
              responseCode: ACCONT_CREATED,
              responsePayload: insertedData,
            });
          } else {
            res.status(200).send({
              responseMessage: "Could not create account",
              responseCode: COULD_NOT_CREATE_ACCOUNT,
              responsePayload: error,
            });
          }
        });
      }
    } else {
      res.status(501).send({ responseMessage: "Invalid user id" });
    }
  } else if (authType == "userName&Password") {
    let defaultProfile =
      "https://firebasestorage.googleapis.com/v0/b/discussion-manager.appspot.com/o/profileDeafultImages%2Fdefault_image.png?alt=media&token=432b7002-1168-4678-8339-eca37d06d25a";
    admin
      .auth()
      .createUser({
        email: req.body.email,
        phoneNumber: req.body.mobileNumber,
        password: req.body.password,
        emailVerified: false,
        displayName: req.body.firstName + req.body.lastName,
        address: null,
        onlineStatus: "online",
        photoUrl: defaultProfile,
        disabled: false,
      })

      .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        firebase
          .auth()
          .signInWithEmailAndPassword(req.body.email, req.body.password)
          .then(async (userCredential) => {
            // Signed in
            var user = userCredential.user;
            const jwtToken = generateTokenWithId(
              { key: user.email },
              expires_in
            );
            const userUid = encrypt(user.uid);
            const apiKey = uuidv1();
            data = {
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email: req.body.email,
              profilePhotoUrl: defaultProfile,
              userUid: userUid,
              jwtToken: jwtToken,
              googleAccountData: null,
              githubAccountData: null,
              apiKey: apiKey,
            };

            let schema =
              accountType == "admin"
                ? admin_users_schema
                : developers_users_schema;
            // lets check if account exists or not.
            const record = await schema.findOneAndUpdate(
              { email: data.email },
              { jwtToken: jwtToken },
              { new: true }
            );
            if (record) {
              res.status(200).send({
                responseMessage: "Account already exists",
                responseCode: ALREADY_CREATED_ACCOUNT,
                responsePayload: record,
              });
            } else {
              // if already account does not exist
              schema.create(data, (error, insertedData) => {
                if (!error) {
                  console.log("insertedData", insertedData);

                  var userL = firebase.auth().currentUser;
                  userL
                    .sendEmailVerification()
                    .then(function () {
                      // Email sent.
                      res.status(200).send({
                        responseMessage:
                          "A verification email has been sent to you kindly verify",
                        responsePayload: null,
                        responseCode: CREATED_ACCOUNT,
                      });
                    })
                    .catch(function (error) {
                      var errorCode = error.code;
                      var errorMessage = error.message;
                      console.log(error);
                      res.status(200).send({
                        responseMessage: errorMessage,
                        responseCode: COULD_NOT_CREATE_ACCOUNT,
                        responsePayload: error,
                      });
                    });
                } else {
                  admin
                    .auth()
                    .deleteUser(user.uid)
                    .then(() => {
                      res.status(200).send({
                        responseMessage: "Could not create account in mongo db",
                        responseCode: COULD_NOT_CREATE_ACCOUNT,
                        responsePayload: error,
                      });
                    })
                    .catch((error) => {
                      res.status(200).send({
                        responseMessage: "Could not create account in mongo db",
                        responseCode: COULD_NOT_CREATE_ACCOUNT,
                        responsePayload: error,
                      });
                    });
                }
              });
            }
          })
          .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            res.status(200).send({
              responseMessage: errorMessage,
              responseCode: COULD_NOT_CREATE_ACCOUNT,
              responsePayload: error,
            });
          });
      })
      .catch((error) => {
        console.log("Error creating new user:", error);
        res.status(400).send({
          responseMessage: error,
          responseCode: COULD_NOT_CREATE_ACCOUNT,
          responsePayload: error,
        });
      });
  }
};

const loginToAccount=(req,res)=>{
  const {email,password,accountType}=req.body
  try{
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
     // Signed in
    var user = userCredential.user;
    if(user.emailVerified)
    {
        
        const schema = accountType=="admin " ? admin_users_schema : developers_users_schema
        schema.findOne({email:user.email},(err,data)=>{
          if(data){
            res.status(200).send({
              responseMessage:"Login Successful",
              responseCode:LOGGED_SUCCESSFULLY,
              responsePayload:data
          })
          }else{
            res.status(200).send({
              responseMessage:"Did not find the record in central database",
              responseCode:COULD_NOT_LOGIN,
              responsePayload:null
          })
          }
        })
       
    }
    else
    {
        res.status(200).send({
            responseMessage:"Please verify email, and if you don't find email please check spam folder",
            responseCode:COULD_NOT_LOGIN,
            responsePayload:user.uid
        })
    }

    }) .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                res.status(400).send({
                    responseMessage:errorMessage,
                    responseCode:COULD_NOT_LOGIN,
                })  
    });
    }
    catch(t)
    {
        es.status(400).send({
            responseMessage:t.message,
            responseCode:COULD_NOT_LOGIN,
            responsePayload:t
        })  
    }
}

const getListOfAdminAccounts = (req, res) => {
  const { hostId } = req.body;
  console.log("here is host id " + hostId);
  admin_users_schema.find({}, (err, data) => {
    if (err) {
      res.status(200).send({
        responseCode: COULD_NOT_FETCH,
        responseMessage: "Error in fetching list of admins",
        payload: err,
      });
    } else {
      const fetchTheCompleteHost = (host) => {
        return new Promise(async (resolve, reject) => {
          const hostDetails = await host_users_schema.findOne({
            hostId: host.hostId,
          });
          console.log(hostDetails);
          resolve(hostDetails);
        });
      };

      const processAdmin = (admin) => {
        return new Promise((resolve, reject) => {
          const promises = admin.connectedHostList.map(fetchTheCompleteHost);
          const results = Promise.all(promises);
          results.then((resolvedData) => {
            let listOfConnectedHosts = resolvedData.map((host) => {
              if (host.hostId == hostId) return host;
            });
            const recordToReturn = {
              id: admin._id,
              firstName: admin.firstName,
              lastName: admin.lastName,
              email: admin.email,
              profilePhotoUrl: admin.profilePhotoUrl,
              connectedHostList: listOfConnectedHosts,
            };
            resolve(recordToReturn);
          });
        });
      };

      const processAdminObjects = (listOfAdmin) => {
        return new Promise(async (resolve, reject) => {
          const promises = listOfAdmin.map(processAdmin);
          const results = Promise.all(promises);
          results.then((resolvedData) => {
            resolve(resolvedData);
          });
        });
      };

      processAdminObjects(data).then((results) => {
        res.status(200).send({
          responseMessage: " Data fetched successfully ",
          responseCode: FETCHED,
          responsePayload: results,
        });
      });
    }
  });
};

const getListOfDeveloperAccounts = (req, res) => {
  developers_users_schema.find({}, (err, data) => {
    if (err) {
      res.status(200).send({
        responseCode: COULD_NOT_FETCH,
        responseMessage: "Error in fetching list of admins",
        payload: err,
      });
    } else {
      // console.log(data)
      let results = data.map((record) => {
        return {
          id: record._id,
          firstName: record.firstName,
          lastName: record.lastName,
          email: record.email,
          profilePhotoUrl: record.profilePhotoUrl,
        };
      });
      res.status(200).send({
        responseMessage: " Data fetched successfully ",
        responseCode: FETCHED,
        responsePayload: results,
      });
    }
  });
};

const verifyJWTToken = (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  console.log("token to verify", token);
  if (token != null) {
    const verficationResponse = verifyToken(token);
    console.log("verify token: ", verficationResponse);
    if (verficationResponse.key != undefined) {
      res.status(200).send({
        responseMessage: "Token is verified",
        responseCode: TOKEN_VERIFIED,
      });
    } else {
      // problem
      res.status(200).send({
        responseMessage: verficationResponse.message,
        responseCode: TOKEN_NOT_VERIFIED,
      });
    }
  } else {
    res.status(200).send({
      responseMessage: "Token is null",
      responseCode: TOKEN_NOT_VERIFIED,
    });
  }
};

const getJWTToken = (req, res) => {
  const { id } = req.body;
  res.status(200).send({
    responseMessage: "Token generated",
    jwtToken: generateTokenWithId({ token: id }),
  });
};

const generateAndUpdateAPIKey = async (req, res) => {
  const { email } = req.body;
  const apiKey = uuidv1();
  const record = await developers_users_schema.findOneAndUpdate(
    { email: email },
    { apiKey: apiKey },
    { new: true }
  );
  if (record) {
    console.log(record);
    res.status(200).send({
      responseMessage: "Updated the apiKey successfully",
      responseCode: DATA_UPDATED,
      responsePayload: apiKey,
    });
  } else {
    res.status(200).send({
      responseMessage: "Could not update the apiKey",
      responseCode: DATA_NOT_UPDATED,
      responsePayload: null,
    });
  }
};

// tester end-points

const test = (req, res) => {
  res.send({ responseMessage: "It is test end-point" });
};

module.exports = {
  onGithubAuthSucess,
  onGithubAuthFailure,
  onGoogleAuthSucess,
  onGoogleAuthFailure,
  logoutGoogle,
  createAdminAccount,
  getListOfAdminAccounts,
  getListOfDeveloperAccounts,
  verifyJWTToken,
  getJWTToken,
  test,
  generateAndUpdateAPIKey,
  loginToAccount
};
