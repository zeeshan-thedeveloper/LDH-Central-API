const Cryptr = require('cryptr');
const cryptr = new Cryptr('zeethejinandtubathechurail');
module.exports ={
    encrypt: (data)=>{
        try{
          return  cryptr.encrypt(data);
        }catch(error){
          return null;
        }
    },
    decrypt: (data)=>{
        try{
            return  cryptr.decrypt(data);
          }catch(error){
            return null;
          }
    }
}
