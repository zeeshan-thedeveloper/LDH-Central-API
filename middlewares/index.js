const { ERROR_IN_MIDDLEWARE } = require("../controllers/responses/responses");
const { developers_users_schema } = require("../mongodb/schemas/consumer-schemas/developer-users");
const { host_users_schema } = require("../mongodb/schemas/host-schemas/host-users");
const { verifyToken } = require("../token-manager/token-manager");

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
      responseCode:ERROR_IN_MIDDLEWARE
    });
  }
};

//TODO:We need to create a middle ware for checking if source host is enabled to be used. Look host url status with host id
const isHostAccessUrlEnabled = (req, res, next) => {
  const {hostAccessUrl} = req.body
  console.log(typeof hostAccessUrl)
  let hostId = hostAccessUrl.split("/")[2]; 
  if(hostId){
    host_users_schema.findOne({hostId:hostId},(err,data)=>{
      if(data){
        if(data.hostAcessUrl.status)
        next();
        else{
          res.status(502).send({
            responseMessage:"Host url is not enabled",
            responseCode:ERROR_IN_MIDDLEWARE
          }) 
        }
      }else{
        res.status(502).send({
          responseMessage:"Invalid host access url",
          responseCode:ERROR_IN_MIDDLEWARE
        }) 
      }
    })
  }else{
    res.status(502).send({
      responseMessage:"Host id is null while checking 2nd auth layer",
      responseCode:ERROR_IN_MIDDLEWARE
    })
  }
};
//TODO:We need to create a middle ware for checking if the targeted host is allowed to use or not.
const isUserAllowedToUseTheUrl=(req,res,next)=>{
  const {secretKey,hostAccessUrl} = req.body
  let hostId = hostAccessUrl.split("/")[2]; 
  
  developers_users_schema.findOne({email:secretKey},(err,data)=>{
    if(data){
      let flag=true;
      data.allowedHostAccessUrls.forEach(element => {
        if(element.listOfDatabases.includes(hostId)){
          flag=false;
          next();
          return
        }
      });
      if(flag){
        res.status(502).send({
          responseMessage:"You are not allowed to use this url",
          responseCode:ERROR_IN_MIDDLEWARE
        })  
      }
    }else{
      res.status(502).send({
        responseMessage:"Invalid secret key",
        responseCode:ERROR_IN_MIDDLEWARE
      })
    }
{}  })
}
//TODO:We need to create a middle ware for checking the query and assigned role.
const isUserAllowedToPerformRequestedQuery=(req,res,next)=>{
  const readOnlyOperators=['select']
  const writeOnlyOperators=['delete','drop','update'];
  // {
  //   roleTitle: "Read Only",
  //   roleValue: 1201,
  // },
  // {
  //   roleTitle: "Write Only",
  //   roleValue: 1202,
  // },
  // {
  //   roleTitle: "Read & Write",
  //   roleValue: 1203,
  // },
  const {secretKey,hostAccessUrl,query} = req.body
  let hostId = hostAccessUrl.split("/")[2]; 
  try{  
  let startingKeyWord=query.split(" ")[0];
  startingKeyWord=startingKeyWord.toLowerCase()
  console.log(startingKeyWord)
  developers_users_schema.findOne({email:secretKey},async(err,data)=>{
    if(data){
      let flag=true;
      await data.allowedHostAccessUrls.map((element) => {
        if(element.accessRole=="1201"){
            //read only
            if(startingKeyWord==readOnlyOperators[0]){
              next()
            }else{
              res.status(502).send({
                responseMessage:"You have the only read access role",
                responseCode:ERROR_IN_MIDDLEWARE
              })  
            }
        }
        else if(element.accessRole=="1202"){
          //write only
          if(startingKeyWord==writeOnlyOperators[0] || startingKeyWord==writeOnlyOperators[1] || startingKeyWord==writeOnlyOperators[2]){
            next()
          }else{
            res.status(502).send({
              responseMessage:"You have the only write access role",
              responseCode:ERROR_IN_MIDDLEWARE
            })  
          }
        }else if(element.accessRole=="1203"){
          //read write only
          if(startingKeyWord==writeOnlyOperators[0] || startingKeyWord==writeOnlyOperators[1] || startingKeyWord==writeOnlyOperators[2] || startingKeyWord==readOnlyOperators[0]){
            next()
          }else{
            res.status(502).send({
              responseMessage:"Please make sure you use SELECT,Update,Delete or Drop key words in sql query",
              responseCode:ERROR_IN_MIDDLEWARE
            })  
          }
        }else{
          res.status(502).send({
            responseMessage:"Invalid access role",
            responseCode:ERROR_IN_MIDDLEWARE
          })  
        }
      });
      // if(flag){
      //   res.status(502).send({
      //     responseMessage:"You are not allowed to use this url",
      //     responseCode:ERROR_IN_MIDDLEWARE
      //   })  
      // }
    }else{
      res.status(502).send({
        responseMessage:"Invalid secret key",
        responseCode:ERROR_IN_MIDDLEWARE
      })
    }
{}  })
  }catch(e){
    console.log("e")
    res.status(502).send({
      responseMessage:"Invalid query string",
      responseCode:ERROR_IN_MIDDLEWARE
    })
  }
}
module.exports = { verifyJwt,isHostAccessUrlEnabled,isUserAllowedToUseTheUrl,isUserAllowedToPerformRequestedQuery };
