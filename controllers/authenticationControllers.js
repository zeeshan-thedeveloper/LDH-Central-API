const passport = require("passport");
const { requestsListCache } = require("../cache-store/cache");
const { firestore, admin } = require("../firebase-database/firebase-connector");
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
} = require("./responses/responses");
const {
  generateTokenWithId,
  verifyToken,
} = require("../token-manager/token-manager");
const { FRONT_END_BASE_URL } = require("../request-manager/urls");

const expires_in = "600s";

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
  const user_Id = encrypt(req.user.nodeId);
  res.redirect(
    `${FRONT_END_BASE_URL}/Authentication/SignIn?user_Id=${
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
  // console.log("Request Body : createAdminAccount :",req.body)
  const { authType, user_Id, accountType } = req.body;
  if (authType == "google") {
    const id = decrypt(user_Id);
    if (id) {
      // If decryption is successful
      let user = getItem_admin_accounts_cache(id);
      // console.log("Stored user",user)
      const jwtToken = generateTokenWithId({ key: user.email }, expires_in);
      const userUid = encrypt(user.id);
      data = {
        firstName: user.given_name,
        lastName: user.family_name,
        email: user.email,
        profilePhotoUrl: user.picture,
        userUid: userUid,
        jwtToken: jwtToken,
        googleAccountData: JSON.stringify(user),
        githubAccountData: null,
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
              responseCode:ACCONT_CREATED,
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
      res.status(501).send({ responseMessage: "Invaid user id" });
    }
  } else if (authType == "github") {
  } else if (authType == "userName&Password") {
  }
};
 
const getListOfAdminAccounts = (req, res) => {
  const {hostId} = req.body 
  let statusResult=''
  admin_users_schema.find({}, (err, data) => {
    if(err) {
      res
      .status(200)
      .send({ 
        responseCode:COULD_NOT_FETCH,
        responseMessage:
         "Error in fetching list of admins",
         payload: err
         });
    }
    else{
      // console.log(data)
      let results =  data.map((record)=>{
        return {
          id:record._id,
          firstName: record.firstName,
          lastName: record.lastName,
          email: record.email,  
          profilePhotoUrl:record.profilePhotoUrl ,
         connectedHostList:record.connectedHostList
        }
      })
          
      const QueryExecutter = (hostId)=>{
        return new Promise(async(resolve,reject)=>{
         const queryResult = await host_users_schema.findOne({hostId:hostId},(err,data)=>{
          if(error){
            res
            .status(200)
            .send({ 
              responseCode:COULD_NOT_FETCH,
              responseMessage:
               "Error in fetching host data from host user schema",
               payload: err
               });
          }else{
            if(data){
               resolve(data)
            }   
          } 
         }).catch((error)=>{
          reject(error);
        });
        })}


       console.log("conected host list "+results.connectedHostList)
    
      const promise = results.connectedHostList.map(QueryExecutter(hostId))
             const HostDataResult = Promise.all(promise);
             HostDataResult.then((data)=>{
                console.log(data)
                statusResult = data.map((record)=>{
                  return {
                    isConnected:data.isConnected
                  }
                })
             })
            
      
     
      res.status(200).send({ 
          responseMessage: " Data fetched successfully ",
          responseCode: FETCHED,
          responsePayload:Finalresults
      })
    }
  })

 
};




const getListOfDeveloperAccounts = (req, res) => {

  developers_users_schema.find({}, (err, data) => {
    if(err) {
      res
      .status(200)
      .send({ 
        responseCode:COULD_NOT_FETCH,
        responseMessage:
         "Error in fetching list of admins",
         payload: err
         });
    }
    else{
      // console.log(data)
      let results = data.map((record)=>{
        return {
          id:record._id,
          firstName: record.firstName,
          lastName: record.lastName,
          email: record.email,  
          profilePhotoUrl:record.profilePhotoUrl   
        }
      })
      res.status(200).send({ 
          responseMessage: " Data fetched successfully ",
          responseCode: FETCHED,
          responsePayload:results
      })
    }
  })

 
};

const verifyJWTToken = (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  console.log("token to verify", token);
  if (token != null) {
    const verficationResponse = verifyToken(token);
    console.log("verify token: ", verficationResponse);
    if (verficationResponse.key != undefined) {
      res
        .status(200)
        .send({
          responseMessage: "Token is verified",
          responseCode: TOKEN_VERIFIED,
        });
    } else {
      // problem
      res
        .status(200)
        .send({
          responseMessage: verficationResponse.message,
          responseCode: TOKEN_NOT_VERIFIED,
        });
    }
  } else {
    res
      .status(200)
      .send({
        responseMessage: "Token is null",
        responseCode: TOKEN_NOT_VERIFIED,
      });
  }
};

const getJWTToken = (req, res) => {
  const { id } = req.body;
  res
    .status(200)
    .send({
      responseMessage: "Token generated",
      jwtToken: generateTokenWithId({ token: id }),
    });
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
  
};
