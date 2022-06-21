const admin_users_schema = require('../schemas/admin-schemas/admin-users');
// Operations
const addAdminUserToDatabase=(user,requestType)=>{
    // create user account
    let data=null;
    if(requestType=="UsernameAndPassword"){

    }
    else if(requestType=="GoogleAuthentication"){

    }
    else if(requestType=="GithubAuthentication"){

    }

    return new Promise(function(resolve, reject){
        if(data){
            admin_users_schema.create(data,(error,insertedData)=>{
                if(!error){
                    resolve(insertedData);
                }
                else{
                    reject({
                        responseMessage:"Error while creating document",
                        responsePayload:error
                    });
                }
            })
        }else{
            reject({
                responseMessage:"Invalid request type"
            })
        }
        
    })
}

module.exports = {
    addAdminUserToDatabase
}