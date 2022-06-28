const passport = require('passport');
const {requestsListCache} = require('../cache-store/cache')
const { firestore, admin } = require("../firebase-database/firebase-connector");
const { admin_users_schema} = require("../mongodb/schemas/admin-schemas/admin-users");
const {developers_users_schema} = require("../mongodb/schemas/consumer-schemas/schema-users");
const {encrypt,decrypt} = require('../encryptionAndDecryption/encryptionAndDecryption')
var emiter = require('../events-engine/Emiters');
var events = require('../events-engine/Events');
const { getItem_admin_accounts_cache } = require('../cache-store/cache-operations');

const {COULD_NOT_CREATE_ACCOUNT,CREATED_ACCOUNT, ALREADY_CREATED_ACCOUNT} = require('./responses/responses');
const { generateTokenWithId } = require('../token-manager/token-manager');
// ----------------------------- GOOGLE Auth -------------------

const onGoogleAuthSucess = (req, res) => {
  // when google authentication is successful
  console.log("Google-Auth-success",req.user);
  // res.send("google authentication is successful");
  // Change following url to vercel url
  emiter.emit(events.ADD_ITEM_admin_account_cache,req.user);
  const user_Id = encrypt(req.user.id);
  res.redirect(`http://localhost:3000/Authentication/SignIn?id=${user_Id!=undefined ? user_Id : ''}&authType=google`)
}

const onGoogleAuthFailure = (req, res) => {
 // when google authentication is unsuccessful
  console.log("Google-Auth-fail",req.user);
  res.send("google authentication is not successful")
}

const logoutGoogle= (req, res) => {
  req.logout(req.user, err => {
            if(err) return next(err);
            req.session.destroy();
            res.send("logout from google account")
  });
}

// ----------------------------- Github -----------------------------

const onGithubAuthSucess = (req, res) => {
  // when Github authentication is successful
  console.log("Github-Auth-success",req.user);
  // res.send("Github authentication is successful");
  const user_Id = encrypt(req.user.nodeId);
  res.redirect(`http://localhost:3000/Authentication/SignIn?user_Id=${user_Id!=undefined ? user_Id : ''}&authType=github`)
}

const onGithubAuthFailure = (req, res) => {
 // when Github authentication is unsuccessful
  console.log("Github-Auth-fail",req.user);
  res.send("Github authentication is not successful")
}

const createAdminAccount =async (req, res) => {
  // console.log("Request Body : createAdminAccount :",req.body)
  const {authType,user_Id,accountType} = req.body;
  if(authType == "google"){
    
    const id = decrypt(user_Id);
    if(id){
      // If decryption is successful
      let user = getItem_admin_accounts_cache(id);
      // console.log("Stored user",user)
      const jwtToken = generateTokenWithId(user.id);
      const userUid = encrypt(user.id);
      data ={ 
      firstName:user.given_name,
      lastName: user.family_name,
      email: user.email,
      profilePhotoUrl:user.picture,
      userUid:userUid,
      jwtToken:jwtToken,
      googleAccountData:JSON.stringify(user),
      githubAccountData:null,
      } 
      console.log(accountType)
      let schema = (accountType=="admin") ? admin_users_schema : developers_users_schema;

      // lets check if account exists or not.
      const record =  await  schema.findOne({email:data.email})
      if(record){
        res.status(200).send({ 
          responseMessage: "Account already exists",
          responseCode:ALREADY_CREATED_ACCOUNT,
          responsePayload:record
        }); 
      }else{
          // if already account does not exist
          schema.create(data,(error,insertedData)=>{
        
        if(!error){ 
          console.log("insertedData",insertedData)
          res.status(200).send({ 
                responseMessage: "Account created successfully",
                responseCode:CREATED_ACCOUNT,
                responsePayload:insertedData
              }); 
        }
        else{
            res.status(200).send({ 
                  responseMessage: "Could not create account",
                  responseCode:COULD_NOT_CREATE_ACCOUNT,
                  responsePayload:error 
            }); 
        }
      })
      }
      
    }
    else {
      // if decryption is not successful
      res.status(501).send({ responseMessage: "Invaid user id" });  
    }
   }

  else if(authType == "github"){

  }else if(authType == "userName&Password"){

  }
};
const loginToAdminAccount = (req, res) => {
  res.status(200).send({ responseMessage: "This is method for login the admin account" });
};


// tester end-points

const test=(req,res)=>{
  res.send({responseMessage: "It is test end-point"})
}

module.exports = { 
    onGithubAuthSucess,
    onGithubAuthFailure,
    onGoogleAuthSucess,
    onGoogleAuthFailure,
    logoutGoogle,
    createAdminAccount,
    loginToAdminAccount,
    test
};
